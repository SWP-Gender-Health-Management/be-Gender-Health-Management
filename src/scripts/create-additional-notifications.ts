import { faker } from '@faker-js/faker'
import { AppDataSource } from '../config/database.config.js'
import NotificationService from '../services/notification.service.js'
import { TypeNoti } from '../enum/type_noti.enum.js'

const ACCOUNT_ID = '2e7f0017-083d-4b04-8cb7-693723d99c96'
const NOTI_COUNT = 15
const START_DATE = new Date('2024-07-13')
const END_DATE = new Date('2024-07-27')

const typeNotiValues = Object.values(TypeNoti)

const titleTemplates = {
  CREATE_ACCOUNT: 'Chào mừng bạn đến với GenderCare!',
  CONSULT_APPOINTMENT: [
    'Lịch hẹn tư vấn mới đã được đặt',
    'Nhắc nhở: Cuộc hẹn tư vấn sắp diễn ra',
    'Xác nhận lịch hẹn tư vấn',
    'Thay đổi lịch hẹn tư vấn'
  ],
  LABORATORY_APPOINTMENT: [
    'Lịch xét nghiệm mới đã được đặt',
    'Nhắc nhở: Lịch xét nghiệm ngày mai',
    'Kết quả xét nghiệm đã có',
    'Xác nhận lịch hẹn xét nghiệm'
  ],
  BLOG: [
    'Bài viết mới: Chăm sóc sức khỏe sinh sản',
    'Blog: Kiến thức về STI',
    'Bài viết về sức khỏe phụ nữ',
    'Cập nhật kiến thức y tế mới nhất'
  ],
  FEEDBACK: [
    'Bạn có phản hồi mới về dịch vụ',
    'Đánh giá của bạn đã được phản hồi',
    'Cảm ơn bạn đã đánh giá dịch vụ',
    'Phản hồi từ bác sĩ tư vấn'
  ],
  TRANSACTION: [
    'Thanh toán thành công',
    'Hóa đơn mới đã được tạo',
    'Cập nhật trạng thái thanh toán',
    'Xác nhận giao dịch'
  ]
}

const messageTemplates = {
  CREATE_ACCOUNT: 'Tài khoản của bạn đã được tạo thành công. Hãy xác thực email để sử dụng đầy đủ dịch vụ.',
  CONSULT_APPOINTMENT: [
    'Bạn có một lịch hẹn tư vấn mới vào ngày {date}. Vui lòng kiểm tra chi tiết trong ứng dụng.',
    'Cuộc hẹn tư vấn của bạn sẽ diễn ra trong 24 giờ tới. Đừng quên tham gia đúng giờ!',
    'Lịch hẹn tư vấn của bạn đã được xác nhận. Bác sĩ sẽ liên hệ với bạn vào thời gian đã hẹn.',
    'Lịch hẹn tư vấn của bạn đã được thay đổi. Vui lòng kiểm tra thời gian mới.'
  ],
  LABORATORY_APPOINTMENT: [
    'Bạn có một lịch xét nghiệm mới vào ngày {date}. Vui lòng đến đúng giờ và nhớ nhịn ăn nếu cần thiết.',
    'Lịch xét nghiệm của bạn sẽ diễn ra vào ngày mai. Đừng quên mang theo giấy tờ cần thiết!',
    'Kết quả xét nghiệm của bạn đã sẵn sàng. Bạn có thể xem chi tiết trong ứng dụng.',
    'Lịch hẹn xét nghiệm của bạn đã được xác nhận. Vui lòng đến đúng giờ.'
  ],
  BLOG: [
    'Chúng tôi vừa đăng một bài viết mới về chăm sóc sức khỏe sinh sản. Hãy đọc để có thêm kiến thức bổ ích!',
    'Bài viết mới về phòng chống STI đã được đăng tải. Cùng tìm hiểu để bảo vệ sức khỏe của bạn.',
    'Có bài viết mới về sức khỏe phụ nữ mà bạn có thể quan tâm. Đừng bỏ lỡ những thông tin hữu ích!',
    'Cập nhật kiến thức y tế mới nhất từ các chuyên gia. Hãy đọc ngay để luôn được cập nhật!'
  ],
  FEEDBACK: [
    'Bạn vừa nhận được phản hồi từ đội ngũ hỗ trợ. Hãy kiểm tra để biết thêm chi tiết.',
    'Cảm ơn bạn đã đánh giá dịch vụ của chúng tôi. Chúng tôi đã phản hồi lại đánh giá của bạn.',
    'Đánh giá của bạn rất có ý nghĩa với chúng tôi. Cảm ơn bạn đã dành thời gian chia sẻ!',
    'Bác sĩ tư vấn đã phản hồi lại đánh giá của bạn. Hãy xem để biết thêm thông tin.'
  ],
  TRANSACTION: [
    'Thanh toán của bạn đã được xử lý thành công. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!',
    'Hóa đơn mới đã được tạo cho dịch vụ bạn sử dụng. Vui lòng kiểm tra chi tiết thanh toán.',
    'Trạng thái thanh toán của bạn đã được cập nhật. Bạn có thể xem chi tiết trong lịch sử giao dịch.',
    'Giao dịch của bạn đã được xác nhận. Dịch vụ sẽ được kích hoạt trong thời gian sớm nhất.'
  ]
}

function getRandomDateBetween(start: Date, end: Date): Date {
  const startTime = start.getTime()
  const endTime = end.getTime()
  const randomTime = startTime + Math.random() * (endTime - startTime)
  return new Date(randomTime)
}

function getRandomTemplate(templates: string | string[]): string {
  if (typeof templates === 'string') return templates
  return templates[Math.floor(Math.random() * templates.length)]
}

async function createAdditionalNotifications() {
  try {
    await AppDataSource.initialize()
    console.log('Database connected successfully')
    console.log(`Creating ${NOTI_COUNT} notifications from ${START_DATE.toDateString()} to ${END_DATE.toDateString()}`)

    for (let i = 0; i < NOTI_COUNT; i++) {
      const type = typeNotiValues[Math.floor(Math.random() * typeNotiValues.length)]
      const title = getRandomTemplate(titleTemplates[type])
      const message = getRandomTemplate(messageTemplates[type])
      const createdAt = getRandomDateBetween(START_DATE, END_DATE)

      // Format message with date if needed
      const formattedMessage = message.replace('{date}', createdAt.toLocaleDateString('vi-VN'))

      await NotificationService.createNotification(
        {
          type,
          title,
          message: formattedMessage
        },
        ACCOUNT_ID
      )

      console.log(`Created notification ${i + 1}: [${type}] ${title} - ${createdAt.toDateString()}`)
    }

    console.log(`✅ Successfully created ${NOTI_COUNT} additional notifications for account ${ACCOUNT_ID}`)
  } catch (error) {
    console.error('❌ Error creating additional notifications:', error)
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
      console.log('Database connection closed')
    }
    process.exit(0)
  }
}

createAdditionalNotifications()
