import { websocketService } from '~/index.js'
import { AppDataSource } from '../config/database.config.js'
import Notification from '../models/Entity/notification.entity.js'

const notificationRepository = AppDataSource.getRepository(Notification)

class NotificationService {
  async createNotification(notification: any, account_id: string): Promise<Notification> {
    const noti = notificationRepository.create({
      account: {
        account_id: account_id
      },
      type: notification.type,
      title: notification.title,
      message: notification.message
    })
    const savedNoti = await notificationRepository.save(noti)
    await websocketService.sendNotification(account_id, savedNoti)
    return noti
  }

  async getNotification(account_id: string): Promise<Notification[]> {
    const noti = await notificationRepository.find({
      where: {
        account: { account_id: account_id }
      },
      order: {
        created_at: 'DESC'
      }
    })
    return noti
  }
}

export default new NotificationService()
