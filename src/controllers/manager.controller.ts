import { NextFunction, Request, Response } from 'express'
import HTTP_STATUS from '~/constants/httpStatus.js'
import { MANAGER_MESSAGES } from '~/constants/message.js'
import ManagerService from '~/services/manager.service.js'

export const getOverallController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ManagerService.getOverall()
    res.status(HTTP_STATUS.OK).json({
      message: MANAGER_MESSAGES.GET_OVERALL_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

export const getOverallWeeklyController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ManagerService.getOverallWeekly()
    res.status(HTTP_STATUS.OK).json({
      message: MANAGER_MESSAGES.GET_OVERALL_WEEKLY_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

export const getAppPercentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ManagerService.getAppPercent()
    res.status(HTTP_STATUS.OK).json({
      message: MANAGER_MESSAGES.GET_APP_PERCENT_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

export const getRecentAppController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ManagerService.getRecentApp()
    res.status(HTTP_STATUS.OK).json({
      message: MANAGER_MESSAGES.GET_RECENT_APP_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

export const getConsultantsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = req.query
    const result = await ManagerService.getConsultants(page as string, limit as string)
    res.status(HTTP_STATUS.OK).json({
      message: MANAGER_MESSAGES.GET_CONSULTANTS_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

export const getStaffsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = req.query
    const result = await ManagerService.getStaffs(page as string, limit as string)
    res.status(HTTP_STATUS.OK).json({
      message: MANAGER_MESSAGES.GET_STAFFS_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}
