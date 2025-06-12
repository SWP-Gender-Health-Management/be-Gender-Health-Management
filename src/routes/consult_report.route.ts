import { Router } from 'express'
import {
  createConsultReport,
  deleteConsultReport,
  getAllConsultReports,
  getConsultReportById,
  getConsultReportByAppointmentId,
  updateConsultReport
} from '~/controllers/consult_report.controller'
import { validateAccessToken, restrictTo } from '~/middlewares/account.middleware'
import { Role } from '~/enum/role.enum'
import wrapRequestHandler from '~/utils/handle'

const router = Router()

router.post(
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


router.delete('/delete-consult-report/:report_id', validateAccessToken, restrictTo(Role.ADMIN, Role.CONSULTANT), wrapRequestHandler(deleteConsultReport))


export default router