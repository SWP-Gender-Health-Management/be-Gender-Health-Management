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
    const { is_banned, full_name } = req.query
    let isBan = is_banned === 'undefined' ? undefined : (is_banned === 'true' ? true : false)
    const result = await managerService.getConsultants(page as string, limit as string, isBan, full_name as string)
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
    const { fullname, status, date } = req.query
    const filter = {
      fullname: fullname ? (fullname as string) : '',
      status: status ? (status as string) : '',
      date: date ? (date as string) : ''
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

export const getMensAgePercentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await managerService.getMensAgePercent()
    res.status(HTTP_STATUS.OK).json({
      message: MANAGER_MESSAGES.GET_MENS_AGE_PERCENT_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

export const getMensPeriodPercentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await managerService.getMensPeriodPercent()
    res.status(HTTP_STATUS.OK).json({
      message: MANAGER_MESSAGES.GET_MENS_PERIOD_PERCENT_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

export const getBlogsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = req.query
    const pageVar = {
      limit: parseInt(limit as string) || 10,
      page: parseInt(page as string) || 1
    }
    const { title, content, author, status } = req.query
    const statusBlog = status === 'undefined' ? undefined : status
    const filter = {
      title: title as string,
      content: content as string,
      author: author as string,
      status: statusBlog as string
    }
    const result = await managerService.getBlogs(pageVar, filter)
    res.status(HTTP_STATUS.OK).json({
      message: MANAGER_MESSAGES.GET_BLOGS_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

export const getQuestionsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = req.query
    const pageVar = {
      limit: parseInt(limit as string) || 10,
      page: parseInt(page as string) || 1
    }
    const { status, is_replied } = req.query
    const result = await managerService.getQuestions(pageVar, status as string | undefined, is_replied as string | undefined)
    res.status(HTTP_STATUS.OK).json({
      message: MANAGER_MESSAGES.GET_QUESTIONS_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

export const getRefundInfoByAppId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { app_id } = req.params
    const result = await managerService.getRefundInfoByAppId(app_id as string)
    res.status(HTTP_STATUS.OK).json({
      message: MANAGER_MESSAGES.CONSULT_APPOINTMENT_REFUND_RETRIEVED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

export const refundLabAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { app_id } = req.params
    const result = await managerService.refundLabAppointment(app_id as string)
    res.status(HTTP_STATUS.OK).json({
      message: MANAGER_MESSAGES.CONSULT_APPOINTMENT_REFUND_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

export const setBlogStatusController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, blog_id } = req.body
    const result = await managerService.setBlogStatus(blog_id as string, status as string)
    res.status(HTTP_STATUS.OK).json({
      message: MANAGER_MESSAGES.BLOG_STATUS_UPDATED,
      result
    })
  } catch (error) {
    next(error)
  }
}

export const setQuestionStatusController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, ques_id } = req.body
    const result = await managerService.setQuestionStatus(ques_id as string, status as string)
    res.status(HTTP_STATUS.OK).json({
      message: MANAGER_MESSAGES.QUESTION_STATUS_UPDATED,
      result
    })
  } catch (error) {
    next(error)
  }
}
