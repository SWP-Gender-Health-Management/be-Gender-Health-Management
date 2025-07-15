import { faker } from '@faker-js/faker'
import { AppDataSource } from '../config/database.config.js'
import NotificationService from '../services/notification.service.js'
import { TypeNoti } from '../enum/type_noti.enum.js'

const ACCOUNT_ID = '2e7f0017-083d-4b04-8cb7-693723d99c96'
const NOTI_COUNT = 20

const typeNotiValues = Object.values(TypeNoti)

const titleTemplates = {
  CREATE_ACCOUNT: 'Chào mừng bạn đến với GenderCare!',
  CONSULT_APPOINTMENT: 'Lịch hẹn tư vấn mới',
  LABORATORY_APPOINTMENT: 'Lịch xét nghiệm mới',
  BLOG: 'Bài viết mới từ GenderCare',
  FEEDBACK: 'Bạn có phản hồi mới',
  TRANSACTION: 'Cập nhật giao dịch của bạn'
}

const messageTemplates = {
  CREATE_ACCOUNT: 'Tài khoản của bạn đã được tạo thành công. Hãy xác thực email để sử dụng đầy đủ dịch vụ.',
  CONSULT_APPOINTMENT: 'Bạn có một lịch hẹn tư vấn mới. Vui lòng kiểm tra chi tiết trong ứng dụng.',
  LABORATORY_APPOINTMENT: 'Bạn có một lịch xét nghiệm mới. Đừng quên đến đúng giờ!',
  BLOG: 'Có bài viết mới về sức khỏe bạn có thể quan tâm.',
  FEEDBACK: 'Bạn vừa nhận được phản hồi từ hệ thống. Hãy kiểm tra ngay.',
  TRANSACTION: 'Giao dịch của bạn đã được cập nhật trạng thái. Vui lòng kiểm tra.'
}

async function createFakeNotifications() {
  try {
    await AppDataSource.initialize()
    console.log('Database connected successfully')

    for (let i = 0; i < NOTI_COUNT; i++) {
      const type = typeNotiValues[Math.floor(Math.random() * typeNotiValues.length)]
      const title = titleTemplates[type] || faker.lorem.sentence()
      const message = messageTemplates[type] || faker.lorem.sentences(2)

      await NotificationService.createNotification(
        {
          type,
          title,
          message
        },
        ACCOUNT_ID
      )
      console.log(`Created notification ${i + 1}: [${type}] ${title}`)
    }
    console.log(`✅ Successfully created ${NOTI_COUNT} notifications for account ${ACCOUNT_ID}`)
  } catch (error) {
    console.error('❌ Error creating notifications:', error)
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
      console.log('Database connection closed')
    }
    process.exit(0)
  }
}

createFakeNotifications()
