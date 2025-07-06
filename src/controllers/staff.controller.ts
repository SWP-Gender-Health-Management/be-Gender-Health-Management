import { NextFunction, Request, Response } from 'express'
import HTTP_STATUS from '../constants/httpStatus.js'
import { LABORARITY_MESSAGES, RESULT_MESSAGES } from '../constants/message.js'
import staffService from '../services/staff.service.js'

/**
 * @swagger
 * /api/staff/update-result:
 *   post:
 *     summary: Update laboratory results
 *     description: Creates or updates results for a laboratory appointment based on provided test data. Requires staff or admin role.
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               app_id:
 *                 type: string
 *                 description: The laboratory appointment ID (UUID)
 *               result:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Name of the laboratory test
 *                     result:
 *                       type: number
 *                       description: Result value of the test
 *                   required: [name, result]
 *             required: [app_id, result]
 *     responses:
 *       200:
 *         description: Results created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Result'
 *       400:
 *         description: Bad request (e.g., test not found, insufficient data)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                 data:
 *                   type: any
 *                   description: Error data (e.g., false or partial results)
 *       401:
 *         description: Unauthorized (invalid token or insufficient role)
 */
// Update laboratory results
export const updateResultController = async (req: Request, res: Response, next: NextFunction) => {
  const { app_id, result } = req.body
  const resultData = await staffService.updateResult(app_id, result as any[])
  if (!resultData) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: RESULT_MESSAGES.RESULT_CREATE_FAILED,
      data: resultData
    })
  }
  if (Array.isArray(resultData) && resultData.length < result.length) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: RESULT_MESSAGES.RESULT_CREATE_NOT_ENOUGH_DATA,
      data: resultData
    })
  }
  res.status(HTTP_STATUS.OK).json({
    message: RESULT_MESSAGES.RESULT_CREATED_SUCCESS,
    data: resultData
  })
}

/**
 * @swagger
 * /api/staff/update-appointment-status:
 *   post:
 *     summary: Update appointment status
 *     description: Updates the status of a laboratory appointment. Requires staff or admin role.
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appointment_id:
 *                 type: string
 *                 description: The laboratory appointment ID (UUID)
 *               status:
 *                 type: number
 *                 description: Status code of the appointment (converted to StatusAppointment enum)
 *             required: [appointment_id, status]
 *     responses:
 *       200:
 *         description: Appointment status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 data:
 *                   $ref: '#/components/schemas/LaboratoryAppointment'
 *       400:
 *         description: Bad request (invalid input data)
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
 *         description: Not found (appointment not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
// Update appointment status
export const updateAppointmentStatusController = async (req: Request, res: Response, next: NextFunction) => {
  const { appointment_id, status } = req.body
  const appointmentStatus = await staffService.updateAppointmentStatus(appointment_id, status)
  res.status(HTTP_STATUS.OK).json({
    message: LABORARITY_MESSAGES.APPOINTMENT_STATUS_UPDATED_SUCCESS,
    data: appointmentStatus
  })
}
