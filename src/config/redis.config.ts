import Redis, { RedisOptions } from 'ioredis'
import dotenv from 'dotenv'

dotenv.config()

// Lấy thông tin cấu hình từ biến môi trường (khuyến nghị)
const redisHost = process.env.HOST
const redisPort = parseInt(process.env.REDIS_PORT as string, 10)
const redisPassword = process.env.REDIS_PASSWORD || undefined // Để undefined nếu không có mật khẩu

const redisOptions: RedisOptions = {
  host: redisHost,
  port: redisPort,
  password: redisPassword,
  // Các tùy chọn khác nếu cần:
  // lazyConnect: true, // Chỉ kết nối khi có lệnh đầu tiên được thực thi
  // db: 0, // Chọn database Redis (mặc định là 0)
  // connectTimeout: 10000, // Thời gian chờ kết nối (ms)
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000) // Thử lại sau mỗi 50ms, tối đa 2s
    return delay
  }
}

const redisClient = new Redis(redisOptions)

redisClient.on('connect', () => {
  console.log(`Connected to Redis at ${redisHost}:${redisPort}`)
})

redisClient.on('error', (err: any) => {
  console.error('Redis connection error:', err)
  // Bạn có thể thêm logic xử lý lỗi ở đây, ví dụ: thoát ứng dụng nếu không thể kết nối
  // process.exit(1);
})

// Sẵn sàng để sử dụng (optional, chỉ để kiểm tra)
redisClient.on('ready', () => {
  console.log('Redis client is ready to use.')
})

export default redisClient
