import { NextFunction, Request, Response } from 'express'
import HTTP_STATUS from '~/constants/httpStatus.js'
import { CUSTOMER_MESSAGES } from '~/constants/message.js'
import customerService from '~/services/customer.service.js'

export const getCustomersController = async (req: Request, res: Response, next: NextFunction) => {
  const { limit, page } = req.query
  const result = await customerService.getCustomers(limit as string, page as string)
  res.status(HTTP_STATUS.OK).json({
    message: CUSTOMER_MESSAGES.GET_CUSTOMER_SUCCESS,
    data: result
  })
}

/**
 * @swagger
 * /customer/track-period:
 *   post:
 *     summary: Track menstrual cycle
 *     description: Creates a new menstrual cycle record for a female customer. Requires authentication.
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               account_id:
 *                 type: string
 *                 description: The customer account ID (UUID)
 *               period:
 *                 type: number
 *                 description: The menstrual cycle duration in days
 *               start_date:
 *                 type: string
 *                 format: date
 *                 description: Start date of the menstrual cycle
 *               end_date:
 *                 type: string
 *                 format: date
 *                 description: End date of the menstrual cycle
 *               note:
 *                 type: string
 *                 description: Additional notes for the cycle
 *             required: [account_id, period, start_date, end_date]
 *     responses:
 *       200:
 *         description: Menstrual cycle created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 data:
 *                   $ref: '#/components/schemas/MenstrualCycle'
 *       400:
 *         description: Bad request (e.g., menstrual cycle already exists, user is not female)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       401:
 *         description: Unauthorized (invalid token)
 */
// Track menstrual cycle
export const trackPeriodController = async (req: Request, res: Response, next: NextFunction) => {
  const { account_id, start_date, end_date, period, note } = req.body
  const result = await customerService.createMenstrualCycle(account_id, start_date, end_date, period, note)
  res.status(HTTP_STATUS.OK).json({
    message: CUSTOMER_MESSAGES.CREATE_MENSTRUAL_CYCLE_SUCCESS,
    data: result
  })
}

/**
 * @swagger
 * /customer/predict-period:
 *   get:
 *     summary: Predict menstrual cycle
 *     description: Predicts the next menstrual cycle dates based on the customer's existing cycle. Requires authentication.
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: account_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The customer account ID (UUID)
 *     responses:
 *       200:
 *         description: Menstrual cycle prediction successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 data:
 *                   type: object
 *                   properties:
 *                     next_start_date:
 *                       type: string
 *                       format: date-time
 *                       description: Predicted start date of the next cycle
 *                     next_end_date:
 *                       type: string
 *                       format: date-time
 *                       description: Predicted end date of the next cycle
 *                     notiDate:
 *                       type: string
 *                       format: date-time
 *                       description: Date for notification (2 days before predicted start)
 *       400:
 *         description: Bad request (e.g., menstrual cycle not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       401:
 *         description: Unauthorized (invalid token)
 */
// Predict menstrual cycle
export const predictPeriodController = async (req: Request, res: Response, next: NextFunction) => {
  const { account_id } = req.body
  // console.log('account_id', account_id)
  const result = await customerService.predictPeriod(account_id)
  res.status(HTTP_STATUS.OK).json({
    message: CUSTOMER_MESSAGES.PREDICT_PERIOD_SUCCESS,
    data: result
  })
}

/**
 * @swagger
 * /customer/update-menstrual-cycle:
 *   put:
 *     summary: Update menstrual cycle
 *     description: Updates an existing menstrual cycle record for a customer. Requires authentication.
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               account_id:
 *                 type: string
 *                 description: The customer account ID (UUID)
 *               start_date:
 *                 type: string
 *                 format: date
 *                 description: Updated start date of the menstrual cycle
 *               end_date:
 *                 type: string
 *                 format: date
 *                 description: Updated end date of the menstrual cycle
 *               note:
 *                 type: string
 *                 description: Updated notes for the cycle
 *               period:
 *                 type: number
 *                 description: Updated menstrual cycle duration in days
 *             required: [account_id, start_date, end_date]
 *     responses:
 *       200:
 *         description: Menstrual cycle updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       description: Confirmation message
 *       400:
 *         description: Bad request (e.g., menstrual cycle not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       401:
 *         description: Unauthorized (invalid token)
 */
// Update menstrual cycle
export const updateMenstrualCycleController = async (req: Request, res: Response, next: NextFunction) => {
  const { account_id, start_date, end_date, note } = req.body
  const result = await customerService.updateMenstrualCycle(account_id, start_date, end_date, note)
  res.status(HTTP_STATUS.OK).json({
    message: CUSTOMER_MESSAGES.MENSTRUAL_CYCLE_UPDATED,
    data: result
  })
}

/**
 * @swagger
 * /customer/create-notification:
 *   post:
 *     summary: Create menstrual cycle notification
 *     description: Creates a notification for a menstrual cycle based on prediction data stored in Redis. Requires authentication.
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               account_id:
 *                 type: string
 *                 description: The customer account ID (UUID)
 *             required: [account_id]
 *     responses:
 *       200:
 *         description: Notification created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       description: Confirmation message
 *       401:
 *         description: Unauthorized (invalid token)
 */
// Create notification
export const createNotificationController = async (req: Request, res: Response, next: NextFunction) => {
  const { account_id } = req.body
  const result = await customerService.createNotification(account_id)
  res.status(HTTP_STATUS.OK).json({
    message: CUSTOMER_MESSAGES.MENSTRUAL_CYCLE_SCHEDULED_NOTIFICATION,
    data: result
  })
}

/**
 * @swagger
 * /api/customer/create-laborarity-appointment:
 *   post:
 *     summary: Create a laboratory appointment
 *     description: Creates a new laboratory appointment for a customer with specified laboratory tests, working slot, and date. Requires customer role and authentication.
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               account_id:
 *                 type: string
 *                 description: The customer account ID (UUID)
 *               laborarity_id:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of laboratory test IDs (UUIDs)
 *               slot_id:
 *                 type: string
 *                 description: The working slot ID (UUID)
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date of the appointment (e.g., '2025-06-11')
 *             required: [account_id, laborarity_id, slot_id, date]
 *     responses:
 *       201:
 *         description: Laboratory appointment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 data:
 *                   type: object
 *                   properties:
 *                     appointment:
 *                       $ref: '#/components/schemas/LaboratoryAppointment'
 *                     amount:
 *                       type: number
 *                       description: Total price of the laboratory tests
 *       400:
 *         description: Bad request (e.g., insufficient staff, laboratory not found)
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
 */
// Create laboratory appointment
export const createLaborarityAppointmentController = async (req: Request, res: Response, next: NextFunction) => {
  const { account_id, laborarity_id, slot_id, date } = req.body
  const result = await customerService.createLaborarityAppointment(account_id, laborarity_id, slot_id, date)
  res.status(HTTP_STATUS.OK).json({
    message: CUSTOMER_MESSAGES.LABORARITY_APPOINTMENT_CREATED_SUCCESS,
    data: result
  })
}
