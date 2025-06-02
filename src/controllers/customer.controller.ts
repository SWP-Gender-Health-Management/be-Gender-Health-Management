import { NextFunction, Request, Response } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import { CUSTOMER_MESSAGES } from '~/constants/message'
import customerService from '~/services/customer.service'

export const trackPeriodController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await customerService.createMenstrualCycle(req.body)
  res.status(HTTP_STATUS.OK).json({
    message: CUSTOMER_MESSAGES.CREATE_MENSTRUAL_CYCLE_SUCCESS,
    data: result
  })
}

export const predictPeriodController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await customerService.predictPeriod(req.body)
  res.status(HTTP_STATUS.OK).json({
    message: CUSTOMER_MESSAGES.PREDICT_PERIOD_SUCCESS,
    data: result
  })
}

export const updateMenstrualCycleController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await customerService.updateMenstrualCycle(req.body)
  res.status(HTTP_STATUS.OK).json({
    message: CUSTOMER_MESSAGES.MENSTRUAL_CYCLE_UPDATED,
    data: result
  })
}

export const createNotificationController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await customerService.createNotification(req.body)
  res.status(HTTP_STATUS.OK).json({
    message: CUSTOMER_MESSAGES.MENSTRUAL_CYCLE_SCHEDULED_NOTIFICATION,
    data: result
  })
}
