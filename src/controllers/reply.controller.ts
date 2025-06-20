import { Request, Response, NextFunction } from 'express'
import HTTP_STATUS from '../constants/httpStatus.js'
import { REPLY_MESSAGES } from '../constants/message.js'
import replyService from '../services/reply.service.js'

/**
 * @swagger
 * /reply/create-reply:
 *   post:
 *     summary: Create a new reply
 *     description: Creates a reply for a question by a consultant. Each question can have only one reply. Requires consultant role.
 *     tags: [Reply]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               consultant_id:
 *                 type: string
 *                 description: The consultant account ID (UUID)
 *               ques_id:
 *                 type: string
 *                 description: The question ID (UUID)
 *               content:
 *                 type: string
 *                 description: The reply content
 *             required: [consultant_id, ques_id, content]
 *     responses:
 *       201:
 *         description: Reply created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 result:
 *                   $ref: '#/components/schemas/Reply'
 *       400:
 *         description: Bad request (e.g., reply already exists, content required)
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
 *         description: Not found (consultant or question not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
// Create a new reply
export const createReply = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { consultant_id, ques_id, content } = req.body
    const result = await replyService.createReply(consultant_id, ques_id, content)
    res.status(HTTP_STATUS.CREATED).json({
      message: REPLY_MESSAGES.REPLY_CREATED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /reply/get-all-replies:
 *   get:
 *     summary: Get all replies
 *     description: Retrieves a list of all replies with their relations (consultant, question). Requires admin, consultant, or customer role.
 *     tags: [Reply]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Replies retrieved successfully
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
 *                     $ref: '#/components/schemas/Reply'
 *       401:
 *         description: Unauthorized (invalid token or insufficient role)
 */
// Get all replies
export const getAllReplies = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, account_id, ...filter } = req.body
    const result = await replyService.getAllReplies(filter, req.query)
    res.status(HTTP_STATUS.OK).json({
      message: REPLY_MESSAGES.REPLIES_RETRIEVED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /reply/get-reply-by-id/{reply_id}:
 *   get:
 *     summary: Get a reply by ID
 *     description: Retrieves a reply by its ID with its relations (consultant, question). Requires admin, consultant, or customer role.
 *     tags: [Reply]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reply_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The reply ID (UUID)
 *     responses:
 *       200:
 *         description: Reply retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 result:
 *                   $ref: '#/components/schemas/Reply'
 *       401:
 *         description: Unauthorized (invalid token or insufficient role)
 *       404:
 *         description: Not found (reply not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
// Get a reply by ID
export const getReplyById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reply_id } = req.params
    const result = await replyService.getReplyById(reply_id)
    res.status(HTTP_STATUS.OK).json({
      message: REPLY_MESSAGES.REPLY_RETRIEVED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /reply/get-reply-by-id/consultant/{consultant_id}:
 *   get:
 *     summary: Get replies by consultant ID
 *     description: Retrieves all replies associated with a consultant ID with their relations (consultant, question). Requires admin or consultant role.
 *     tags: [Reply]
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
 *         description: Replies retrieved successfully
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
 *                     $ref: '#/components/schemas/Reply'
 *       401:
 *         description: Unauthorized (invalid token or insufficient role)
 *       404:
 *         description: Not found (consultant or replies not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
// Get replies by Consultant ID
export const getRepliesByConsultantId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { consultant_id, ...filter } = req.body
    const result = await replyService.getRepliesByConsultantId(consultant_id, filter, req.query)
    res.status(HTTP_STATUS.OK).json({
      message: REPLY_MESSAGES.REPLIES_RETRIEVED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /reply/get-reply-by-id/question/{ques_id}:
 *   get:
 *     summary: Get reply by question ID
 *     description: Retrieves a reply associated with a question ID with its relations (consultant, question). Requires admin, consultant, or customer role.
 *     tags: [Reply]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ques_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The question ID (UUID)
 *     responses:
 *       200:
 *         description: Reply retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 result:
 *                   $ref: '#/components/schemas/Reply'
 *       401:
 *         description: Unauthorized (invalid token or insufficient role)
 *       404:
 *         description: Not found (question or reply not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
// Get reply by Question ID
export const getReplyByQuestionId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ques_id } = req.params
    const result = await replyService.getReplyByQuestionId(ques_id)
    res.status(HTTP_STATUS.OK).json({
      message: REPLY_MESSAGES.REPLY_RETRIEVED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /reply/update-reply/{reply_id}:
 *   put:
 *     summary: Update a reply
 *     description: Updates an existing reply. Requires consultant role.
 *     tags: [Reply]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reply_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The reply ID (UUID)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               consultant_id:
 *                 type: string
 *                 description: The consultant account ID (UUID)
 *               content:
 *                 type: string
 *                 description: The updated reply content
 *             required: []
 *     responses:
 *       200:
 *         description: Reply updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 result:
 *                   $ref: '#/components/schemas/Reply'
 *       400:
 *         description: Bad request (e.g., content required)
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
 *         description: Not found (reply or consultant not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
// Update a reply
export const updateReply = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reply_id } = req.params
    const { consultant_id, content } = req.body
    const result = await replyService.updateReply(reply_id, consultant_id, content)
    res.status(HTTP_STATUS.OK).json({
      message: REPLY_MESSAGES.REPLY_UPDATED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /reply/delete-reply/{reply_id}:
 *   delete:
 *     summary: Delete a reply
 *     description: Deletes a reply by its ID and removes its reference from the associated question. Requires admin or consultant role.
 *     tags: [Reply]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reply_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The reply ID (UUID)
 *     responses:
 *       200:
 *         description: Reply deleted successfully
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
 *         description: Not found (reply not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
// Delete a reply
export const deleteReply = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reply_id } = req.params
    await replyService.deleteReply(reply_id)
    res.status(HTTP_STATUS.OK).json({
      message: REPLY_MESSAGES.REPLY_DELETED_SUCCESS
    })
  } catch (error) {
    next(error)
  }
}
