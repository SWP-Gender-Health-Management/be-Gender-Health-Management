import { Router } from 'express'
import {
  createAdminController,
  createManagerController,
  createStaffController,
  createConsultantController,
  createCustomerController,
  getAllStaffController,
  banAccountController
} from '../controllers/admin.controller.js'
import { validateBanAccount, validateCreateAccount } from '../middlewares/admin.middleware.js'
import wrapRequestHandler from '../utils/handle.js'
import { restrictTo } from '~/middlewares/account.middleware.js'
import { Role } from '~/enum/role.enum.js'

const adminRoute = Router()

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
  description: get all staff
  method: GET
  path: /admin/get-all-staff
*/
adminRoute.get('/get-all-staff', wrapRequestHandler(getAllStaffController))

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
  description: ban account
  method: POST
  path: /admin/ban-account
  body: {
    account_id: string
  }
*/
adminRoute.post('/ban-account', restrictTo(Role.ADMIN), validateBanAccount, wrapRequestHandler(banAccountController))

export default adminRoute
