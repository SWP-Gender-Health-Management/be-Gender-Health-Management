import { json, NextFunction, Request, Response } from 'express'
import { WORKING_SLOT_MESSAGES } from '~/constants/message'
import { TypeAppointment } from '~/enum/type_appointment.enum'
import workingSlotService from '~/services/working_slot.service'

/**
 * @swagger
 * /working-slots/add-slot:
 *   post:
 *     summary: Add a working slot
 *     description: Creates a new working slot with specified name, time, and type (consult or laboratory).
 *     tags: [WorkingSlot]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the working slot
 *               start_at:
 *                 type: string
 *                 description: Start time of the slot (ISO format, e.g., '2025-06-11T09:00:00Z')
 *               end_at:
 *                 type: string
 *                 description: End time of the slot (ISO format, e.g., '2025-06-11T10:00:00Z')
 *               type:
 *                 type: string
 *                 enum: ['1', '2']
 *                 description: Type of appointment ('1' for CONSULT, '2' for LABORATORY)
 *             required: [name, start_at, end_at, type]
 *     responses:
 *       201:
 *         description: Working slot created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 data:
 *                   $ref: '#/components/schemas/WorkingSlot'
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
 */
// Add a working slot
export const addSlotController = async (req: Request, res: Response, next: NextFunction) => {
  const { name, start_at, end_at, type } = req.body
  const slot = await workingSlotService.addSlot(name, start_at, end_at, type)
  return res.status(200).json({
    message: WORKING_SLOT_MESSAGES.WORKING_SLOT_CREATED_SUCCESS,
    data: slot
  })
}

/**
 * @swagger
 * /working-slots/get-slot-by-type:
 *   get:
 *     summary: Get working slots by type
 *     description: Retrieves working slots filtered by type (consult or laboratory).
 *     tags: [WorkingSlot]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: ['1', '2']
 *                 description: Type of appointment ('1' for CONSULT, '2' for LABORATORY)
 *             required: [type]
 *     responses:
 *       200:
 *         description: Working slots retrieved successfully
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
 *                     $ref: '#/components/schemas/WorkingSlot'
 *       400:
 *         description: Bad request (invalid type)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
// Get working slots by type
export const getSlotByTypeController = async (req: Request, res: Response, next: NextFunction) => {
  const { type } = req.body
  const slot = await workingSlotService.getSlotByType(type)
  return res.status(200).json({
    message: WORKING_SLOT_MESSAGES.GET_SLOT_SUCCESS,
    data: slot
  })
}

/**
 * @swagger
 * /working-slots/get-all-slot:
 *   get:
 *     summary: Get all working slots
 *     description: Retrieves a list of all working slots.
 *     tags: [WorkingSlot]
 *     responses:
 *       200:
 *         description: Working slots retrieved successfully
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
 *                     $ref: '#/components/schemas/WorkingSlot'
 */
// Get all working slots
export const getSlotController = async (req: Request, res: Response, next: NextFunction) => {
  const slot = await workingSlotService.getSlot()
  return res.status(200).json({
    message: WORKING_SLOT_MESSAGES.GET_SLOT_SUCCESS,
    data: slot
  })
}

/**
 * @swagger
 * /working-slots/update-slot:
 *   put:
 *     summary: Update a working slot
 *     description: Updates an existing working slot by ID.
 *     tags: [WorkingSlot]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: ID of the working slot (UUID)
 *               name:
 *                 type: string
 *                 description: Updated name of the working slot
 *               start_at:
 *                 type: string
 *                 description: Updated start time of the slot (ISO format, e.g., '2025-06-11T09:00:00Z')
 *               end_at:
 *                 type: string
 *                 description: Updated end time of the slot (ISO format, e.g., '2025-06-11T10:00:00Z')
 *               type:
 *                 type: number
 *                 enum: [1, 2]
 *                 description: Type of appointment (1 for CONSULT, 2 for LABORATORY)
 *             required: [id]
 *     responses:
 *       200:
 *         description: Working slot updated successfully
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
 *                   description: Result of the update operation
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
 *       404:
 *         description: Not found (slot not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
// Update a working slot
export const updateSlotController = async (req: Request, res: Response, next: NextFunction) => {
  const { id, name, start_at, end_at, type } = req.body
  const slot = await workingSlotService.updateSlot(id, name, start_at, end_at, type)
  return res.status(200).json({
    message: WORKING_SLOT_MESSAGES.WORKING_SLOT_UPDATED_SUCCESS,
    data: slot
  })
}

/**
 * @swagger
 * /working-slots/delete-slot:
 *   delete:
 *     summary: Delete a working slot
 *     description: Deletes a working slot by ID.
 *     tags: [WorkingSlot]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: ID of the working slot (UUID)
 *             required: [id]
 *     responses:
 *       200:
 *         description: Working slot deleted successfully
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
 *                   description: Result of the delete operation
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
 *       404:
 *         description: Not found (slot not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
// Delete a working slot
export const deleteSlotController = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.body
  const slot = await workingSlotService.deleteSlot(id)
  return res.status(200).json({
    message: WORKING_SLOT_MESSAGES.WORKING_SLOT_DELETED_SUCCESS,
    data: slot
  })
}