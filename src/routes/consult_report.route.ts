import { Router } from 'express'
import {
  createConsultReport,
  deleteConsultReport,
  getAllConsultReports,
  getConsultReportById,
  getConsultReportByAppointmentId,
  updateConsultReport
} from '../controllers/consult_report.controller.js'
import { validateAccessToken, restrictTo } from '../middlewares/account.middleware.js'
import { Role } from '../enum/role.enum.js'
import wrapRequestHandler from '../utils/handle.js'

const consultReportRoute = Router()

/*
  Description: Create a new consult report (consultant only)
  Method: POST
  Path: /create-consult-report
  Body: {
    
  }
*/
consultReportRoute.post(
  '/create-consult-report',
  validateAccessToken,
  restrictTo(Role.CONSULTANT),
  wrapRequestHandler(createConsultReport)
)

/*
  Description: Get all consult reports (admin, consultant, or customer)
  Method: GET
  Path: /get-all-consult-reports
  Body: {
    
  }
*/
consultReportRoute.get(
  '/get-all-consult-reports',
   validateAccessToken,
  // restrictTo(Role.ADMIN, Role.CONSULTANT, Role.CUSTOMER),
  wrapRequestHandler(getAllConsultReports)
)

/*
  Description: Get a consult report by ID (admin, consultant, or customer)
  Method: GET
  Path: /get-consult-report-by-id/:report_id
  Body: {
    
  }
*/
consultReportRoute.get(
  '/get-consult-report-by-id/:report_id',
  validateAccessToken,
  restrictTo(Role.ADMIN, Role.CONSULTANT, Role.CUSTOMER),
  wrapRequestHandler(getConsultReportById)
)

/*
  Description: Get a consult report by appointment ID (admin, consultant, or customer)
  Method: GET
  Path: /get-consult-report-by-id/appointment/:app_id
  Body: {
    
  }
*/
consultReportRoute.get(
  '/get-consult-report-by-id/appointment/:app_id',
  validateAccessToken,
  restrictTo(Role.ADMIN, Role.CONSULTANT, Role.CUSTOMER),
  wrapRequestHandler(getConsultReportByAppointmentId)
)

/*
  Description: Update a consult report (consultant only)
  Method: PUT
  Path: /update-consult-report/:report_id
  Body: {
    
  }
*/
consultReportRoute.put(
  'update-consult-report/:report_id',
  validateAccessToken,
  restrictTo(Role.CONSULTANT),
  wrapRequestHandler(updateConsultReport)
)

/*
  Description: Delete a consult report (admin only)
  Method: DELETE
  Path: /delete-consult-report/:report_id
  Body: {
    
  }
*/
consultReportRoute.delete(
  '/delete-consult-report/:report_id',
  validateAccessToken,
  restrictTo(Role.ADMIN, Role.CONSULTANT),
  wrapRequestHandler(deleteConsultReport)
)

export default consultReportRoute
