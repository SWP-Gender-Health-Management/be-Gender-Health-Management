import { Request, Response, NextFunction } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import { LABORATORIES_MESSAGES } from '~/constants/message'
import { ErrorWithStatus } from '~/models/Error'
import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validations'
import laboratoryService from '~/services/laborarity.service'

/**
 * @swagger
 * /laborarity/create-laboratory:
 *   post:
 *     summary: Create a new laboratory
 *     description: Creates a new laboratory with a unique name. Requires admin role.
 *     tags: [Laboratory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the laboratory
 *               description:
 *                 type: string
 *                 description: Description of the laboratory
 *               price:
 *                 type: number
 *                 description: Price of the laboratory service
 *             required: [name]
 *     responses:
 *       201:
 *         description: Laboratory created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 result:
 *                   $ref: '#/components/schemas/Laboratory'
 *       400:
 *         description: Bad request (e.g., laboratory name already exists)
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
// Create a new laboratory
export const createLaboratory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await laboratoryService.createLaboratory(req.body)
    res.status(HTTP_STATUS.CREATED).json({
      message: LABORATORIES_MESSAGES.LABORATORY_CREATED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /laborarity/get-all-laboratories:
 *   get:
 *     summary: Get all laboratories
 *     description: Retrieves a list of all laboratories. Requires admin or customer role.
 *     tags: [Laboratory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Laboratories retrieved successfully
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
 *                     $ref: '#/components/schemas/Laboratory'
 *       401:
 *         description: Unauthorized (invalid token or insufficient role)
 */
// Get all laboratories
export const getAllLaboratories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await laboratoryService.getAllLaboratories()
    res.status(HTTP_STATUS.OK).json({
      message: LABORATORIES_MESSAGES.LABORATORIES_RETRIEVED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /laborarity/get-laboratory-by-id/{lab_id}:
 *   get:
 *     summary: Get a laboratory by ID
 *     description: Retrieves a laboratory by its ID. Requires admin role.
 *     tags: [Laboratory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lab_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The laboratory ID (UUID)
 *     responses:
 *       200:
 *         description: Laboratory retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 result:
 *                   $ref: '#/components/schemas/Laboratory'
 *       401:
 *         description: Unauthorized (invalid token or insufficient role)
 *       404:
 *         description: Not found (laboratory not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
// Get a laboratory by ID
export const getLaboratoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await laboratoryService.getLaboratoryById(req.params.lab_id)
    res.status(HTTP_STATUS.OK).json({
      message: LABORATORIES_MESSAGES.LABORATORY_RETRIEVED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /laborarity/update-laboratory/{lab_id}:
 *   put:
 *     summary: Update a laboratory
 *     description: Updates an existing laboratory. Requires admin role.
 *     tags: [Laboratory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lab_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The laboratory ID (UUID)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The updated name of the laboratory
 *               description:
 *                 type: string
 *                 description: Updated description of the laboratory
 *               price:
 *                 type: number
 *                 description: Updated price of the laboratory service
 *             required: []
 *     responses:
 *       200:
 *         description: Laboratory updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 result:
 *                   $ref: '#/components/schemas/Laboratory'
 *       400:
 *         description: Bad request (e.g., laboratory name already exists)
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
 *         description: Not found (laboratory not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
// Update a laboratory
export const updateLaboratory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await laboratoryService.updateLaboratory(req.params.lab_id, req.body)
    res.status(HTTP_STATUS.OK).json({
      message: LABORATORIES_MESSAGES.LABORATORY_UPDATED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /laborarity/delete-laboratory/{lab_id}:
 *   delete:
 *     summary: Delete a laboratory
 *     description: Deletes a laboratory by its ID. Cannot delete if associated with appointments. Requires admin role.
 *     tags: [Laboratory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lab_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The laboratory ID (UUID)
 *     responses:
 *       200:
 *         description: Laboratory deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *       400:
 *         description: Bad request (e.g., laboratory has associated appointments)
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
 *         description: Not found (laboratory not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
// Delete a laboratory
export const deleteLaboratory  = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await laboratoryService.deleteLaboratory(req.params.lab_id)
    res.status(HTTP_STATUS.OK).json({
      message: LABORATORIES_MESSAGES.LABORATORY_DELETED_SUCCESS
    })
  } catch (error) {
    next(error)
  }
}