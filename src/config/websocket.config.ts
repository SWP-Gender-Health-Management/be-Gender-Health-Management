import { Server, Socket } from 'socket.io'
import { Server as HttpServer } from 'http'
import dotenv from 'dotenv'
import { DefaultEventsMap } from 'socket.io'
import redisClient from './redis.config.js'
dotenv.config()

// Map để lưu: { accountId => socket.id }
// Bạn có thể chuyển nó vào một service hoặc Redis trong ứng dụng thực tế

export class SocketServer {
  public io: Server

  constructor(server: HttpServer) {
    // Khởi tạo Socket.IO server và gắn nó vào HTTP server
    this.io = new Server(server, {
      // Cấu hình CORS dựa trên các cuộc thảo luận trước
      cors: {
        origin: process.env.FE_ADDRESS, // Lấy từ file .env
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
      }
    })

    // Lắng nghe các kết nối
    this.io.on('connection', this.handleConnection)
  }

  /**
   * Xử lý logic khi một client mới kết nối
   * @param socket Đối tượng socket của client vừa kết nối
   */
  private handleConnection = async (socket: Socket): Promise<void> => {
    console.log(`Một người dùng đã kết nối: ${socket.id}`)

    // Lấy userId từ query khi client kết nối
    const accountId = socket.handshake.query.accountId as string

    if (accountId) {
      console.log(`User ID: ${accountId} được gán cho Socket ID: ${socket.id}`)
      const userSocketsKey = `user:sockets:${accountId}`
      const socketUserKey = `socket:user:${socket.id}`

      // Mapping 1:1: Thêm socket.id vào Set của userId
      await redisClient.set(userSocketsKey, socketUserKey)
    }

    // --- ĐỊNH NGHĨA CÁC EVENT LISTENER CỦA BẠN TẠI ĐÂY ---

    // // Ví dụ: Lắng nghe một sự kiện 'send_message'
    // socket.on('send_message', async (data: { recipientId: string; message: string }) => {
    //   console.log('Server nhận được tin nhắn:', data)

    //   const recipientSocketId = await redisClient.get(data.recipientId)
    //   if (recipientSocketId) {
    //     // Gửi tin nhắn đến một người dùng cụ thể
    //     this.io.to(recipientSocketId).emit('receive_message', {
    //       senderId: accountId,
    //       message: data.message
    //     })
    //   } else {
    //     console.log(`Người nhận ${data.recipientId} không online.`)
    //     // Tại đây bạn có thể lưu tin nhắn vào DB để gửi sau
    //   }
    // })

    // Xử lý khi client ngắt kết nối
    socket.on('disconnect', async (): Promise<void> => {
      console.log(`Người dùng đã ngắt kết nối: ${socket.id}`)
      if (accountId) {
        const userSocketsKey = `user:sockets:${accountId}`
        await redisClient.del(userSocketsKey)
        console.log(`Đã xóa User ID: ${accountId} khỏi map.`)
      }
    })
  }

  /**
   * Gửi thông báo đến một người dùng cụ thể bằng userId
   * @param accountId ID của người dùng cần nhận thông báo
   * @param eventName Tên của sự kiện (ví dụ: 'new_notification')
   * @param data Dữ liệu cần gửi
   */
  public async sendMessageToUser(accountId: string, eventName: string, data: any): Promise<void> {
    const socketId = (await redisClient.get(accountId)) as string
    if (socketId) {
      this.io.to(socketId).emit(eventName, data)
      console.log(`Đã gửi sự kiện '${eventName}' đến người dùng ${accountId}`)
    } else {
      console.log(`Không thể gửi sự kiện '${eventName}' vì người dùng ${accountId} không online.`)
    }
  }
}
