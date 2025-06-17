import { Request, Response, NextFunction } from 'express'
import HTTP_STATUS from '~/constants/httpStatus.js'
import { CONSULTANT_PATTERNS_MESSAGES } from '~/constants/message.js'
import consultantPatternService from '~/services/consultant_pattern.service.js'

/**
 * @swagger
 * /consultant_pattern/create-consultant-pattern:
 *   post:
 *     summary: Create a new consultant pattern
 *     description: Creates a new consultant pattern associated with a working slot and consultant. Requires admin role.
 *     tags: [ConsultantPatterns]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               slot_id:
 *                 type: string
 *                 description: The working slot ID (UUID)
 *               consultant_id:
 *                 type: string
 *                 description: The consultant account ID (UUID)
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date of the consultant pattern
 *               is_booked:
 *                 type: boolean
 *                 description: Whether the pattern is booked
 *             required: [slot_id, consultant_id, date]
 *     responses:
 *       201:
 *         description: Consultant pattern created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 result:
 *                   $ref: '#/components/schemas/ConsultantPattern'
 *       400:
 *         description: Bad request (e.g., consultant pattern already exists)
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
 *         description: Not found (e.g., working slot or consultant not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
// Create a new consultant pattern
export const createConsultantPattern = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await consultantPatternService.createConsultantPattern(req.body)
    res.status(HTTP_STATUS.CREATED).json({
      message: CONSULTANT_PATTERNS_MESSAGES.CONSULTANT_PATTERN_CREATED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /consultant_pattern/get-all-consultant-patterns:
 *   get:
 *     summary: Get all consultant patterns
 *     description: Retrieves a list of all consultant patterns with their relations (working_slot, consultant). Currently accessible without authentication.
 *     tags: [ConsultantPatterns]
 *     responses:
 *       200:
 *         description: Consultant patterns retrieved successfully
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
 *                     $ref: '#/components/schemas/ConsultantPattern'
 */
// Get all consultant patterns
export const getAllConsultantPatterns = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {email, account_id, ...filter} = req.body;
    const result = await consultantPatternService.getAllConsultantPatterns(filter, req.query)
    res.status(HTTP_STATUS.OK).json({
      message: CONSULTANT_PATTERNS_MESSAGES.CONSULTANT_PATTERNS_RETRIEVED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /consultant_pattern/get-consultant-pattern-by-id/{pattern_id}:
 *   get:
 *     summary: Get a consultant pattern by ID
 *     description: Retrieves a consultant pattern by its ID with its relations (working_slot, consultant). Requires admin or customer role.
 *     tags: [ConsultantPatterns]
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
 *         description: Consultant pattern retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 result:
 *                   $ref: '#/components/schemas/ConsultantPattern'
 *       401:
 *         description: Unauthorized (invalid token or insufficient role)
 *       404:
 *         description: Not found (consultant pattern not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
// Get a consultant pattern by ID
export const getConsultantPatternById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await consultantPatternService.getConsultantPatternById(req.params.pattern_id)
    res.status(HTTP_STATUS.OK).json({
      message: CONSULTANT_PATTERNS_MESSAGES.CONSULTANT_PATTERN_RETRIEVED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /consultant_pattern/get-consultant-pattern-by-id/consultant/{consultant_id}:
 *   get:
 *     summary: Get consultant patterns by consultant ID
 *     description: Retrieves all consultant patterns associated with a consultant ID with their relations (working_slot, consultant). Requires admin or customer role.
 *     tags: [ConsultantPatterns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: consultant_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The consultant account ID (UUID)
 *     responses:
 *       200:
 *         description: Consultant patterns retrieved successfully
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
 *                     $ref: '#/components/schemas/ConsultantPattern'
 *       401:
 *         description: Unauthorized (invalid token or insufficient role)
 *       404:
 *         description: Not found (consultant or consultant patterns not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
// Get consultant patterns by Consultant ID
export const getConsultantPatternByConsultantId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {email, account_id, ...filter} = req.body;
    const result = await consultantPatternService.getConsultantPatternByConsultantId(req.params.consultant_id,filter, req.query)
    res.status(HTTP_STATUS.OK).json({
      message: CONSULTANT_PATTERNS_MESSAGES.CONSULTANT_PATTERNS_RETRIEVED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /consultant_pattern/get-consultant-pattern-by-id/slot/{slot_id}:
 *   get:
 *     summary: Get consultant patterns by slot ID
 *     description: Retrieves all consultant patterns associated with a working slot ID with their relations (working_slot, consultant). Requires admin or customer role.
 *     tags: [ConsultantPatterns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slot_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The working slot ID (UUID)
 *     responses:
 *       200:
 *         description: Consultant patterns retrieved successfully
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
 *                     $ref: '#/components/schemas/ConsultantPattern'
 *       401:
 *         description: Unauthorized (invalid token or insufficient role)
 *       404:
 *         description: Not found (working slot or consultant patterns not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
// Get consultant patterns by Slot ID
export const getConsultantPatternBySlotId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {email, account_id, ...filter} = req.body;
    const result = await consultantPatternService.getConsultantPatternBySlotId(req.params.slot_id, filter, req.query);
    res.status(HTTP_STATUS.OK).json({
      message: CONSULTANT_PATTERNS_MESSAGES.CONSULTANT_PATTERNS_RETRIEVED_SUCCESS,
      result
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @swagger
 * /consultant_pattern/update-consultant-pattern/{pattern_id}:
 *   put:
 *     summary: Update a consultant pattern
 *     description: Updates an existing consultant pattern. Currently accessible without authentication.
 *     tags: [ConsultantPatterns]
 *     parameters:
 *       - in: path
 *         name: pattern_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The consultant pattern ID (UUID)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               slot_id:
 *                 type: string
 *                 description: The working slot ID (UUID)
 *               consultant_id:
 *                 type: string
 *                 description: The consultant account ID (UUID)
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date of the consultant pattern
 *               is_booked:
 *                 type: boolean
 *                 description: Whether the pattern is booked
 *             required: []
 *     responses:
 *       200:
 *         description: Consultant pattern updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 result:
 *                   $ref: '#/components/schemas/ConsultantPattern'
 *       400:
 *         description: Bad request (e.g., consultant pattern already exists)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       404:
 *         description: Not found (e.g., consultant pattern, working slot, or consultant not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
// Update a consultant pattern
export const updateConsultantPattern = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await consultantPatternService.updateConsultantPattern(req.params.pattern_id, req.body)
    res.status(HTTP_STATUS.OK).json({
      message: CONSULTANT_PATTERNS_MESSAGES.CONSULTANT_PATTERN_UPDATED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /consultant_pattern/delete-consultant-pattern/{pattern_id}:
 *   delete:
 *     summary: Delete a consultant pattern
 *     description: Deletes a consultant pattern by its ID. Requires admin role.
 *     tags: [ConsultantPatterns]
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
 *         description: Consultant pattern deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *       400:
 *         description: Bad request (e.g., pattern is booked or has appointments)
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
 *         description: Not found (consultant pattern not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
// Delete a consultant pattern
export const deleteConsultantPattern = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await consultantPatternService.deleteConsultantPattern(req.params.pattern_id)
    res.status(HTTP_STATUS.OK).json({
      message: CONSULTANT_PATTERNS_MESSAGES.CONSULTANT_PATTERN_DELETED_SUCCESS
    })
  } catch (error) {
    next(error)
  }
}