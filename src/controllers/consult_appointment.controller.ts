import { Request, Response, NextFunction } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import { CONSULTANT_APPOINTMENTS_MESSAGES } from '~/constants/message'
import consultAppointmentService from '~/services/consult_appointment.service'

// Create a new consult appointment
export const createConsultAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await consultAppointmentService.createConsultAppointment(req.body)
    res.status(HTTP_STATUS.CREATED).json({
      message: CONSULTANT_APPOINTMENTS_MESSAGES.CONSULT_APPOINTMENT_CREATED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

// Get all consult appointments
export const getAllConsultAppointments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await consultAppointmentService.getAllConsultAppointments()
    res.status(HTTP_STATUS.OK).json({
      message: CONSULTANT_APPOINTMENTS_MESSAGES.CONSULT_APPOINTMENTS_RETRIEVED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

// Get a consult appointment by ID
export const getConsultAppointmentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await consultAppointmentService.getConsultAppointmentById(req.params.app_id)
    res.status(HTTP_STATUS.OK).json({
      message: CONSULTANT_APPOINTMENTS_MESSAGES.CONSULT_APPOINTMENT_RETRIEVED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

// Get consult appointments by Customer ID
export const getConsultAppointmentsByCustomerId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await consultAppointmentService.getConsultAppointmentsByCustomerId(req.params.customer_id)
    res.status(HTTP_STATUS.OK).json({
      message: CONSULTANT_APPOINTMENTS_MESSAGES.CONSULT_APPOINTMENTS_RETRIEVED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

// Get consult appointment by Consultant Pattern ID
export const getConsultAppointmentsByPatternId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await consultAppointmentService.getConsultAppointmentsByPatternId(req.params.pattern_id)
    res.status(HTTP_STATUS.OK).json({
      message: CONSULTANT_APPOINTMENTS_MESSAGES.CONSULT_APPOINTMENT_RETRIEVED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

// Update a consult appointment
export const updateConsultAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await consultAppointmentService.updateConsultAppointment(req.params.app_id, req.body)
    res.status(HTTP_STATUS.OK).json({
      message: CONSULTANT_APPOINTMENTS_MESSAGES.CONSULT_APPOINTMENT_UPDATED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

// Delete a consult appointment
export const deleteConsultAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await consultAppointmentService.deleteConsultAppointment(req.params.app_id)
    res.status(HTTP_STATUS.OK).json({
      message: CONSULTANT_APPOINTMENTS_MESSAGES.CONSULT_APPOINTMENT_DELETED_SUCCESS
    })
  } catch (error) {
    next(error)
  }
}