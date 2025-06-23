import { Server, Socket } from 'socket.io'
import { Server as HttpServer } from 'http'
import { createAdapter } from '@socket.io/redis-adapter'
import redisClient from './redis.config.js'
import { config } from 'dotenv'
config()

export class SocketServer {
  public io: Server

  constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FE_ADDRESS,
        credentials: true
      }
    })

    // Đây là bộ não giúp Rooms hoạt động trên nhiều server
    const pubClient = redisClient.duplicate()
    const subClient = redisClient.duplicate()

    Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
      this.io.adapter(createAdapter(pubClient, subClient))
    })

    // Lắng nghe các kết nối
    this.io.on('connection', this.handleConnection)
  }

  /**
   * Xử lý logic khi một client mới kết nối
   */
  private handleConnection = (socket: Socket): void => {
    console.log(`Một người dùng đã kết nối: ${socket.id}`)

    const accountId = socket.handshake.query.accountId as string

    if (accountId) {
      // Đơn giản hóa: Cho socket vào một "phòng" có tên là chính userId của họ
      socket.join(accountId)
      console.log(`Socket ${socket.id} đã tham gia vào phòng của user ${accountId}`)
    }

    socket.on('send_private_notification', (data: { recipientId: string; message: string }) => {
      // 3. DÙNG Room để nhắm đến người nhận và DÙNG Event để gửi dữ liệu đi
      // Gửi sự kiện 'new_private_message' đến phòng của người nhận
      this.io.to(data.recipientId).emit('new_private_notification', {
        sender: accountId,
        message: data.message
      })
    })

    // Socket.IO sẽ tự động xóa socket khỏi các phòng khi nó ngắt kết nối.
    socket.on('disconnect', () => {
      console.log(`Người dùng đã ngắt kết nối: ${socket.id}`)
    })
  }

  /**
   * Gửi thông báo đến một người dùng cụ thể bằng cách gửi đến phòng của họ
   */
  public sendMessageToUser(recipientId: string, eventName: string, data: any): void {
    // Gửi thẳng sự kiện đến phòng có tên là userId
    this.io.to(recipientId).emit(eventName, data)
    console.log(`Đã gửi sự kiện '${eventName}' đến phòng của người dùng ${recipientId}`)
  }
}
