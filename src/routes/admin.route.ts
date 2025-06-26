import { Router } from 'express'
import {
  createAdminController,
  createManagerController,
  createCustomerController,
  banAccountController,
  createStaffController,
  createConsultantController,
  getAdminsController,
  getStaffsController,
  getManagersController,
  getConsultantsController,
  getOverallController,
  getSummaryController,
  getPerformanceController
} from '../controllers/admin.controller.js'
import { validateBanAccount, validateCreateAccount } from '../middlewares/admin.middleware.js'
import wrapRequestHandler from '../utils/handle.js'
import { restrictTo } from '~/middlewares/account.middleware.js'
import { Role } from '~/enum/role.enum.js'
import { getCustomersController } from '~/controllers/customer.controller.js'

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
  description: get summary
  method: get
  path: /admin/get-summary
  body:{
  }
*/
adminRoute.get('/get-summary', restrictTo(Role.ADMIN), wrapRequestHandler(getSummaryController))

/*
  description: get-performance
  method: get
  path: /admin/get-performance
  body:{
  }
*/
adminRoute.get('/get-performance', restrictTo(Role.ADMIN), wrapRequestHandler(getPerformanceController))

/*
  description: create new admin
  method: POST
  path: /admin/create-admin
  body: {
    name: string
    email: string
    password: string
  }
*/
adminRoute.post(
  '/create-admin',
  restrictTo(Role.ADMIN),
  validateCreateAccount,
  wrapRequestHandler(createAdminController)
)

/*
  description: create new manager
  method: POST
  path: /admin/create-manager
  body: {
    name: string
    email: string
    password: string
  }
*/
adminRoute.post(
  '/create-manager',
  restrictTo(Role.ADMIN),
  validateCreateAccount,
  wrapRequestHandler(createManagerController)
)

/*
  description: create new staff
  method: POST
  path: /admin/create-staff
  body: {
    name: string
    email: string
    password: string
  }
*/
adminRoute.post(
  '/create-staff',
  restrictTo(Role.ADMIN),
  validateCreateAccount,
  wrapRequestHandler(createStaffController)
)

/*
  description: create new consultant
  method: POST
  path: /admin/create-consultant
  body: {
    name: string
    email: string
    password: string
  }
*/
adminRoute.post(
  '/create-consultant',
  restrictTo(Role.ADMIN),
  validateCreateAccount,
  wrapRequestHandler(createConsultantController)
)

/*
  description: create new customer
  method: POST
  path: /admin/create-customer
  body: {
    name: string
    email: string
    password: string
  }
*/
adminRoute.post(
  '/create-customer',
  restrictTo(Role.ADMIN),
  validateCreateAccount,
  wrapRequestHandler(createCustomerController)
)

/*
  description: get all admins
  method: get
  path: /admin/get-admins
  body:{
  }
*/
adminRoute.get('/get-admins', restrictTo(Role.ADMIN), wrapRequestHandler(getAdminsController))

/*
  description: get all managers
  method: get
  path: /admin/get-managers
  body:{
  }
*/
adminRoute.get('/get-managers', restrictTo(Role.ADMIN), wrapRequestHandler(getManagersController))

/*
  description: get all consultants
  method: get
  path: /admin/get-consultants
  body:{
  }
*/
adminRoute.get('/get-consultants', restrictTo(Role.ADMIN), wrapRequestHandler(getConsultantsController))

/*
  description: get all staffs
  method: get
  path: /admin/get-staffs
  body:{
  }
*/
adminRoute.get('/get-staffs', restrictTo(Role.ADMIN), wrapRequestHandler(getStaffsController))
/*
  description: get account
  method: get
  path: /admin/get-customers
  body:{
  }
*/
adminRoute.get('/get-customers', restrictTo(Role.ADMIN), wrapRequestHandler(getCustomersController))

/*
  description: ban account
  method: POST
  path: /admin/ban-account
  body: {
    account_id: string
  }
*/
adminRoute.post('/ban-account', restrictTo(Role.ADMIN), validateBanAccount, wrapRequestHandler(banAccountController))

export default adminRoute
