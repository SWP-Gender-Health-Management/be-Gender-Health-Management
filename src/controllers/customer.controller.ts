import { NextFunction, Request, Response } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import customerService from '~/services/customer.service'

export const trackPeriodController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await customerService.createMenstrualCycle(req.body)
  res.status(HTTP_STATUS.OK).json(result)
}

export const predictPeriodController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await customerService.predictPeriod(req.body)
  res.status(HTTP_STATUS.OK).json(result)
}

export const updateMenstrualCycleController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await customerService.updateMenstrualCycle(req.body)
  res.status(HTTP_STATUS.OK).json(result)
}

export const createNotificationController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await customerService.createNotification(req.body)
  res.status(HTTP_STATUS.OK).json(result)
}
