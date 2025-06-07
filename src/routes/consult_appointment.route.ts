import { Router } from 'express'
import {
  createConsultAppointment,
  getAllConsultAppointments,
  getConsultAppointmentById,
  getConsultAppointmentsByCustomerId,
  getConsultAppointmentsByPatternId,
  updateConsultAppointment,
  deleteConsultAppointment
} from '~/controllers/consult_appointment.controller'
import { validateAccessToken, restrictTo } from '~/middlewares/account.middleware'
import { Role } from '~/enum/role.enum'
import wrapRequestHandler from '~/utils/handle'

const router = Router()

// Create a new consult appointment (customer only)
// router.post(
//   '/',
//   validateAccessToken,
//   restrictTo(Role.CUSTOMER),
//   wrapRequestHandler(createConsultAppointment)
// )
router.post('/', wrapRequestHandler(createConsultAppointment))

// Get all consult appointments (admin or consultant)
// router.get(
//   '/',
//   validateAccessToken,
//   restrictTo(Role.ADMIN, Role.CONSULTANT),
//   wrapRequestHandler(getAllConsultAppointments)
// )
router.get('/', wrapRequestHandler(getAllConsultAppointments))

// Get a consult appointment by ID (admin, consultant, or customer)
// router.get(
//   '/:app_id',
//   validateAccessToken,
//   restrictTo(Role.ADMIN, Role.CONSULTANT, Role.CUSTOMER),
//   wrapRequestHandler(getConsultAppointmentById)
// )
router.get('/:app_id', wrapRequestHandler(getConsultAppointmentById))

// Get consult appointments by customer ID (admin or customer)
// router.get(
//   '/customer/:customer_id',
//   validateAccessToken,
//   restrictTo(Role.ADMIN, Role.CUSTOMER),
//   wrapRequestHandler(getConsultAppointmentsByCustomerId)
// )
router.get('/customer/:customer_id', wrapRequestHandler(getConsultAppointmentsByCustomerId))

// Get consult appointment by consultant pattern ID (admin or consultant)
// router.get(
//   '/pattern/:pattern_id',
//   validateAccessToken,
//   restrictTo(Role.ADMIN, Role.CONSULTANT),
//   wrapRequestHandler(getConsultAppointmentsByPatternId)
// )
router.get('/pattern/:pattern_id', wrapRequestHandler(getConsultAppointmentsByPatternId))

// Update a consult appointment (admin or customer)
// router.put(
//   '/:app_id',
//   validateAccessToken,
//   restrictTo(Role.ADMIN, Role.CUSTOMER),
//   wrapRequestHandler(updateConsultAppointment)
// )
router.put('/:app_id', wrapRequestHandler(updateConsultAppointment))

// Delete a consult appointment (admin only)
// router.delete(
//   '/:app_id',
//   validateAccessToken,
//   restrictTo(Role.ADMIN),
//   wrapRequestHandler(deleteConsultAppointment)
// )
router.delete('/:app_id', wrapRequestHandler(deleteConsultAppointment))

export default router