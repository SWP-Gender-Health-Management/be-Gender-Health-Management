import { AppDataSource } from './database.config.js'
import startNotificationWorker from '~/worker/notificationWorker.js'
export const initializeApp = async () => {
  try {
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
      console.log('✅ Database connection established')
    }
    // Initialize notification worker
    startNotificationWorker()
    return true
  } catch (error) {
    console.error('Error initializing app:', error)
    return false
  }
}
