import { Request, Response, NextFunction } from 'express'
import HTTP_STATUS from '~/constants/httpStatus.js'
import { CONSULTANT_APPOINTMENTS_MESSAGES } from '~/constants/message.js'
import consultAppointmentService from '~/services/consult_appointment.service.js'

/**
 * @swagger
 * /consult_appointment/create-consult-appointment:
 *   post:
 *     summary: Create a new consult appointment
 *     description: Creates a new consult appointment for a customer, associating it with a consultant pattern. Requires customer role.
 *     tags: [ConsultAppointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pattern_id:
 *                 type: string
 *                 description: The consultant pattern ID (UUID)
 *               customer_id:
 *                 type: string
 *                 description: The customer account ID (UUID)
 *               description:
 *                 type: string
 *                 description: Description of the appointment
 *               status:
 *                 type: string
 *                 enum: [PENDING, CONFIRMED, CANCELLED, COMPLETED]
 *                 description: Status of the appointment
 *             required: [pattern_id, customer_id]
 *     responses:
 *       201:
 *         description: Consult appointment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 result:
 *                   $ref: '#/components/schemas/ConsultAppointment'
 *       400:
 *         description: Bad request (e.g., consultant pattern already booked)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       401:
 *         description: Unauthorized (invalid token or insufficient role)
 *       404:
 *         description: Not found (e.g., consultant pattern or customer not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
// Create a new consult appointment
export const createConsultAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pattern_id, customer_id, description, status } = req.body
    const result = await consultAppointmentService.createConsultAppointment(
      pattern_id,
      customer_id,
      description,
      status
    )
    res.status(HTTP_STATUS.CREATED).json({
      message: CONSULTANT_APPOINTMENTS_MESSAGES.CONSULT_APPOINTMENT_CREATED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /consult_appointment/get-all-consult-appointments:
 *   get:
 *     summary: Get all consult appointments
 *     description: Retrieves a list of all consult appointments with their relations (consultant_pattern, customer, report, feedback, consultant_pattern.working_slot, consultant_pattern.consultant). Currently accessible without authentication.
 *     tags: [ConsultAppointments]
 *     responses:
 *       200:
 *         description: Consult appointments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 result:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ConsultAppointment'
 */
// Get all consult appointments
export const getAllConsultAppointments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await consultAppointmentService.getAllConsultAppointments(req.query)
    res.status(HTTP_STATUS.OK).json({
      message: CONSULTANT_APPOINTMENTS_MESSAGES.CONSULT_APPOINTMENTS_RETRIEVED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /consult_appointment/get-consult-appointment-by-id/{app_id}:
 *   get:
 *     summary: Get a consult appointment by ID
 *     description: Retrieves a consult appointment by its ID with its relations (consultant_pattern, customer, report, feedback, consultant_pattern.working_slot, consultant_pattern.consultant). Requires admin, consultant, or customer role.
 *     tags: [ConsultAppointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: app_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The consult appointment ID (UUID)
 *     responses:
 *       200:
 *         description: Consult appointment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 result:
 *                   $ref: '#/components/schemas/ConsultAppointment'
 *       401:
 *         description: Unauthorized (invalid token or insufficient role)
 *       404:
 *         description: Not found (consult appointment not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
// Get a consult appointment by ID
export const getConsultAppointmentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await consultAppointmentService.getConsultAppointmentById(req.params.app_id)
    res.status(HTTP_STATUS.OK).json({
      message: CONSULTANT_APPOINTMENTS_MESSAGES.CONSULT_APPOINTMENT_RETRIEVED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /consult_appointment/get-consult-appointment-by-id/customer/{customer_id}:
 *   get:
 *     summary: Get consult appointments by customer ID
 *     description: Retrieves all consult appointments for a specific customer with their relations (consultant_pattern, customer, report, feedback, consultant_pattern.working_slot, consultant_pattern.consultant). Requires admin or customer role.
 *     tags: [ConsultAppointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customer_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The customer account ID (UUID)
 *     responses:
 *       200:
 *         description: Consult appointments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 result:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ConsultAppointment'
 *       401:
 *         description: Unauthorized (invalid token or insufficient role)
 *       404:
 *         description: Not found (customer or consult appointments not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
// Get consult appointments by Customer ID
export const getConsultAppointmentsByCustomerId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await consultAppointmentService.getConsultAppointmentsByCustomerId(req.params.customer_id, req.query)
    res.status(HTTP_STATUS.OK).json({
      message: CONSULTANT_APPOINTMENTS_MESSAGES.CONSULT_APPOINTMENTS_RETRIEVED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /consult_appointment/get-consult-appointment-by-id/pattern/{pattern_id}:
 *   get:
 *     summary: Get consult appointment by consultant pattern ID
 *     description: Retrieves a consult appointment associated with a consultant pattern ID with its relations (consultant_pattern, customer, report, feedback, consultant_pattern.working_slot, consultant_pattern.consultant). Requires admin or consultant role.
 *     tags: [ConsultAppointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pattern_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The consultant pattern ID (UUID)
 *     responses:
 *       200:
 *         description: Consult appointment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 result:
 *                   $ref: '#/components/schemas/ConsultAppointment'
 *       401:
 *         description: Unauthorized (invalid token or insufficient role)
 *       404:
 *         description: Not found (consultant pattern or consult appointment not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
// Get consult appointment by Consultant Pattern ID
export const getConsultAppointmentsByPatternId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await consultAppointmentService.getConsultAppointmentsByPatternId(req.params.pattern_id)
    res.status(HTTP_STATUS.OK).json({
      message: CONSULTANT_APPOINTMENTS_MESSAGES.CONSULT_APPOINTMENT_RETRIEVED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /consult_appointment/update-consult-appointment/{app_id}:
 *   put:
 *     summary: Update a consult appointment
 *     description: Updates an existing consult appointment. Requires admin or customer role.
 *     tags: [ConsultAppointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: app_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The consult appointment ID (UUID)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pattern_id:
 *                 type: string
 *                 description: The consultant pattern ID (UUID)
 *               customer_id:
 *                 type: string
 *                 description: The customer account ID (UUID)
 *               description:
 *                 type: string
 *                 description: Description of the appointment
 *               status:
 *                 type: string
 *                 enum: [PENDING, CONFIRMED, CANCELLED, COMPLETED]
 *                 description: Status of the appointment
 *             required: []
 *     responses:
 *       200:
 *         description: Consult appointment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 result:
 *                   $ref: '#/components/schemas/ConsultAppointment'
 *       400:
 *         description: Bad request (e.g., consultant pattern already booked)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       401:
 *         description: Unauthorized (invalid token or insufficient role)
 *       404:
 *         description: Not found (e.g., consult appointment or consultant pattern not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
// Update a consult appointment
export const updateConsultAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await consultAppointmentService.updateConsultAppointment(req.params.app_id, req.body)
    res.status(HTTP_STATUS.OK).json({
      message: CONSULTANT_APPOINTMENTS_MESSAGES.CONSULT_APPOINTMENT_UPDATED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /consult_appointment/delete-consult-appointment/{app_id}:
 *   delete:
 *     summary: Delete a consult appointment
 *     description: Deletes a consult appointment by its ID. Requires admin role.
 *     tags: [ConsultAppointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: app_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The consult appointment ID (UUID)
 *     responses:
 *       200:
 *         description: Consult appointment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *       400:
 *         description: Bad request (e.g., appointment has feedback)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       401:
 *         description: Unauthorized (invalid token or insufficient role)
 *       404:
 *         description: Not found (consult appointment not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
// Delete a consult appointment
export const deleteConsultAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await consultAppointmentService.deleteConsultAppointment(req.params.app_id)
    res.status(HTTP_STATUS.OK).json({
      message: CONSULTANT_APPOINTMENTS_MESSAGES.CONSULT_APPOINTMENT_DELETED_SUCCESS
    })
  } catch (error) {
    next(error)
  }
}
