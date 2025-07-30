import { config } from 'dotenv'
import { Redis } from 'ioredis'

config()
// Lấy URL từ biến môi trường để linh hoạt hơn
const host = process.env.HOST as string
const port = process.env.REDIS_PORT as string
const url = `redis://${host}:${port}`

console.log('Đang kết nối đến Redis...')
const redisClient = new Redis(url, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true
})

// Lắng nghe các sự kiện để theo dõi trạng thái kết nối
redisClient.on('connect', () => {
  console.log('✅ Đã kết nối thành công đến Redis server bằng IORedis!')
})

redisClient.on('error', (err: any) => {
  console.error('Lỗi kết nối IORedis:', err)
})

// Export instance duy nhất để toàn bộ ứng dụng có thể tái sử dụng
export default redisClient
