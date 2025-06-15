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


router.get('/get-all-consult-reports', validateAccessToken, restrictTo(Role.ADMIN, Role.CONSULTANT), wrapRequestHandler(getAllConsultReports))


router.get('/get-consult-report-by-id/:report_id', validateAccessToken, restrictTo(Role.ADMIN, Role.CONSULTANT), wrapRequestHandler(getConsultReportById))


router.get('/get-consult-report-by-id/appointment/:app_id', validateAccessToken, restrictTo(Role.ADMIN, Role.CONSULTANT), wrapRequestHandler(getConsultReportByAppointmentId))


router.put(
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
