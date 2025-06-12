import { Router } from 'express'
import {
  createFeedback,
  deleteFeedback,
  getAllFeedbacks,
  getByIdFeedback,
  getFeedbackByConsultAppointmentId,
  getFeedbackByLaboratoryAppointmentId,
  updateFeedback
} from '~/controllers/feedback.controller'
import { validateAccessToken, restrictTo } from '~/middlewares/account.middleware'
import { Role } from '~/enum/role.enum'
import wrapRequestHandler from '~/utils/handle'

const router = Router()

router.post(
  '/create-feedback',
  validateAccessToken,
  restrictTo(Role.CUSTOMER),
  wrapRequestHandler(createFeedback)
)


router.get('/get-all-feedbacks', validateAccessToken, restrictTo(Role.ADMIN, Role.CONSULTANT), wrapRequestHandler(getAllFeedbacks))


router.get('/get-by-id-feedback/:feed_id', validateAccessToken, restrictTo(Role.ADMIN, Role.CONSULTANT), wrapRequestHandler(getByIdFeedback))


router.get('/get-by-id-feedback/consult/:app_id', validateAccessToken, restrictTo(Role.ADMIN, Role.CONSULTANT), wrapRequestHandler(getFeedbackByConsultAppointmentId))


router.get('/get-by-id-feedback/lab/:lab_id', validateAccessToken, restrictTo(Role.ADMIN, Role.CONSULTANT), wrapRequestHandler(getFeedbackByLaboratoryAppointmentId))


router.put(
  '/update-feedback/:feed_id',
  validateAccessToken,
  restrictTo(Role.CUSTOMER),
 wrapRequestHandler(updateFeedback)
)


router.delete('/delete-feedback/:feed_id', validateAccessToken, restrictTo(Role.ADMIN, Role.CUSTOMER), wrapRequestHandler(deleteFeedback))


export default router