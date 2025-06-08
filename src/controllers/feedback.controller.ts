import { Request, Response, NextFunction } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import { FEEDBACK_MESSAGES } from '~/constants/message'
import feedbackService from '~/services/feedback.service'

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