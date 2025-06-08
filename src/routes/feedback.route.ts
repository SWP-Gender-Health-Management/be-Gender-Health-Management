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

// router.post(
//   '/',
//   validateAccessToken,
//   restrictTo(Role.CUSTOMER),
//   FeedbackController.validateFeedbackInput,
//   feedbackController.create
// )
router.post(
  '/',
  wrapRequestHandler(createFeedback)
)

// router.get('/', validateAccessToken, restrictTo(Role.ADMIN, Role.CONSULTANT, Role.CUSTOMER), feedbackController.getAll)
router.get('/', wrapRequestHandler(getAllFeedbacks))

// router.get('/:feed_id', validateAccessToken, restrictTo(Role.ADMIN, Role.CONSULTANT, Role.CUSTOMER), feedbackController.getById)
router.get('/:feed_id', wrapRequestHandler(getByIdFeedback))

// router.get('/consult/:app_id', validateAccessToken, restrictTo(Role.ADMIN, Role.CONSULTANT, Role.CUSTOMER), feedbackController.getByConsultAppointmentId)
router.get('/consult/:app_id', wrapRequestHandler(getFeedbackByConsultAppointmentId))

// router.get('/lab/:lab_id', validateAccessToken, restrictTo(Role.ADMIN, Role.CONSULTANT, Role.CUSTOMER), feedbackController.getByLaboratoryAppointmentId)
router.get('/lab/:lab_id', wrapRequestHandler(getFeedbackByLaboratoryAppointmentId))

// router.put(
//   '/:feed_id',
//   validateAccessToken,
//   restrictTo(Role.CUSTOMER),
//   FeedbackController.validateFeedbackInput,
//   feedbackController.update
// )
router.put(
  '/:feed_id',
  wrapRequestHandler(updateFeedback)
)

// router.delete('/:feed_id', validateAccessToken, restrictTo(Role.ADMIN, Role.CUSTOMER), feedbackController.delete)
router.delete('/:feed_id', wrapRequestHandler(deleteFeedback))

export default router