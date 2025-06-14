import 'reflect-metadata'
import express from 'express'
import dotenv from 'dotenv'
import { initializeApp } from './config/app.config.js'
import defaultErrorHandle from './middlewares/error.middleware.js'
import accountRoute from './routes/account.route.js'
import customerRoute from './routes/customer.route.js'
import workingSlotRoute from './routes/working_slot.route.js'
import staffPatternRoute from './routes/staff-pattern.route.js'
import adminRoute from './routes/admin.route.js'
import laborarityRoute from './routes/laborarity.route.js'
import transactionRoute from './routes/transaction.route.js'
import staffRoute from './routes/staff.route.js'
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
      app.use(express.urlencoded({ extended: true })) // Để parse URL-encoded body
      // route account
      app.use('/account', accountRoute)
      // route admin
      app.use('/admin', adminRoute)
      // route customer
      app.use('/customer', customerRoute)
      //route staff
      app.use('/staff', staffRoute)
      // route working slot
      app.use('/working-slot', workingSlotRoute)
      // route staff pattern
      app.use('/staff-pattern', staffPatternRoute)
      // route laborarity
      app.use('/laborarity', laborarityRoute)
      // route transaction
      app.use(express.urlencoded({ extended: true }))
      app.use('/transaction/payos', transactionRoute)
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
