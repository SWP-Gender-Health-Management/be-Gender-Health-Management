import { Request, Response, NextFunction } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import { FEEDBACK_MESSAGES } from '~/constants/message'
import feedbackService from '~/services/feedback.service'

/**
 * @swagger
 * /feedback/create-feedback:
 *   post:
 *     summary: Create a new feedback
 *     description: Creates a feedback for either a consult appointment or a laboratory appointment. Only one appointment type can be provided. Requires customer role.
 *     tags: [Feedback]
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
 *                 description: The consult appointment ID (UUID), mutually exclusive with lab_id
 *               lab_id:
 *                 type: string
 *                 description: The laboratory appointment ID (UUID), mutually exclusive with app_id
 *               content:
 *                 type: string
 *                 description: The feedback content
 *               rating:
 *                 type: number
 *                 description: Rating from 1 to 5
 *             required: [content]
 *     responses:
 *       201:
 *         description: Feedback created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 result:
 *                   $ref: '#/components/schemas/Feedback'
 *       400:
 *         description: Bad request (e.g., appointment not provided, feedback already exists, invalid rating)
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
 *         description: Not found (e.g., consult or laboratory appointment not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
// Create a new feedback
export const createFeedback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await feedbackService.createFeedback(req.body)
    res.status(HTTP_STATUS.CREATED).json({
      message: FEEDBACK_MESSAGES.FEEDBACK_CREATED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /feedback/get-all-feedbacks:
 *   get:
 *     summary: Get all feedbacks
 *     description: Retrieves a list of all feedbacks with their relations (consult_appointment, laboratoryAppointment). Requires admin, consultant, or customer role.
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Feedbacks retrieved successfully
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
 *                     $ref: '#/components/schemas/Feedback'
 *       401:
 *         description: Unauthorized (invalid token or insufficient role)
 */
// Get all feedbacks
export const getAllFeedbacks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await feedbackService.getAllFeedbacks()
    res.status(HTTP_STATUS.OK).json({
      message: FEEDBACK_MESSAGES.FEEDBACKS_RETRIEVED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /feedback/get-by-id-feedback/{feed_id}:
 *   get:
 *     summary: Get a feedback by ID
 *     description: Retrieves a feedback by its ID with its relations (consult_appointment, laboratoryAppointment). Requires admin, consultant, or customer role.
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: feed_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The feedback ID (UUID)
 *     responses:
 *       200:
 *         description: Feedback retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 result:
 *                   $ref: '#/components/schemas/Feedback'
 *       401:
 *         description: Unauthorized (invalid token or insufficient role)
 *       404:
 *         description: Not found (feedback not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
// Get a feedback by ID
export const getByIdFeedback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await feedbackService.getFeedbackById(req.params.feed_id)
    res.status(HTTP_STATUS.OK).json({
      message: FEEDBACK_MESSAGES.FEEDBACK_RETRIEVED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /feedback/get-by-id-feedback/consult/{app_id}:
 *   get:
 *     summary: Get feedback by consult appointment ID
 *     description: Retrieves a feedback associated with a consult appointment ID with its relations (consult_appointment, laboratoryAppointment). Requires admin, consultant, or customer role.
 *     tags: [Feedback]
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
 *         description: Feedback retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 result:
 *                   $ref: '#/components/schemas/Feedback'
 *       401:
 *         description: Unauthorized (invalid token or insufficient role)
 *       404:
 *         description: Not found (consult appointment or feedback not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
// Get feedback by Consult Appointment ID
export const getFeedbackByConsultAppointmentId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await feedbackService.getFeedbackByConsultAppointmentId(req.params.app_id)
    res.status(HTTP_STATUS.OK).json({
      message: FEEDBACK_MESSAGES.FEEDBACK_RETRIEVED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /feedback/get-by-id-feedback/lab/{lab_id}:
 *   get:
 *     summary: Get feedback by laboratory appointment ID
 *     description: Retrieves a feedback associated with a laboratory appointment ID with its relations (consult_appointment, laboratoryAppointment). Requires admin, consultant, or customer role.
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lab_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The laboratory appointment ID (UUID)
 *     responses:
 *       200:
 *         description: Feedback retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 result:
 *                   $ref: '#/components/schemas/Feedback'
 *       401:
 *         description: Unauthorized (invalid token or insufficient role)
 *       404:
 *         description: Not found (laboratory appointment or feedback not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
// Get feedback by Laboratory Appointment ID
export const getFeedbackByLaboratoryAppointmentId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await feedbackService.getFeedbackByLaboratoryAppointmentId(req.params.lab_id)
    res.status(HTTP_STATUS.OK).json({
      message: FEEDBACK_MESSAGES.FEEDBACK_RETRIEVED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /feedback/update-feedback/{feed_id}:
 *   put:
 *     summary: Update a feedback
 *     description: Updates an existing feedback. Only customers can update their own feedback. Requires customer role.
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: feed_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The feedback ID (UUID)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               app_id:
 *                 type: string
 *                 description: The consult appointment ID (UUID), mutually exclusive with lab_id
 *               lab_id:
 *                 type: string
 *                 description: The laboratory appointment ID (UUID), mutually exclusive with app_id
 *               content:
 *                 type: string
 *                 description: The updated feedback content
 *               rating:
 *                 type: number
 *                 description: Updated rating from 1 to 5
 *             required: []
 *     responses:
 *       200:
 *         description: Feedback updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 result:
 *                   $ref: '#/components/schemas/Feedback'
 *       400:
 *         description: Bad request (e.g., invalid rating, feedback already exists for new appointment)
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
 *         description: Not found (e.g., feedback, consult, or laboratory appointment not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
// Update a feedback
export const updateFeedback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await feedbackService.updateFeedback(req.params.feed_id, req.body)
    res.status(HTTP_STATUS.OK).json({
      message: FEEDBACK_MESSAGES.FEEDBACK_UPDATED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /feedback/delete-feedback/{feed_id}:
 *   delete:
 *     summary: Delete a feedback
 *     description: Deletes a feedback by its ID. Requires admin or customer role.
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: feed_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The feedback ID (UUID)
 *     responses:
 *       200:
 *         description: Feedback deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *       401:
 *         description: Unauthorized (invalid token or insufficient role)
 *       404:
 *         description: Not found (feedback not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
// Delete a feedback
export const deleteFeedback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await feedbackService.deleteFeedback(req.params.feed_id)
    res.status(HTTP_STATUS.OK).json({
      message: FEEDBACK_MESSAGES.FEEDBACK_DELETED_SUCCESS
    })
  } catch (error) {
    next(error)
  }
}