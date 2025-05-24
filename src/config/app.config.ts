import { AppDataSource } from './database.config'

export const initializeApp = async () => {
  try {
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
      console.log('Database connection established')
    }

    return true
  } catch (error) {
    console.error('Error initializing app:', error)
    return false
  }
}
