import { Router } from 'express'
import {
  createAdminController,
  createManagerController,
  createStaffController,
  createConsultantController,
  createCustomerController,
  getAllStaffController
} from '../controllers/admin.controller.js'
import { validateCreateAccount } from '../middlewares/admin.middleware.js'
import wrapRequestHandler from '../utils/handle.js'

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
adminRoute.post('/create-admin', validateCreateAccount, wrapRequestHandler(createAdminController))

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
adminRoute.post('/create-manager', validateCreateAccount, wrapRequestHandler(createManagerController))

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
adminRoute.post('/create-staff', validateCreateAccount, wrapRequestHandler(createStaffController))

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
adminRoute.post('/create-consultant', validateCreateAccount, wrapRequestHandler(createConsultantController))

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
adminRoute.post('/create-customer', validateCreateAccount, wrapRequestHandler(createCustomerController))

export default adminRoute
