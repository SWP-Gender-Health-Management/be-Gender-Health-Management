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

export const createStaffPatternController = async (req: Request, res: Response, next: NextFunction) => {
  const { date, account_id, slot_id } = req.body
  const staffPattern = await ManagerService.createStaffPattern(date, account_id, slot_id)
  res.status(HTTP_STATUS.CREATED).json({
    message: MANAGER_MESSAGES.CREATE_STAFF_PATTERN_SUCCESS,
    data: staffPattern
  })
}

export const createConsultantPatternController = async (req: Request, res: Response, next: NextFunction) => {
  const { date, consultant_id, slot_id } = req.body
  const consultantPattern = await ManagerService.createConsultantPattern(date, consultant_id, slot_id)
  res.status(HTTP_STATUS.CREATED).json({
    message: MANAGER_MESSAGES.CREATE_CONSULTANT_PATTERN_SUCCESS,
    data: consultantPattern
  })
}

export const getStaffPatternController = async (req: Request, res: Response, next: NextFunction) => {
  const { staff_id } = req.body
  const staffPattern = await ManagerService.getStaffPattern(staff_id)
  res.status(HTTP_STATUS.OK).json({
    message: MANAGER_MESSAGES.GET_STAFF_PATTERN_SUCCESS,
    data: staffPattern
  })
}

export const getConsultantPatternController = async (req: Request, res: Response, next: NextFunction) => {
  const { consultant_id } = req.body
  const consultantPattern = await ManagerService.getConsultantPattern(consultant_id)
  res.status(HTTP_STATUS.OK).json({
    message: MANAGER_MESSAGES.GET_CONSULTANT_PATTERN_SUCCESS,
    data: consultantPattern
  })
}
