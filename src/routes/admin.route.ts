import { Router } from 'express'
import {
  banAccountController,
  getOverallController,
  unbanAccountController,
  sendBulkEmailController,
  getRecentNewsController,
  getPercentCustomerController,
  createAccountController,
  getAccountsController,
  getReportOverallController,
  getPercentRevenueController,
  getPercentAccountController,
  getPercentRevenueByServiceController,
  getPercentFeedbackController
} from '../controllers/admin.controller.js'
import { upload, validateBanAccount, validateCreateAccount } from '../middlewares/admin.middleware.js'
import wrapRequestHandler from '../utils/handle.js'
import { restrictTo, validateUpdateAccount } from '~/middlewares/account.middleware.js'
import { Role } from '~/enum/role.enum.js'
import { Queue } from 'bullmq'
import redisClient from '~/config/redis.config.js'
import { updateAccountController, viewAccountController } from '~/controllers/account.controller.js'

const adminRoute = Router()

// dashboard and analysics

/*
  description: get dashboard and analysics
  method: get
  path: /admin/get-dashboard-and-analysics
  body:{
  }
*/
adminRoute.get('/get-overall', restrictTo(Role.ADMIN), wrapRequestHandler(getOverallController))

/*
  description: get percent of customer
  method: get
  path: /admin/get-percent-customer
  query:{
    day: number
  }
*/
adminRoute.get('/get-percent-customer', restrictTo(Role.ADMIN), wrapRequestHandler(getPercentCustomerController))

/*
  description: get recent news
  method: get
  path: /admin/get-recent-news
  query: {
    limit: string
    page: string
  }
*/
adminRoute.get('/get-recent-news', restrictTo(Role.ADMIN), wrapRequestHandler(getRecentNewsController))

// account management
/*
  description: create new account
  method: POST
  path: /admin/create-account
  body: {
    name: string
    email: string
    password: string
    role: number
  }
*/
adminRoute.post(
  '/create-account',
  restrictTo(Role.ADMIN),
  validateCreateAccount,
  wrapRequestHandler(createAccountController)
)

/*
  description: get all admins
  method: get
  path: /admin/get-admins
  body:{
  }
*/
adminRoute.get('/get-accounts', restrictTo(Role.ADMIN), wrapRequestHandler(getAccountsController))

/*
  view account
  Path: /view-account
  Method: POST
  Body: {
    account_id: string
  }
*/
adminRoute.post('/view-account', restrictTo(Role.ADMIN), wrapRequestHandler(viewAccountController))

/*
  Description: update-profile
  Path: /update-profile
  Method: POST
  Body: {
  full_name: string
  phone: string
  dob: Date
  gender: string
  }
*/
adminRoute.post(
  '/update-profile',
  restrictTo(Role.ADMIN),
  validateUpdateAccount,
  wrapRequestHandler(updateAccountController)
)

/*
  description: ban account
  method: POST
  path: /admin/ban-account
  body: {
    account_id: string
  }
*/
adminRoute.post('/ban-account', restrictTo(Role.ADMIN), validateBanAccount, wrapRequestHandler(banAccountController))

/*
  description: unban account
  method: POST
  path: /admin/unban-account
  body: {
    account_id: string
  }
*/
adminRoute.post(
  '/unban-account',
  restrictTo(Role.ADMIN),
  validateBanAccount,
  wrapRequestHandler(unbanAccountController)
)

// report

/*
  description: get report overall
  method: get
  path: /admin/get-report-overall
  query:{
    day: number
  }
*/
adminRoute.get('/get-report-overall', restrictTo(Role.ADMIN), wrapRequestHandler(getReportOverallController))

/*
  description: get percent revenue
  method: get
  path: /admin/get-percent-revenue
  body:{
    day: number
  }
*/
adminRoute.get('/get-percent-revenue', wrapRequestHandler(getPercentRevenueController))

/*
  description: get percent account
  method: get
  path: /admin/get-percent-account
  body:{
    day: number
  }
*/
adminRoute.get('/get-percent-account', wrapRequestHandler(getPercentAccountController))

/*
  description: get percent revenue by service
  method: get
  path: /admin/get-percent-revenue-service
*/
adminRoute.get('/get-percent-revenue-service', wrapRequestHandler(getPercentRevenueByServiceController))

/*
  description: get percent feedback
  method: get
  path: /admin/get-percent-feedback
*/
adminRoute.get('/get-percent-feedback', wrapRequestHandler(getPercentFeedbackController))

/*

*/

// Communication & Content

// Tạo một queue mới có tên là 'email-campaigns'
export const emailQueue = new Queue('email-campaigns', { connection: redisClient })

adminRoute.post(
  '/send-campaign-from-file',
  restrictTo(Role.ADMIN),
  upload.single('templateFile'),
  wrapRequestHandler(sendBulkEmailController)
)

export default adminRoute
