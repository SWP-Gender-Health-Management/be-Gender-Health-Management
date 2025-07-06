import { NextFunction, Request, Response } from 'express'
import { Like } from 'typeorm'
import HTTP_STATUS from '~/constants/httpStatus.js'
import { MANAGER_MESSAGES } from '~/constants/message.js'
import managerService from '~/services/manager.service.js'
import { stringToStatus } from '~/enum/statusAppointment.enum.js'

export const getOverallController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await managerService.getOverall()
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
    const result = await managerService.getOverallWeekly()
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
    const result = await managerService.getAppPercent()
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
    const result = await managerService.getRecentApp()
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
    let { isBan } = req.body
    isBan = isBan === 'undefined' ? undefined : isBan.boolean()
    const result = await managerService.getConsultants(page as string, limit as string, isBan)
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
    let { isBan } = req.body
    isBan = isBan === 'undefined' ? undefined : isBan.boolean()
    const result = await managerService.getStaffs(page as string, limit as string, isBan)
    res.status(HTTP_STATUS.OK).json({
      message: MANAGER_MESSAGES.GET_STAFFS_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

export const getConAppController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit, page } = req.query
    const pageVar = {
      limit: parseInt(limit as string) || 10,
      page: parseInt(page as string) || 1
    }
    const { fullname, status, date } = req.body
    const filter = {
      fullname: fullname as string,
      status: status as number,
      date: date as string
    }
    const result = await managerService.getConApp(pageVar, filter)
    res.status(HTTP_STATUS.OK).json({
      message: MANAGER_MESSAGES.GET_CON_APP_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

export const getLabAppController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit, page } = req.query
    const pageVar = {
      limit: parseInt(limit as string) || 10,
      page: parseInt(page as string) || 1
    }
    const { fullname, status, date } = req.body
    const filter = {
      fullname: fullname as string,
      status: status as number,
      date: date as string
    }
    const result = await managerService.getLabApp(pageVar, filter)
    res.status(HTTP_STATUS.OK).json({
      message: MANAGER_MESSAGES.GET_LAB_APP_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

export const getMensOverallController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await managerService.getMensOverall()
    res.status(HTTP_STATUS.OK).json({
      message: MANAGER_MESSAGES.GET_MENS_OVERALL_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

export const getMensPercentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await managerService.getMensPercent()
    res.status(HTTP_STATUS.OK).json({
      message: MANAGER_MESSAGES.GET_MENS_PERCENT_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}
