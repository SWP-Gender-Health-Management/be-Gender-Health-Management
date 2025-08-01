import { Request, Response, NextFunction } from 'express'
import HTTP_STATUS from '~/constants/httpStatus.js'
import { CONSULTANT_APPOINTMENTS_MESSAGES } from '~/constants/message.js'
import consultAppointmentService from '~/services/consult_appointment.service.js'
import notificationService from '~/services/notification.service.js'
import { TypeNoti } from '~/enum/type_noti.enum.js'

export const getConsultants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = req.query
    const result = await consultAppointmentService.getConsultants(page as string, limit as string)
    res.status(HTTP_STATUS.OK).json({
      message: CONSULTANT_APPOINTMENTS_MESSAGES.CONSULTANTS_RETRIEVED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /consult-appointment/create-consult-appointment:
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
    const { pattern_id, customer_id, description } = req.body
    const result = await consultAppointmentService.createConsultAppointment(pattern_id, customer_id, description)
    await notificationService.createNotification(
      {
        type: TypeNoti.CONSULT_APPOINTMENT,
        title: 'Appointment booked successfully',
        message: 'Your appointment has been booked successfully'
      },
      customer_id
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
 * /consult-appointment/get-all-consult-appointments:
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
export const getAllConApps = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit, page, search, status, date } = req.query
    const result = await consultAppointmentService.getAllConApps(limit as string, page as string, search as string, status as string, date as string)
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
 * /consult-appointment/get-consult-appointment-by-id/{app_id}:
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
export const getConAppById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { app_id } = req.params
    const result = await consultAppointmentService.getConAppById(app_id)
    res.status(HTTP_STATUS.OK).json({
      message: CONSULTANT_APPOINTMENTS_MESSAGES.CONSULT_APPOINTMENT_RETRIEVED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

export const getConsultAppointmentByConsultantId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { consultant_id } = req.params
    const result = await consultAppointmentService.getConsultAppointmentByConsultantId(consultant_id)
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
 * /consult-appointment/get-consult-appointment-by-id/customer/{customer_id}:
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
    // const { customer_id } = req.params
    const { account_id } = req.body
    const { limit, page } = req.query
    const result = await consultAppointmentService.getConsultAppointmentsByCustomerId(
      account_id as string,
      limit as string,
      page as string
    )
    res.status(HTTP_STATUS.OK).json({
      message: CONSULTANT_APPOINTMENTS_MESSAGES.CONSULT_APPOINTMENTS_RETRIEVED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

export const getConsultAppointmentsByWeek = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { consultant_id } = req.params
    const { weekStartDate } = req.query
    console.log("check weekStartDate: ", weekStartDate);
    const result = await consultAppointmentService.getConsultAppointmentByWeek(
      consultant_id as string,
      weekStartDate as string
    )
    res.status(HTTP_STATUS.OK).json({
      message: CONSULTANT_APPOINTMENTS_MESSAGES.CONSULT_APPOINTMENTS_RETRIEVED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

export const getConsultAppointmentStatByConsultantId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { account_id } = req.body;
    const result = await consultAppointmentService.getConsultAppointmentStatByConsultantId(
      account_id as string
    )
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
 * /consult-appointment/get-consult-appointment-by-id/pattern/{pattern_id}:
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
    const { pattern_id } = req.params
    const result = await consultAppointmentService.getConsultAppointmentsByPatternId(pattern_id)
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
 * /consult-appointment/update-consult-appointment/{app_id}:
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
    const { app_id } = req.params
    const result = await consultAppointmentService.updateConsultAppointment(app_id, req.body)
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
 * /consult-appointment/delete-consult-appointment/{app_id}:
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

export const cancelConsultAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
        console.log('Canceling consult appointment with ID:', req.params.app_id);
    await consultAppointmentService.cancelConsultAppointment(req.params.app_id)
    res.status(HTTP_STATUS.OK).json({
      message: CONSULTANT_APPOINTMENTS_MESSAGES.CONSULT_APPOINTMENT_CANCELLED_SUCCESS
    })
  } catch (error) {
    next(error)
  }
}

export const createConsultAppointmentRefund = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { app_id, description, accountNumber, bankName } = req.body
    await consultAppointmentService.createConsultAppointmentRefund(app_id, description, bankName, accountNumber)
    res.status(HTTP_STATUS.OK).json({
      message: CONSULTANT_APPOINTMENTS_MESSAGES.CONSULT_APPOINTMENT_REFUND_CREATED_SUCCESS
    })
  } catch (error) {
    next(error)
  }
}

export const getRefundInfoByAppId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { app_id } = req.params
    const result = await consultAppointmentService.getRefundInfoByAppId(app_id as string)
    res.status(HTTP_STATUS.OK).json({
      message: CONSULTANT_APPOINTMENTS_MESSAGES.CONSULT_APPOINTMENT_REFUND_RETRIEVED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

export const refundConsultAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { app_id } = req.params
    const result = await consultAppointmentService.refundConsultAppointment(app_id as string)
    res.status(HTTP_STATUS.OK).json({
      message: CONSULTANT_APPOINTMENTS_MESSAGES.CONSULT_APPOINTMENT_REFUND_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}
