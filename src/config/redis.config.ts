// src/redis-client.ts

import { createClient } from 'redis'
import { config } from 'dotenv'
config()
// Lấy URL từ biến môi trường để linh hoạt hơn
const host = process.env.HOST as string
const port = process.env.REDIS_PORT as string

console.log('Đang kết nối đến Redis...')
const redisClient = createClient({ url: `redis://${host}:${port}` })

redisClient.on('error', (err) => console.error('Lỗi Redis Client:', err))
redisClient.on('connect', () => console.log('✅ Đã kết nối Redis thành công!'))

// Chỉ cần kết nối một lần
redisClient.connect()

// Export client đã kết nối để toàn bộ ứng dụng có thể dùng
export default redisClient
