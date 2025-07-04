import { Router } from 'express'
import {
  createConsultAppointment,
  getAllConApps,
  getConAppById,
  getConsultAppointmentsByCustomerId,
  getConsultAppointmentsByPatternId,
  updateConsultAppointment,
  deleteConsultAppointment,
  getConsultants
} from '../controllers/consult_appointment.controller.js'
import { validateAccessToken, restrictTo } from '../middlewares/account.middleware.js'
import { Role } from '../enum/role.enum.js'
import wrapRequestHandler from '../utils/handle.js'

const consultAppointmentRoute = Router()

/*
  description: get consultants
  method: get
  path: /consultants
  query: {
    page: number
    limit: number
  }
*/
consultAppointmentRoute.get('/get-consultants', wrapRequestHandler(getConsultants))

/*
  Description: Create a new consult appointment (customer only)
  Method: POST
  Path: /create-consult-appointment
  Body: {
    
  }
*/
consultAppointmentRoute.post(
  '/create-consult-appointment',
  // validateAccessToken,
  // restrictTo(Role.CUSTOMER),
  wrapRequestHandler(createConsultAppointment)
)

/*
  Description: Get all consult appointments (admin or consultant)
  Method: GET
  Path: /get-all-consult-appointments
  Body: {
    
  }
*/
consultAppointmentRoute.get(
  '/get-all-consult-appointments',
  // validateAccessToken,
  // restrictTo(Role.ADMIN, Role.CONSULTANT),
  wrapRequestHandler(getAllConApps)
)

/*
  Description: Get a consult appointment by ID (admin, consultant, or customer)
  Method: GET
  Path: /get-consult-appointment-by-id/:app_id
  Body: {
    
  }
*/
consultAppointmentRoute.get(
  '/get-consult-appointment-by-id/:app_id',
  validateAccessToken,
  restrictTo(Role.ADMIN, Role.CONSULTANT, Role.CUSTOMER),
  wrapRequestHandler(getConAppById)
)

/*
  Description: Get consult appointments by customer ID (admin or customer)
  Method: GET
  Path: /get-consult-appointment-by-id/customer/:customer_id
  Body: {
    
  }
*/
consultAppointmentRoute.get(
  '/get-consult-appointment-by-id/customer/:customer_id',
  validateAccessToken,
  restrictTo(Role.ADMIN, Role.CUSTOMER),
  wrapRequestHandler(getConsultAppointmentsByCustomerId)
)

/*
  Description: Get consult appointment by consultant pattern ID (admin or consultant)
  Method: GET
  Path: /get-consult-appointment-by-id/pattern/:pattern_id
  Body: {
    
  }
*/
consultAppointmentRoute.get(
  '/get-consult-appointment-by-id/pattern/:pattern_id',
  validateAccessToken,
  restrictTo(Role.ADMIN, Role.CONSULTANT),
  wrapRequestHandler(getConsultAppointmentsByPatternId)
)

/*
  Description: Update a consult appointment (admin or customer)
  Method: PUT
  Path: /update-consult-appointment/:app_id
  Body: {
    
  }
*/
consultAppointmentRoute.put(
  'update-consult-appointment/:app_id',
  validateAccessToken,
  restrictTo(Role.ADMIN, Role.CUSTOMER),
  wrapRequestHandler(updateConsultAppointment)
)

/*
  Description: Delete a consult appointment (admin only)
  Method: DELETE
  Path: /delete-consult-appointment/:app_id
  Body: {
    
  }
*/
consultAppointmentRoute.delete(
  '/delete-consult-appointment/:app_id',
  // validateAccessToken,
  // restrictTo(Role.ADMIN),
  wrapRequestHandler(deleteConsultAppointment)
)

export default consultAppointmentRoute
