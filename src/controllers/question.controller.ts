import { Request, Response, NextFunction } from 'express'
import HTTP_STATUS from '../constants/httpStatus.js'
import { QUESTION_MESSAGES } from '../constants/message.js'
import questionService from '../services/question.service.js'

/**
 * @swagger
 * /question/create-question:
 *   post:
 *     summary: Create a new question
 *     description: Creates a new question by a customer. Requires customer role.
 *     tags: [Question]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customer_id:
 *                 type: string
 *                 description: The customer account ID (UUID)
 *               content:
 *                 type: string
 *                 description: The question content
 *               status:
 *                 type: boolean
 *                 description: Status of the question (default: false)
 *             required: [customer_id, content]
 *     responses:
 *       201:
 *         description: Question created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 result:
 *                   $ref: '#/components/schemas/Question'
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
 *         description: Not found (customer not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
// Create a new question
export const createQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await questionService.createQuestion(req.body)
    res.status(HTTP_STATUS.CREATED).json({
      message: QUESTION_MESSAGES.QUESTION_CREATED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /question/get-all-questions:
 *   get:
 *     summary: Get all questions
 *     description: Retrieves a list of all questions with their relations (customer, reply). Requires admin or customer role.
 *     tags: [Question]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Questions retrieved successfully
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
 *                     $ref: '#/components/schemas/Question'
 *       401:
 *         description: Unauthorized (invalid token or insufficient role)
 */
// Get all questions
export const getAllQuestions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, account_id, ...filter } = req.body
    const result = await questionService.getAllQuestions(filter, req.query)
    res.status(HTTP_STATUS.OK).json({
      message: QUESTION_MESSAGES.QUESTIONS_RETRIEVED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /question/get-question-by-id/{ques_id}:
 *   get:
 *     summary: Get a question by ID
 *     description: Retrieves a question by its ID with its relations (customer, reply). Requires admin or customer role.
 *     tags: [Question]
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
 *         description: Question retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 result:
 *                   $ref: '#/components/schemas/Question'
 *       401:
 *         description: Unauthorized (invalid token or insufficient role)
 *       404:
 *         description: Not found (question not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
// Get a question by ID
export const getQuestionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await questionService.getQuestionById(req.params.ques_id)
    res.status(HTTP_STATUS.OK).json({
      message: QUESTION_MESSAGES.QUESTION_RETRIEVED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /question/get-question-by-id/customer/{customer_id}:
 *   get:
 *     summary: Get questions by customer ID
 *     description: Retrieves all questions associated with a customer ID with their relations (customer, reply). Requires admin or customer role.
 *     tags: [Question]
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
 *         description: Questions retrieved successfully
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
 *                     $ref: '#/components/schemas/Question'
 *       401:
 *         description: Unauthorized (invalid token or insufficient role)
 *       404:
 *         description: Not found (customer or questions not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
// Get questions by Customer ID
export const getQuestionsByCustomerId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, account_id, ...filter } = req.body
    const result = await questionService.getQuestionsByCustomerId(req.params.customer_id, filter, req.query)
    res.status(HTTP_STATUS.OK).json({
      message: QUESTION_MESSAGES.QUESTIONS_RETRIEVED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /question/update-question/{ques_id}:
 *   put:
 *     summary: Update a question
 *     description: Updates an existing question. Cannot update status to true if question has a reply. Requires customer role.
 *     tags: [Question]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ques_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The question ID (UUID)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customer_id:
 *                 type: string
 *                 description: The customer account ID (UUID)
 *               content:
 *                 type: string
 *                 description: The updated question content
 *               status:
 *                 type: boolean
 *                 description: Updated status of the question
 *             required: []
 *     responses:
 *       200:
 *         description: Question updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 result:
 *                   $ref: '#/components/schemas/Question'
 *       400:
 *         description: Bad request (e.g., content required, question already replied)
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
 *         description: Not found (question or customer not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
// Update a question
export const updateQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await questionService.updateQuestion(req.params.ques_id, req.body)
    res.status(HTTP_STATUS.OK).json({
      message: QUESTION_MESSAGES.QUESTION_UPDATED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /question/delete-question/{ques_id}:
 *   delete:
 *     summary: Delete a question
 *     description: Deletes a question by its ID. Cannot delete if question has a reply. Requires admin or customer role.
 *     tags: [Question]
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
 *         description: Question deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *       400:
 *         description: Bad request (e.g., question cannot be deleted due to existing reply)
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
 *         description: Not found (question not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
// Delete a question
export const deleteQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await questionService.deleteQuestion(req.params.ques_id)
    res.status(HTTP_STATUS.OK).json({
      message: QUESTION_MESSAGES.QUESTION_DELETED_SUCCESS
    })
  } catch (error) {
    next(error)
  }
}
