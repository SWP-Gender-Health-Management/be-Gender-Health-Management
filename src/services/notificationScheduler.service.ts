// src/services/notificationScheduler.service.ts
import redisClient from '../config/redis.config.js'
import { NotificationPayload } from '../worker/notificationWorker.js'

const SCHEDULED_NOTIFICATIONS_KEY = 'MENSTRUAL CYCLE SCHEDULED NOTIFICATIONS' // Key của Sorted Set trong Redis

export async function scheduleNotification(
  notificationTime: Date, // Thời điểm muốn gửi thông báo
  payload: NotificationPayload
): Promise<string> {
  // 1. Chuyển thời gian gửi thành Unix timestamp (giây) để làm SCORE
  const timestampInSeconds = Math.floor(new Date(notificationTime).getTime() / 1000)

  const memberValue = JSON.stringify({
    ...payload, // Bao gồm userId, message, notificationType từ input
    originalScheduledTime: new Date(notificationTime).toISOString() // Lưu thời gian gốc
  })

  try {
    // 3. Sử dụng ZADD để lưu vào Redis
    await redisClient.zadd(
      SCHEDULED_NOTIFICATIONS_KEY, // Tên Sorted Set
      timestampInSeconds.toString(), // Score (thời điểm gửi, dưới dạng string cho ioredis)
      memberValue // Member (chi tiết thông báo dưới dạng JSON string)
    )
    console.log(`Added ${payload.notificationId} to scheduled notifications at ${notificationTime.toISOString()}`)
    return payload.notificationId
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error scheduling notification:`, error)
    throw error
  }
}
