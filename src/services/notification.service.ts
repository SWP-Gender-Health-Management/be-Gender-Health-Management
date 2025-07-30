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
      title: 'Hệ thống',
      message: 'Bạn có thông báo mới'
    })
    const savedNoti = await notificationRepository.save(noti)
    console.log('savedNoti', savedNoti)
    await websocketService.sendNotification(account_id, savedNoti)
    return noti
  }

  async getNotification(
    account_id: string,
    skip: string,
    limit: string
  ): Promise<{ noti: Notification[]; total: number }> {
    const skipNumber = parseInt(skip)
    const limitNumber = parseInt(limit)
    const [noti, total] = await notificationRepository.findAndCount({
      where: {
        account: { account_id: account_id }
      },
      order: {
        created_at: 'DESC'
      },
      skip: skipNumber,
      take: limitNumber
    })

    return { noti, total }
  }

  async readAllNoti(account_id: string) {
    await notificationRepository.update(
      {
        account: { account_id: account_id },
        is_read: false
      },
      { is_read: true }
    )
    return { message: 'All notifications read' }
  }
}

export default new NotificationService()
