import { Request, Response, NextFunction } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import { QUESTION_MESSAGES } from '~/constants/message'
import questionService from '~/services/question.service'

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

// Get all questions
export const getAllQuestions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await questionService.getAllQuestions()
    res.status(HTTP_STATUS.OK).json({
      message: QUESTION_MESSAGES.QUESTIONS_RETRIEVED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

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

// Get questions by Customer ID
export const getQuestionsByCustomerId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await questionService.getQuestionsByCustomerId(req.params.customer_id)
    res.status(HTTP_STATUS.OK).json({
      message: QUESTION_MESSAGES.QUESTIONS_RETRIEVED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

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