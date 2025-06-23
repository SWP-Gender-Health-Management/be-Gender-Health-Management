import { Server, Socket } from 'socket.io'
import { Server as HttpServer } from 'http'
import { createAdapter } from '@socket.io/redis-adapter' // Import adapter
import redisClient from './redis.config.js' // Dùng redis client

import dotenv from 'dotenv'
dotenv.config()

// Map để lưu: { accountId => socket.id }
// Bạn có thể chuyển nó vào một service hoặc Redis trong ứng dụng thực tế

export class SocketServer {
  public io: Server

  constructor(server: HttpServer) {
    // Khởi tạo Socket.IO server và gắn nó vào HTTP server
    this.io = new Server(server, {
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
      console.log(`User ID: ${accountId} được gán cho  Socket ID: ${socket.id}`)
      const userSocketsKey = `user:sockets:${accountId}`
      const socketUserKey = `socket:user:${socket.id}`

      // Mapping 1:1: Thêm socket.id vào Set của userId
      await redisClient.set(userSocketsKey, socketUserKey)
    }

    // --- ĐỊNH NGHĨA CÁC EVENT LISTENER CỦA BẠN TẠI ĐÂY ---
    // Ví dụ: Lắng nghe một sự kiện 'send_message'
    socket.on('send_message', async (data: { recipientId: string; message: string }) => {
      console.log('Server nhận được tin nhắn:', data)

      const recipientSocketId = await redisClient.get(data.recipientId)
      if (recipientSocketId) {
        // Gửi tin nhắn đến một người dùng cụ thể
        this.io.to(recipientSocketId).emit('receive_message', {
          senderId: accountId,
          message: data.message
        })
      } else {
        console.log(`Người nhận ${data.recipientId} không online.`)
        // Tại đây bạn có thể lưu tin nhắn vào DB để gửi sau
      }
    })

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
    const userSocketsKey = `user:sockets:${accountId}`

    // Lấy tất cả socket.id đang hoạt động của người dùng
    const socketId = await redisClient.get(userSocketsKey)

    if (socketId && socketId.length > 0) {
      // Gửi đến kết nối của người dùng đó
      // io.to() có thể nhận một mảng các socket id
      this.io.to(socketId).emit(eventName, data)
      console.log(`Đã gửi sự kiện '${eventName}' đến ${socketId} kết nối của người dùng ${accountId}`)
    } else {
      console.log(`Không tìm thấy kết nối nào cho người dùng ${accountId} để gửi sự kiện '${eventName}'.`)
      // Tại đây bạn có thể lưu thông báo vào DB để họ xem khi online lại
    }
  }
}
