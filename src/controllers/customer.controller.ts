import { NextFunction, Request, Response } from 'express'
import HTTP_STATUS from '../constants/httpStatus.js'
import { CUSTOMER_MESSAGES } from '../constants/message.js'
import customerService from '../services/customer.service.js'

export const getCustomerController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await customerService.getCustomer()
  res.status(HTTP_STATUS.OK).json({
    message: CUSTOMER_MESSAGES.GET_CUSTOMER_SUCCESS,
    data: result
  })
}

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

export const createLaborarityAppointmentController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await customerService.createLaborarityAppointment(req.body)
  res.status(HTTP_STATUS.OK).json({
    message: CUSTOMER_MESSAGES.LABORARITY_APPOINTMENT_CREATED_SUCCESS,
    data: result
  })
}
