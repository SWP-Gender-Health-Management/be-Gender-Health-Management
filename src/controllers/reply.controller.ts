import { Request, Response, NextFunction } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import { REPLY_MESSAGES } from '~/constants/message'
import replyService from '~/services/reply.service'

// Create a new reply
export const createReply = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await replyService.createReply(req.body)
    res.status(HTTP_STATUS.CREATED).json({
      message: REPLY_MESSAGES.REPLY_CREATED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

// Get all replies
export const getAllReplies = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await replyService.getAllReplies()
    res.status(HTTP_STATUS.OK).json({
      message: REPLY_MESSAGES.REPLIES_RETRIEVED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

// Get a reply by ID
export const getReplyById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await replyService.getReplyById(req.params.reply_id)
    res.status(HTTP_STATUS.OK).json({
      message: REPLY_MESSAGES.REPLY_RETRIEVED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

// Get replies by Consultant ID
export const getRepliesByConsultantId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await replyService.getRepliesByConsultantId(req.params.consultant_id)
    res.status(HTTP_STATUS.OK).json({
      message: REPLY_MESSAGES.REPLIES_RETRIEVED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

// Get reply by Question ID
export const getReplyByQuestionId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await replyService.getReplyByQuestionId(req.params.ques_id)
    res.status(HTTP_STATUS.OK).json({
      message: REPLY_MESSAGES.REPLY_RETRIEVED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

// Update a reply
export const updateReply = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await replyService.updateReply(req.params.reply_id, req.body)
    res.status(HTTP_STATUS.OK).json({
      message: REPLY_MESSAGES.REPLY_UPDATED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

// Delete a reply
export const deleteReply = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await replyService.deleteReply(req.params.reply_id)
    res.status(HTTP_STATUS.OK).json({
      message: REPLY_MESSAGES.REPLY_DELETED_SUCCESS
    })
  } catch (error) {
    next(error)
  }
}