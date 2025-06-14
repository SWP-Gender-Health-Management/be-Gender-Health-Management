import { NextFunction, Request, Response } from 'express'
import HTTP_STATUS from '~/constants/httpStatus.js'
import { LABORARITY_MESSAGES, RESULT_MESSAGES } from '~/constants/message.js'
import staffService from '~/services/staff.service.js'

export const updateResultController = async (req: Request, res: Response, next: NextFunction) => {
  const { app_id, result } = req.body
  const resultData = await staffService.updateResult(app_id, result as any[])
  if (!resultData) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: RESULT_MESSAGES.RESULT_CREATE_FAILED,
      data: resultData
    })
  }
  if (resultData.length < result.length) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: RESULT_MESSAGES.RESULT_CREATE_NOT_ENOUGH_DATA,
      data: resultData
    })
  }
  return res.status(HTTP_STATUS.OK).json({
    message: RESULT_MESSAGES.RESULT_CREATED_SUCCESS,
    data: resultData
  })
}

export const updateAppointmentStatusController = async (req: Request, res: Response, next: NextFunction) => {
  const { appointment_id, status } = req.body
  const appointmentStatus = await staffService.updateAppointmentStatus(appointment_id, status)
  return res.status(HTTP_STATUS.OK).json({
    message: LABORARITY_MESSAGES.APPOINTMENT_STATUS_UPDATED_SUCCESS,
    data: appointmentStatus
  })
}
