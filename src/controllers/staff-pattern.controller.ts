import { Request, Response, NextFunction } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import { STAFF_PATTERN_MESSAGES } from '~/constants/message'
import staffPatternService from '~/services/staff-pattern.service'

export const addStaffPatternController = async (req: Request, res: Response, next: NextFunction) => {
  const { date, account_id, slot_id } = req.body
  const staffPattern = await staffPatternService.addStaffPattern(date, account_id, slot_id)
  return res.status(HTTP_STATUS.CREATED).json({
    message: STAFF_PATTERN_MESSAGES.ADD_STAFF_PATTERN_SUCCESS,
    data: staffPattern
  })
}

export const getStaffPatternController = async (req: Request, res: Response, next: NextFunction) => {
  const { date } = req.body
  const staffPattern = await staffPatternService.getStaffPattern(date)
  return res.status(HTTP_STATUS.OK).json({
    message: STAFF_PATTERN_MESSAGES.GET_STAFF_PATTERN_SUCCESS,
    data: staffPattern
  })
}

export const getAllStaffPatternController = async (req: Request, res: Response, next: NextFunction) => {
  const staffPattern = await staffPatternService.getAllStaffPattern()
  return res.status(HTTP_STATUS.OK).json({
    message: STAFF_PATTERN_MESSAGES.GET_ALL_STAFF_PATTERN_SUCCESS,
    data: staffPattern
  })
}

export const updateStaffPatternController = async (req: Request, res: Response, next: NextFunction) => {
  const { date, account_id, slot_id } = req.body
  const staffPattern = await staffPatternService.updateStaffPattern(date, account_id, slot_id)
  return res.status(HTTP_STATUS.OK).json({
    message: STAFF_PATTERN_MESSAGES.UPDATE_STAFF_PATTERN_SUCCESS,
    data: staffPattern
  })
}

export const deleteStaffPatternController = async (req: Request, res: Response, next: NextFunction) => {
  const { date } = req.body
  const staffPattern = await staffPatternService.deleteStaffPattern(date)
  return res.status(HTTP_STATUS.OK).json({
    message: STAFF_PATTERN_MESSAGES.STAFF_PATTERN_DELETED_SUCCESS,
    data: staffPattern
  })
}
