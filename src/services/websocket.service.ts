import { Server } from 'socket.io'
import Notification from 'src/models/Entity/notification.entity.js'
import { AppDataSource } from '~/config/database.config.js'
import { TypeNoti } from '~/enum/type_noti.enum.js'
import Account from '~/models/Entity/account.entity.js'

const notificationRepository = AppDataSource.getRepository(Notification)

export class SocketIOService {
  // Service này sẽ giữ một tham chiếu đến io server
  private io: Server

  constructor(io: Server) {
    this.io = io
    console.log('✅ Socket.IO Service đã được khởi tạo.')
  }

  /**
   * Hàm chính để tạo và gửi thông báo
   * @param userId ID của người dùng cần nhận
   * @param data Dữ liệu của thông báo (ví dụ: { message: '...' })
   */
  public async sendNotification(account_id: string, data: { type: TypeNoti; title: string; message: string }) {
    console.log(`Service đang gửi thông báo cho user: ${account_id}`)

    try {
      // Bước 1: Luôn luôn lưu thông báo vào DB trước
      const notification = notificationRepository.create({
        account: {
          account_id: account_id
        } as Account,
        type: data.type,
        title: data.title,
        message: data.message,
        is_read: false
      })
      await notificationRepository.save(notification)

      // Bước 2: Dùng instance `this.io` để gửi sự kiện real-time đến phòng của user
      this.io.to(account_id).emit('new_notification', JSON.stringify(notification))

      console.log(`Service đã gửi thành công thông báo real-time cho user: ${account_id}`)
    } catch (error) {
      console.error(`Lỗi trong SocketIOService khi gửi thông báo cho user ${account_id}:`, error)
    }
  }
}
