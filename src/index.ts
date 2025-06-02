import 'reflect-metadata'
import express from 'express'
import dotenv from 'dotenv'
import { initializeApp } from './config/app.config'
import defaultErrorHandle from './middlewares/error.middleware'
import accountRoute from './routes/account.route'
import customerRoute from './routes/customer.route'
import workingSlotRoute from './routes/working_slot.route'
import laborarityRouter from './routes/laborarity.route'
import consultantPatternRouter from './routes/consultant_pattern.route'

dotenv.config()

const app = express()

// app.use(passport.initialize())

// Initialize app (database and passport)
initializeApp()
  .then((success) => {
    if (success) {
      app.use(express.json())
      // Setup routes
      console.log(new Date().toISOString())

      // route account
      app.use('/account', accountRoute)
      // route customer
      app.use('/customer', customerRoute)
      // route working slot
      app.use('/working-slot', workingSlotRoute)
      app.use('/laborarity', laborarityRouter)
      app.use('/consultant_pattern', consultantPatternRouter)
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
