import 'reflect-metadata'
import express from 'express'
import http from 'http'
import dotenv from 'dotenv'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import swaggerSpec from './config/swagger'
import { initializeApp } from './config/app.config'
import defaultErrorHandle from './middlewares/error.middleware'
import accountRoute from './routes/account.route'
import customerRoute from './routes/customer.route'
import workingSlotRoute from './routes/working_slot.route'
import staffPatternRoute from './routes/staff_pattern.route'
import adminRoute from './routes/admin.route'
import transactionRoute from './routes/transaction.route'
import staffRoute from './routes/staff.route'
import laborarityRoute from './routes/laborarity.route'
import consultantPatternRoute from './routes/consultant_pattern.route'
import consultAppointmentRoute from './routes/consult_appointment.route'
import questionRoute from './routes/question.route'
import replyRoute from './routes/reply.route'
import consultReportRoute from './routes/consult_report.route'
import feedbackRoute from './routes/feedback.route'
import blogRoute from './routes/blog.route'
import { SocketServer } from './config/websocket.config'
// import { SocketIOService } from './services/websocket.service'
import managerRoute from './routes/manager.route'
import path from 'path'

import refreshTokenRoute from './routes/refresh_token.route'
import notiRoute from './routes/notification.route'
import { SocketIOService } from './services/websocket.service'

dotenv.config()

// In CommonJS, __dirname is already available
// Get the directory name of the current module
const uploadsPath = path.join(__dirname, '../uploads')

const app = express()

// app.use(passport.initialize())
app.use(
  cors({
    origin: process.env.FE_ADDRESS,
    credentials: true //for using cookie/token
  })
)
// Create HTTP server and initialize WebSocket
const server = http.createServer(app)
const socketServer = new SocketServer(server)
export const websocketService = new SocketIOService(socketServer.io)
// Add Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Initialize app (database and passport)
initializeApp()
  .then((success) => {
    if (success) {
      app.use(express.json())
      app.use(express.urlencoded({ extended: true })) // Để parse URL-encoded body

      // Setup routes
      console.log(new Date().toISOString())

      // route account
      app.use('/account', accountRoute)
      // route admin
      app.use('/admin', adminRoute)
      // route manager
      app.use('/manager', managerRoute)
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
      // Serve static files from the uploads directory
      app.use('/uploads', express.static(uploadsPath))
      // route refresh token
      app.use('/refresh-token', refreshTokenRoute)
      // route notification
      app.use('/notification', notiRoute)
      app.use(defaultErrorHandle)

      const port = process.env.PORT || 3000
      server.listen(port, () => {
        console.log(`🚀 Server is running on port: ${port}`)
        console.log(`🔌 WebSocket server is ready for connections`)
        console.log(`📚 API documentation available at: http://localhost:${port}/api-docs`)
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
