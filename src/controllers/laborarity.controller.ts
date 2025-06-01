import { Request, Response, NextFunction } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import { LABORATORIES_MESSAGES } from '~/constants/message'
import { ErrorWithStatus } from '~/models/Error'
import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validations'
import laboratoryService from '~/services/laborarity.service'

export class LaboratoryController {
  

  // Create a new laboratory
  async create(req: Request, res: Response, next: NextFunction) {
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
  async getAll(req: Request, res: Response, next: NextFunction) {
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
  async getById(req: Request, res: Response, next: NextFunction) {
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
  async update(req: Request, res: Response, next: NextFunction) {
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
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await laboratoryService.deleteLaboratory(req.params.lab_id)
      res.status(HTTP_STATUS.OK).json({
        message: LABORATORIES_MESSAGES.LABORATORY_DELETED_SUCCESS
      })
    } catch (error) {
      next(error)
    }
  }
}

const laboratoryController = new LaboratoryController()
export default laboratoryController