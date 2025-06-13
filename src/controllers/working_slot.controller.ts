import { NextFunction, Request, Response } from 'express'
import HTTP_STATUS from '~/constants/httpStatus.js'
import { WORKING_SLOT_MESSAGES } from '~/constants/message.js'
import workingSlotService from '~/services/workig_slot.service.js'

export const addSlotController = async (req: Request, res: Response, next: NextFunction) => {
  const { name, start_at, end_at, type } = req.body
  const slot = await workingSlotService.addSlot(name, start_at, end_at, type)
  return res.status(HTTP_STATUS.OK).json({
    message: WORKING_SLOT_MESSAGES.WORKING_SLOT_CREATED_SUCCESS,
    data: slot
  })
}

export const getSlotByTypeController = async (req: Request, res: Response, next: NextFunction) => {
  const { type } = req.query
  const slot = await workingSlotService.getSlotByType(type as string)
  return res.status(HTTP_STATUS.OK).json({
    message: WORKING_SLOT_MESSAGES.GET_SLOT_SUCCESS,
    data: slot
  })
}

export const getSlotController = async (req: Request, res: Response, next: NextFunction) => {
  const slot = await workingSlotService.getSlot()
  return res.status(HTTP_STATUS.OK).json({
    message: WORKING_SLOT_MESSAGES.GET_SLOT_SUCCESS,
    data: slot
  })
}

export const updateSlotController = async (req: Request, res: Response, next: NextFunction) => {
  const { id, name, start_at, end_at, type } = req.body
  const slot = await workingSlotService.updateSlot(id, name, start_at, end_at, type)
  return res.status(HTTP_STATUS.OK).json({
    message: WORKING_SLOT_MESSAGES.WORKING_SLOT_UPDATED_SUCCESS,
    data: slot
  })
}

export const deleteSlotController = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.body
  const slot = await workingSlotService.deleteSlot(id)
  return res.status(HTTP_STATUS.OK).json({
    message: WORKING_SLOT_MESSAGES.WORKING_SLOT_DELETED_SUCCESS,
    data: slot
  })
}
