import { Router } from 'express'
import {
  createFeedback,
  deleteFeedback,
  getAllFeedbacks,
  getAverageRatingAndTotalFeedbackOfConsultant,
  getAverageRatingAndTotalFeedbackOfStaff,
  getByIdFeedback,
  getFeedbackByConsultAppointmentId,
  getFeedbackByLaboratoryAppointmentId,
  updateFeedback
} from '../controllers/feedback.controller.js'
import { validateAccessToken, restrictTo } from '../middlewares/account.middleware.js'
import { Role } from '../enum/role.enum.js'
import wrapRequestHandler from '../utils/handle.js'

const feedbackRoute = Router()

/*
  Description: Create a new feedback (customer only)
  Method: POST
  Path: /create-feedback
  Body: {
    
  }
*/
feedbackRoute.post(
  '/create-feedback',
  restrictTo(Role.CUSTOMER),
  wrapRequestHandler(createFeedback)
)

/*
  Description: Get all feedbacks (admin, consultant, or customer)
  Method: GET
  Path: /get-all-feedbacks
  Body: {
    
  }
*/
feedbackRoute.get(
  '/get-all-feedbacks',
  restrictTo(Role.ADMIN, Role.CONSULTANT, Role.STAFF, Role.CUSTOMER),
  wrapRequestHandler(getAllFeedbacks)
)

/*
  Description: Get a feedback by ID (admin, consultant, or customer)
  Method: GET
  Path: /get-by-id-feedback/:feed_id
  Body: {
    
  }
*/
feedbackRoute.get(
  '/get-by-id-feedback/:feed_id',
  restrictTo(Role.ADMIN, Role.CONSULTANT, Role.STAFF, Role.CUSTOMER),
  wrapRequestHandler(getByIdFeedback)
)

/*
  Description: Get a feedback by consult appointment ID (admin, consultant, or customer)
  Method: GET
  Path: /get-by-id-feedback/consult/:app_id
  Body: {
    
  }
*/
feedbackRoute.get(
  '/get-by-id-feedback/consult/:app_id',
  restrictTo(Role.ADMIN, Role.CONSULTANT, Role.STAFF, Role.CUSTOMER),
  wrapRequestHandler(getFeedbackByConsultAppointmentId)
)

/*
  Description: Get a feedback by laboratory appointment ID (admin, consultant, or customer)
  Method: GET
  Path: /get-by-id-feedback/lab/:lab_id
  Body: {
    
  }
*/
feedbackRoute.get(
  '/get-by-id-feedback/lab/:lab_id',
  restrictTo(Role.ADMIN, Role.CONSULTANT, Role.STAFF, Role.CUSTOMER),
  wrapRequestHandler(getFeedbackByLaboratoryAppointmentId)
)

/*
  Description: Update a feedback (customer only)
  Method: PUT
  Path: /update-feedback/:feed_id
  Body: {
    
  }
*/
feedbackRoute.put(
  '/update-feedback/:feed_id',
  restrictTo(Role.CUSTOMER),
  wrapRequestHandler(updateFeedback)
)

/*
  Description: Delete a feedback (admin or customer)
  Method: DELETE
  Path: /delete-feedback/:feed_id
  Body: {
    
  }
*/
feedbackRoute.delete(
  '/delete-feedback/:feed_id',
  restrictTo(Role.ADMIN, Role.CUSTOMER),
  wrapRequestHandler(deleteFeedback)
)

feedbackRoute.get(
  '/get-consultant-rating-feedback',
  restrictTo(Role.ADMIN, Role.CONSULTANT),
  wrapRequestHandler(getAverageRatingAndTotalFeedbackOfConsultant)
)

feedbackRoute.get(
  '/get-staff-rating-feedback',
  restrictTo(Role.ADMIN, Role.STAFF),
  wrapRequestHandler(getAverageRatingAndTotalFeedbackOfStaff)
)



export default feedbackRoute
