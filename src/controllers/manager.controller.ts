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
