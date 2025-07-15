import express from 'express'
import { getAppointmentOfStaff, getAppointmentOfStaffByPattern, updateAppointmentStatusController, updateResultController } from '~/controllers/staff.controller.js'
import { Role } from '~/enum/role.enum.js'
import { restrictTo } from '~/middlewares/account.middleware.js'
import { validateUpdateAppointmentStatus, validateUpdateResult } from '~/middlewares/staff.middleware.js'
import wrapRequestHandler from '~/utils/handle.js'

const staffRoute = express.Router()
/*
  description: update result
  method: POST
  path: /staff/update-result
  body: {
    
  }
*/
staffRoute.post(
  '/update-result', 
  validateUpdateResult, 
  restrictTo(Role.STAFF),
  wrapRequestHandler(updateResultController))

/*
  description: update appointmet status
  method: POST
  path: /staff/update-appointment-status
  body: {
    appointment_id: string
    status: number
  }
*/
staffRoute.post(
  '/update-appointment-status',
  validateUpdateAppointmentStatus,
  restrictTo(Role.STAFF),
  wrapRequestHandler(updateAppointmentStatusController)
)

staffRoute.get(
  '/get-laborarity-appointment-by-pattern',
  restrictTo(Role.ADMIN, Role.STAFF),
  wrapRequestHandler(getAppointmentOfStaffByPattern)
)

staffRoute.get(
  '/get-laborarity-appointment-of-staff',
  restrictTo(Role.ADMIN, Role.STAFF),
  wrapRequestHandler(getAppointmentOfStaff)
)

export default staffRoute
