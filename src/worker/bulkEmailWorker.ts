// worker.js
import { Worker } from 'bullmq'
import redisClient from '~/config/redis.config.js'
import { AppDataSource } from '~/config/database.config.js'
import { sendBulkFromTemplate } from '~/services/email.service.js'
import Account from '~/models/Entity/account.entity.js'
import { In } from 'typeorm'

const accountRepository = AppDataSource.getRepository(Account)

console.log('🚀 Worker đang chạy và lắng nghe queue "email-campaigns"...')

// Tạo một worker mới để xử lý các job từ queue 'email-campaigns'
const worker = new Worker(
  'email-campaigns',
  async (job) => {
    console.log(`Bắt đầu xử lý job #${job?.id}, tên: ${job?.name}`)
    const { targetGroup, subject, body } = job.data

    try {
      // 1. Lấy danh sách email người nhận từ database dựa trên targetGroup
      // VÍ DỤ: Lấy tất cả user
      // QUAN TRỌNG: Lấy theo từng đợt (batch) để không làm quá tải bộ nhớ
      const batchSize = 100
      let page = 1
      let accounts

      do {
        accounts = await accountRepository.find({
          where: {
            role: In(targetGroup)
          },
          skip: (page - 1) * batchSize,
          take: batchSize
          // Thêm điều kiện where nếu cần, dựa trên targetGroup
        })

        if (accounts.length > 0) {
          console.log(`Đang gửi đến ${accounts.length} người dùng trong đợt ${page}...`)
          const emails = accounts.map((u: Account) => u.email)

          // 2. Gọi dịch vụ gửi email
          await sendBulkFromTemplate(emails, subject, body)

          // 3. (Tùy chọn) Thêm một khoảng nghỉ nhỏ giữa các đợt để tránh bị rate limit
          await new Promise((res) => setTimeout(res, 500))
        }
        page++
      } while (accounts.length === batchSize)

      console.log(`✅ Hoàn thành xử lý job #${job?.id}`)
      return { status: 'completed' }
    } catch (error) {
      console.error(`❌ Lỗi khi xử lý job #${job?.id}:`, error)
      throw error // Throw lỗi để BullMQ biết rằng job đã thất bại và có thể thử lại
    }
  },
  { connection: redisClient }
)

worker.on('failed', (job, err) => {
  console.log(`Job ${job?.id} thất bại với lỗi ${err.message}`)
})
