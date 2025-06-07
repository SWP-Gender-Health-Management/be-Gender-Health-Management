import { Request, Response, NextFunction } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import { CONSULTANT_PATTERNS_MESSAGES } from '~/constants/message'
import consultantPatternService from '~/services/consultant_pattern.service'




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

// Get all consultant patterns
export const getAllConsultantPatterns = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await consultantPatternService.getAllConsultantPatterns()
    res.status(HTTP_STATUS.OK).json({
      message: CONSULTANT_PATTERNS_MESSAGES.CONSULTANT_PATTERNS_RETRIEVED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

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

