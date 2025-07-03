import { Router } from 'express'
import { Role } from '~/enum/role.enum.js'
import { restrictTo } from '~/middlewares/account.middleware.js'
import wrapRequestHandler from '~/utils/handle.js'
import {
  createConsultantPatternController,
  createStaffPatternController,
  reportCustomerController,
  reportPerformanceController,
  getConsultantPatternController,
  getStaffPatternController
} from '~/controllers/manager.controller.js'
import { validateAddStaffPattern } from '~/middlewares/staff_pattern.middleware.js'
import { validateAddConsultantPattern } from '~/middlewares/consultant_pattern.middleware.js'
import { getConsultantsController, getStaffsController } from '~/controllers/admin.controller.js'
import { validateId } from '~/middlewares/manager.middleware.js'
import { getCustomersController } from '~/controllers/customer.controller.js'

const managerRoute = Router()

/*
  description: performance-report
  path: /manager/report-performance
  method: GET
  access: private
*/
managerRoute.get('/report-performance', restrictTo(Role.MANAGER), wrapRequestHandler(reportPerformanceController))

/*
  description: report-customer
  path: /manager/report-customer
  method: GET
  access: private
*/
managerRoute.get('/report-customer', restrictTo(Role.MANAGER), wrapRequestHandler(reportCustomerController))

/*
  description: get-staffs
  path: /manager/get-staffs
  method: GET
  access: private
  query: {
    limit: number
    page: number
  }
*/
managerRoute.get('/get-staffs', restrictTo(Role.MANAGER), wrapRequestHandler(getStaffsController))

/*
  description: get-staff-pattern
  path: /manager/get-staff-pattern
  method: GET
  access: private
  body: {
    staff_id: string
  }
*/
managerRoute.get(
  '/get-staff-pattern',
  restrictTo(Role.MANAGER),
  validateId,
  wrapRequestHandler(getStaffPatternController)
)

/*
  description: get-consultants
  path: /manager/get-consultants
  method: GET
  access: private
  query: {
    limit: number
    page: number
  }
*/
managerRoute.get('/get-consultants', restrictTo(Role.MANAGER), wrapRequestHandler(getConsultantsController))

/*
  description: get-consultant-pattern
  path: /manager/get-consultant-pattern
  method: GET
  access: private
  body: {
    consultant_id: string
  }
*/
managerRoute.get(
  '/get-consultant-pattern',
  restrictTo(Role.MANAGER),
  validateId,
  wrapRequestHandler(getConsultantPatternController)
)

/*
  description: get-customers
  path: /manager/get-customers
  method: GET
  access: private
  query: {
    limit: number
    page: number
  }
*/
managerRoute.get('/get-customers', restrictTo(Role.MANAGER), wrapRequestHandler(getCustomersController))

/*
  description: create-staff-pattern 
  path: /manager/create-staff-pattern
  method: POST
  access: private
*/
managerRoute.post(
  '/create-staff-pattern',
  restrictTo(Role.MANAGER),
  validateAddStaffPattern,
  wrapRequestHandler(createStaffPatternController)
)

/*
  description: create-consultant-pattern
  path: /manager/create-consultant-pattern
  method: POST
  access: private
*/
managerRoute.post(
  '/create-consultant-pattern',
  restrictTo(Role.MANAGER),
  validateAddConsultantPattern,
  wrapRequestHandler(createConsultantPatternController)
)

export default managerRoute
