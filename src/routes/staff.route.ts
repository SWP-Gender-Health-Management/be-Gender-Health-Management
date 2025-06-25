import express from 'express'
import { updateAppointmentStatusController, updateResultController } from '~/controllers/staff.controller.js'
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
staffRoute.post('/update-result', validateUpdateResult, wrapRequestHandler(updateResultController))

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
  wrapRequestHandler(updateAppointmentStatusController)
)

export default staffRoute
