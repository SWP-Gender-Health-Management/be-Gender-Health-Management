import 'reflect-metadata'
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { initializeApp } from './config/app.config'
import defaultErrorHandle from './middlewares/error.middleware'
import accountRoute from './routes/account.route'
import customerRoute from './routes/customer.route'
import workingSlotRoute from './routes/working_slot.route'
import laborarityRoute from './routes/laborarity.route'
import consultantPatternRoute from './routes/consultant_pattern.route'
import consultAppointmentRoute from './routes/consult_appointment.route'
import questionRoute from './routes/question.route'
import replyRoute from './routes/reply.route'
import consultReportRoute from './routes/consult_report.route'
import feedbackRoute from './routes/feedback.route'


dotenv.config()

const app = express()

// app.use(passport.initialize())
app.use(cors({
  origin: process.env.FE_PORT
}))

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
      app.use('/working_slot', workingSlotRoute)
      // route laborarity 
      app.use('/laborarity', laborarityRoute)
      // route consultant pattern
      app.use('/consultant_pattern', consultantPatternRoute)
      // route consult appointment
      app.use('/consult_appointment', consultAppointmentRoute)
      // route question
      app.use('/question', questionRoute);
      // route reply
      app.use('/reply', replyRoute);
      // route consult report
      app.use('/consult_report', consultReportRoute);
      // route feedback
      //app.use('/feedback', feedbackRoute);
      
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
