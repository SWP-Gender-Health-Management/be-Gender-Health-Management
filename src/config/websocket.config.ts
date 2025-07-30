import { Server, Socket } from 'socket.io'
import { Server as HttpServer } from 'http'
import { createAdapter } from '@socket.io/redis-adapter'
import redisClient from './redis.config.js'
import { config } from 'dotenv'
import { NotificationType } from '~/models/Entity/notification.entity.js'
config()

export class SocketServer {
  public io: Server

  constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FE_ADDRESS,
        methods: ['GET', 'POST'],
        credentials: true
      }
    })

    // Đây là bộ não giúp Rooms hoạt động trên nhiều server
    const pubClient = redisClient.duplicate()
    const subClient = redisClient.duplicate()

    this.io.adapter(createAdapter(pubClient, subClient))

    // Lắng nghe các kết nối
    this.io.on('connection', this.handleConnection)
  }

  /**
   * Xử lý kết nối của client
   * @param socket - Socket được tạo khi client kết nối
   */
  public handleConnection = (socket: Socket): void => {
    console.log(`Một người dùng đã kết nối: ${socket.id}`)

    const account_id = socket.handshake.query.account_id as string

    if (account_id) {
      // Cho socket vào một "phòng" có tên là chính account_id của họ
      socket.join(account_id)
      console.log(`Socket ${socket.id} đã tham gia vào phòng của user ${account_id}`)
    }

    socket.on('send_private_notification', (data: { recipientId: string; noti: NotificationType }) => {
      // DÙNG Room để nhắm đến người nhận và DÙNG Event để gửi dữ liệu đi
      // Gửi sự kiện 'new_private_message' đến phòng của người nhận
      this.io.to(data.recipientId).emit('new_private_notification', {
        sender: account_id,
        noti: data.noti
      })
    })

    // Socket.IO sẽ tự động xóa socket khỏi các phòng khi nó ngắt kết nối.
    socket.on('disconnect', () => {
      console.log(`Người dùng đã ngắt kết nối: ${socket.id}`)
    })
  }
}
