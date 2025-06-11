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
router.post(
  '/create-consult-appointment',
  validateAccessToken,
  restrictTo(Role.CUSTOMER),
  wrapRequestHandler(createConsultAppointment)
)

// Get all consult appointments (admin or consultant)
router.get(
  '/get-all-consult-appointments',
  validateAccessToken,
  restrictTo(Role.ADMIN, Role.CONSULTANT),
  wrapRequestHandler(getAllConsultAppointments)
)

// Get a consult appointment by ID (admin, consultant, or customer)
router.get(
  '/get-consult-appointment-by-id/:app_id',
  validateAccessToken,
  restrictTo(Role.ADMIN, Role.CONSULTANT, Role.CUSTOMER),
  wrapRequestHandler(getConsultAppointmentById)
)

// Get consult appointments by customer ID (admin or customer)
router.get(
  '/get-consult-appointment-by-id/customer/:customer_id',
  validateAccessToken,
  restrictTo(Role.ADMIN, Role.CUSTOMER),
  wrapRequestHandler(getConsultAppointmentsByCustomerId)
)

// Get consult appointment by consultant pattern ID (admin or consultant)
router.get(
  '/get-consult-appointment-by-id/pattern/:pattern_id',
  validateAccessToken,
  restrictTo(Role.ADMIN, Role.CONSULTANT),
  wrapRequestHandler(getConsultAppointmentsByPatternId)
)

// Update a consult appointment (admin or customer)
router.put(
  'update-consult-appointment/:app_id',
  validateAccessToken,
  restrictTo(Role.ADMIN, Role.CUSTOMER),
  wrapRequestHandler(updateConsultAppointment)
)

// Delete a consult appointment (admin only)
router.delete(
  '/delete-consult-appointment/:app_id',
  validateAccessToken,
  restrictTo(Role.ADMIN),
  wrapRequestHandler(deleteConsultAppointment)
)

export default router