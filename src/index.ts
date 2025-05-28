import 'reflect-metadata'
import express from 'express'
import dotenv from 'dotenv'
import { initializeApp } from './config/app.config'
import defaultErrorHandle from './middlewares/error.middleware'
import accountRoute from './routes/account.route'

dotenv.config()

const app = express()

// app.use(passport.initialize())

// Initialize app (database and passport)
initializeApp()
  .then((success) => {
    if (success) {
      app.use(express.json())
      // Setup routes
      app.use('/account', accountRoute)
      app.use(defaultErrorHandle)

      // Start server
      const port = process.env.PORT || 3000
      app.listen(port, () => {
        console.log(`Server is running on port: ${port}`)
      })
    } else {
      console.error('Failed to initialize app')
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error('Error starting server:', error)
    process.exit(1)
  })
