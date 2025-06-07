import { Router } from 'express'
import {
  createConsultReport,
  deleteConsultReport,
  getAllConsultReports,
  getByIdConsultReport,
  getConsultReportByAppointmentId,
  updateConsultReport
} from '~/controllers/consult_report.controller'
import { validateAccessToken, restrictTo } from '~/middlewares/account.middleware'
import { Role } from '~/enum/role.enum'
import wrapRequestHandler from '~/utils/handle'

const router = Router()

// router.post(
//   '/',
//   validateAccessToken,
//   restrictTo(Role.CONSULTANT),
//   ConsultReportController.validateConsultReportInput,
//   consultReportController.create
// )
router.post(
  '/',
  wrapRequestHandler(createConsultReport)
)

// router.get('/', validateAccessToken, restrictTo(Role.ADMIN, Role.CONSULTANT, Role.CUSTOMER), consultReportController.getAll)
router.get('/', wrapRequestHandler(getAllConsultReports))

// router.get('/:report_id', validateAccessToken, restrictTo(Role.ADMIN, Role.CONSULTANT, Role.CUSTOMER), consultReportController.getById)
router.get('/:report_id', wrapRequestHandler(getByIdConsultReport))

// router.get('/appointment/:app_id', validateAccessToken, restrictTo(Role.ADMIN, Role.CONSULTANT, Role.CUSTOMER), consultReportController.getByAppointmentId)
router.get('/appointment/:app_id', wrapRequestHandler(getConsultReportByAppointmentId))

// router.put(
//   '/:report_id',
//   validateAccessToken,
//   restrictTo(Role.CONSULTANT),
//   ConsultReportController.validateConsultReportInput,
//   consultReportController.update
// )
router.put(
  '/:report_id',
  wrapRequestHandler(updateConsultReport)
)

// router.delete('/:report_id', validateAccessToken, restrictTo(Role.ADMIN, Role.CONSULTANT), consultReportController.delete)
router.delete('/:report_id', wrapRequestHandler(deleteConsultReport))

export default router