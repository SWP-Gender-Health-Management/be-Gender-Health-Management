import { json, NextFunction, Request, Response } from 'express'
import { WORKING_SLOT_MESSAGES } from '~/constants/message'
import { TypeAppointment } from '~/enum/type_appointment.enum'
import workingSlotService from '~/services/workig_slot.service'

export const addSlotController = async (req: Request, res: Response, next: NextFunction) => {
  const { name, start_at, end_at, type } = req.body
  const slot = await workingSlotService.addSlot(name, start_at, end_at, type)
  return res.status(200).json({
    message: WORKING_SLOT_MESSAGES.WORKING_SLOT_CREATED_SUCCESS,
    data: slot
  })
}

export const getSlotByTypeController = async (req: Request, res: Response, next: NextFunction) => {
  const { type } = req.body
  const slot = await workingSlotService.getSlotByType(type)
  return res.status(200).json({
    message: WORKING_SLOT_MESSAGES.GET_SLOT_SUCCESS,
    data: slot
  })
}

export const getSlotController = async (req: Request, res: Response, next: NextFunction) => {
  const slot = await workingSlotService.getSlot()
  return res.status(200).json({
    message: WORKING_SLOT_MESSAGES.GET_SLOT_SUCCESS,
    data: slot
  })
}

export const updateSlotController = async (req: Request, res: Response, next: NextFunction) => {
  const { id, name, start_at, end_at, type } = req.body
  const slot = await workingSlotService.updateSlot(id, name, start_at, end_at, type)
  return res.status(200).json({
    message: WORKING_SLOT_MESSAGES.WORKING_SLOT_UPDATED_SUCCESS,
    data: slot
  })
}

export const deleteSlotController = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.body
  const slot = await workingSlotService.deleteSlot(id)
  return res.status(200).json({
    message: WORKING_SLOT_MESSAGES.WORKING_SLOT_DELETED_SUCCESS,
    data: slot
  })
}
