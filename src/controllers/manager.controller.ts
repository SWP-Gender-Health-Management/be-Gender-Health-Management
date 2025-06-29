import { NextFunction, Request, Response } from 'express'
import HTTP_STATUS from '~/constants/httpStatus.js'
import { MANAGER_MESSAGES } from '~/constants/message.js'
import ManagerService from '~/services/manager.service.js'

export const reportPerformanceController = async (req: Request, res: Response, next: NextFunction) => {
  const performanceReport = await ManagerService.reportPerformance()
  res.status(HTTP_STATUS.OK).json({
    message: MANAGER_MESSAGES.PERFORMANCE_REPORT_SUCCESS,
    data: performanceReport
  })
}

export const reportCustomerController = async (req: Request, res: Response, next: NextFunction) => {
  const { dateText } = req.query
  const customerReport = await ManagerService.reportCustomer(dateText as string)
  res.status(HTTP_STATUS.OK).json({
    message: MANAGER_MESSAGES.REPORT_SUCCESS,
    data: customerReport
  })
}
