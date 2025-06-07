import { Request, Response, NextFunction } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import { LABORATORIES_MESSAGES } from '~/constants/message'
import { ErrorWithStatus } from '~/models/Error'
import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validations'
import laboratoryService from '~/services/laborarity.service'




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
