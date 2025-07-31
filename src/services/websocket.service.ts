import { Server } from 'socket.io'
import Notification from '../models/Entity/notification.entity.js'
import { AppDataSource } from '../config/database.config.js'

const notificationRepository = AppDataSource.getRepository(Notification)

export class SocketIOService {
  // Service này sẽ giữ một tham chiếu đến io server
  private io: Server

  constructor(io: Server) {
    this.io = io
    console.log('✅✅✅ Socket.IO Service đã được khởi tạo.')
  }

  /**
   * Hàm chính để tạo và gửi thông báo
   * @param userId ID của người dùng cần nhận
   * @param data Dữ liệu của thông báo (ví dụ: { message: '...' })
   */
  public async sendNotification(account_id: string, data: Notification) {
    console.log(`Service đang gửi thông báo cho user: ${account_id}`)

    try {
      if (data.account.account_id !== account_id) {
        // throw new Error('Notification not found')
        return
      }
      // Bước 1: Luôn luôn lưu thông báo vào DB trước
      const notification = await notificationRepository.findOne({
        where: {
          account: {
            account_id: account_id
          },
          noti_id: data.noti_id
        }
      })
      if (!notification) {
        throw new Error('Notification not found')
      }

      // Bước 2: Dùng instance `this.io` để gửi sự kiện real-time đến phòng của user
      this.io.to(account_id).emit(data.title, JSON.stringify(notification))

      console.log(`Service đã gửi thành công thông báo real-time cho user: ${account_id}`)
    } catch (error) {
      console.error(`Lỗi trong SocketIOService khi gửi thông báo cho user ${account_id}:`, error)
    }
  }
}
