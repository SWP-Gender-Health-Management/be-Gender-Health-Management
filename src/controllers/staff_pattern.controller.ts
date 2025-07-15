import { Request, Response, NextFunction } from 'express'
import HTTP_STATUS from '../constants/httpStatus.js'
import { STAFF_PATTERN_MESSAGES } from '../constants/message.js'
import staffPatternService from '../services/staff_pattern.service.js'

/**
 * @swagger
 * /api/staff-pattern/add-staff-pattern:
 *   post:
 *     summary: Add a staff pattern
 *     description: Creates a new staff pattern with specified date, account, and working slot. Requires admin or staff role.
 *     tags: [StaffPattern]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date of the staff pattern (e.g., '2025-06-11')
 *               account_id:
 *                 type: string
 *                 description: The staff account ID (UUID)
 *               slot_id:
 *                 type: string
 *                 description: The working slot ID (UUID)
 *             required: [date, account_id, slot_id]
 *     responses:
 *       201:
 *         description: Staff pattern created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 data:
 *                   $ref: '#/components/schemas/StaffPattern'
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
 */
export const addStaffPatternController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date, account_id, slot_id } = req.body
    const staffPattern = await staffPatternService.addStaffPattern(date, account_id, slot_id)
    res.status(HTTP_STATUS.CREATED).json({
      message: STAFF_PATTERN_MESSAGES.ADD_STAFF_PATTERN_SUCCESS,
      data: staffPattern
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /api/staff-pattern/get-staff-pattern:
 *   get:
 *     summary: Get staff patterns by date
 *     description: Retrieves staff patterns for a specific date.
 *     tags: [StaffPattern]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date of the staff pattern (e.g., '2025-06-11')
 *             required: [date]
 *     responses:
 *       200:
 *         description: Staff patterns retrieved successfully
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
 *                     $ref: '#/components/schemas/StaffPattern'
 *       400:
 *         description: Bad request (invalid date)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
export const getStaffPatternController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date } = req.body
    const staffPattern = await staffPatternService.getStaffPattern(date)
    res.status(HTTP_STATUS.OK).json({
      message: STAFF_PATTERN_MESSAGES.GET_STAFF_PATTERN_SUCCESS,
      data: staffPattern
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /api/staff-pattern/get-all-staff-pattern:
 *   get:
 *     summary: Get all staff patterns
 *     description: Retrieves all active staff patterns.
 *     tags: [StaffPattern]
 *     responses:
 *       200:
 *         description: Staff patterns retrieved successfully
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
 *                     $ref: '#/components/schemas/StaffPattern'
 */
export const getAllStaffPatternController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const staffPattern = await staffPatternService.getAllStaffPatternInWeek()
    res.status(HTTP_STATUS.OK).json({
      message: STAFF_PATTERN_MESSAGES.GET_ALL_STAFF_PATTERN_SUCCESS,
      data: staffPattern
    })
  } catch (error) {
    next(error)
  }
}

export const getStaffPatternByDate = async (req: Request, res: Response, next: NextFunction) => {
  const { account_id } = req.body
  const { date } = req.query
  const pattern = await staffPatternService.getStaffPatternByDate(account_id, date as string)
  res.status(HTTP_STATUS.OK).json({
    message: STAFF_PATTERN_MESSAGES.GET_STAFF_PATTERN_SUCCESS,
    result: pattern
  })
}

/**
 * @swagger
 * /api/staff-pattern/update-staff-pattern:
 *   put:
 *     summary: Update a staff pattern
 *     description: Updates an existing staff pattern by ID. Requires admin or staff role.
 *     tags: [StaffPattern]
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
 *                 description: The staff pattern ID (UUID)
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Updated date of the staff pattern (e.g., '2025-06-11')
 *               account_id:
 *                 type: string
 *                 description: Updated staff account ID (UUID)
 *               slot_id:
 *                 type: string
 *                 description: Updated working slot ID (UUID)
 *             required: [pattern_id]
 *     responses:
 *       200:
 *         description: Staff pattern updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 data:
 *                   $ref: '#/components/schemas/StaffPattern'
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
 *         description: Not found (staff pattern not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
export const updateStaffPatternController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pattern_id, date, account_id, slot_id } = req.body
    const staffPattern = await staffPatternService.updateStaffPattern(pattern_id, date, account_id, slot_id)
    res.status(HTTP_STATUS.OK).json({
      message: STAFF_PATTERN_MESSAGES.UPDATE_STAFF_PATTERN_SUCCESS,
      data: staffPattern
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /api/staff-pattern/delete-staff-pattern:
 *   delete:
 *     summary: Delete a staff pattern
 *     description: Deactivates a staff pattern by ID. Requires admin or staff role.
 *     tags: [StaffPattern]
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
 *                 description: The staff pattern ID (UUID)
 *             required: [pattern_id]
 *     responses:
 *       200:
 *         description: Staff pattern deleted successfully
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
 *         description: Bad request (invalid ID)
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
 *         description: Not found (staff pattern not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
export const deleteStaffPatternController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pattern_id } = req.body
    const staffPattern = await staffPatternService.deleteStaffPattern(pattern_id)
    res.status(HTTP_STATUS.OK).json({
      message: STAFF_PATTERN_MESSAGES.STAFF_PATTERN_DELETED_SUCCESS,
      data: staffPattern
    })
  } catch (error) {
    next(error)
  }
}
