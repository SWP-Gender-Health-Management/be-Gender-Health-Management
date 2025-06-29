import { Router } from 'express'
import { Role } from '~/enum/role.enum.js'
import { restrictTo } from '~/middlewares/account.middleware.js'
import wrapRequestHandler from '~/utils/handle.js'
import { reportCustomerController, reportPerformanceController } from '~/controllers/manager.controller.js'

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

export default managerRoute
