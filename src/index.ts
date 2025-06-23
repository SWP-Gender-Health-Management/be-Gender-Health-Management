import 'reflect-metadata'
import express from 'express'
import http from 'http'
import dotenv from 'dotenv'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import swaggerSpec from './config/swagger.js'
import { initializeApp } from './config/app.config.js'
import defaultErrorHandle from './middlewares/error.middleware.js'
import accountRoute from './routes/account.route.js'
import customerRoute from './routes/customer.route.js'
import workingSlotRoute from './routes/working_slot.route.js'
import staffPatternRoute from './routes/staff_pattern.route.js'
import adminRoute from './routes/admin.route.js'
import transactionRoute from './routes/transaction.route.js'
import staffRoute from './routes/staff.route.js'
import laborarityRoute from './routes/laborarity.route.js'
import consultantPatternRoute from './routes/consultant_pattern.route.js'
import consultAppointmentRoute from './routes/consult_appointment.route.js'
import questionRoute from './routes/question.route.js'
import replyRoute from './routes/reply.route.js'
import consultReportRoute from './routes/consult_report.route.js'
import feedbackRoute from './routes/feedback.route.js'
import blogRoute from './routes/blog.route.js'
import { SocketServer } from './config/websocket.config.js'

dotenv.config()

const app = express()

// app.use(passport.initialize())
app.use(
  cors({
    origin: process.env.FE_ADDRESS,
    credentials: true //for using cookie/token
  })
)

// Add Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
// create server Redis và socket server
const server = http.createServer(app) //Tạo server HTTP từ app Express
const socketServer = new SocketServer(server)
export { socketServer }
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
      // route transaction
      app.use('/transaction', transactionRoute)
      // route laborarity
      app.use('/laborarity', laborarityRoute)
      // route consultant pattern
      app.use('/consultant-pattern', consultantPatternRoute)
      // route consult appointment
      app.use('/consult-appointment', consultAppointmentRoute)
      // route question
      app.use('/question', questionRoute)
      // route reply
      app.use('/reply', replyRoute)
      // route consult report
      app.use('/consult-report', consultReportRoute)
      // route feedback
      app.use('/feedback', feedbackRoute)
      // route transaction
      app.use('/transaction/payos', transactionRoute)
      // route blog
      app.use('/blog', blogRoute)
      app.use(defaultErrorHandle)

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
