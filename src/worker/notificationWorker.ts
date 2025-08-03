import cron from 'node-cron'
import redisClient from '../config/redis.config.js'
import { sendMail } from '../services/email.service.js'

const SCHEDULED_NOTIFICATIONS_KEY = 'MENSTRUAL CYCLE SCHEDULED NOTIFICATIONS' // Key của Sorted Set trong Redis
const CRON_EXPRESSION = '0 0 * * * *' // Chạy mỗi 60 phút để kiểm tra (điều chỉnh cho phù hợp)

export interface NotificationPayload {
  notificationId: string
  account_id: string
  fullName: string
  email: string
  message: string
  notificationType: string
  daysUntilPeriod: number
  predictedPeriodDate: string
}

/**
 * Xử lý các thông báo đã đến hạn từ Redis.
 */
async function processDueNotifications(): Promise<void> {
  const currentTimeInSeconds = Math.floor(Date.now() / 1000)

  try {
    const dueNotificationStrings: string[] = await redisClient.zrangebyscore(
      SCHEDULED_NOTIFICATIONS_KEY,
      0, // min score
      currentTimeInSeconds.toString() // max score
    )
    // kiểm tra xem có thông báo nào đã đến hạn không
    if (dueNotificationStrings.length === 0) {
      return
    }
    // xử lý từng thông báo đã đến hạn
    for (const notificationString of dueNotificationStrings) {
      let notificationPayload: NotificationPayload | null = null
      try {
        notificationPayload = JSON.parse(notificationString) as NotificationPayload

        const options = {
          to: notificationPayload.email,
          subject: notificationPayload.notificationType,
          text: notificationPayload.message,
          htmlPath: 'template/menstrual-cycle.html',
          placeholders: {
            USER_NAME: notificationPayload.fullName,
            DAYS_UNTIL_PERIOD: notificationPayload.daysUntilPeriod.toString(),
            PREDICTED_PERIOD_DATE: notificationPayload.predictedPeriodDate
            // CURRENT_YEAR: new Date().getFullYear().toString(),
            // SUPPORT_EMAIL: 'anhdonguyennhi@gmail.com'
          }
        }

        // gửi thông báo đến account
        await sendMail(options)

        const removedCount = await redisClient.zrem(SCHEDULED_NOTIFICATIONS_KEY, notificationString)
        if (removedCount < 0) {
          console.warn(`${notificationPayload.notificationId} is done, but cannot to delete worker`)
        }
      } catch (processingError: any) {
        console.error(
          `[${new Date().toISOString()}] Worker: Error processing individual notification: ${notificationString.substring(0, 100)}...`,
          processingError.message
        )
      }
    }
  } catch (error: any) {
    console.error(
      `[${new Date().toISOString()}] Worker: Error fetching scheduled notifications from Redis:`,
      error.message
    )
  }
}

/**
 * Khởi động worker sử dụng node-cron.
 */
export default function startNotificationWorker(): void {
  if (!cron.validate(CRON_EXPRESSION)) {
    console.error(`Invalid cron expression: ${CRON_EXPRESSION}. Worker not started at ${new Date().toISOString()}.`)
    return
  }
  console.log(
    `✅ Notification worker scheduled to run with cron expression: ${CRON_EXPRESSION} at ${new Date().toISOString()}.`
  )
  cron.schedule(
    CRON_EXPRESSION,
    async () => {
      console.log(`[${new Date().toISOString()}] Cron job triggered for notifications.`)
      await processDueNotifications()
    },
    {
      timezone: 'Asia/Ho_Chi_Minh' // (Tùy chọn) Đặt múi giờ nếu cần
    }
  )
}
