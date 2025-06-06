import { Request, Response, NextFunction } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import { CONSULT_REPORT_MESSAGES } from '~/constants/message'
import consultReportService from '~/services/consult_report.service'

// Create a new consult report
export const createConsultReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await consultReportService.createConsultReport(req.body)
    res.status(HTTP_STATUS.CREATED).json({
      message: CONSULT_REPORT_MESSAGES.REPORT_CREATED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

// Get all consult reports
export const getAllConsultReports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await consultReportService.getAllConsultReports()
    res.status(HTTP_STATUS.OK).json({
      message: CONSULT_REPORT_MESSAGES.REPORTS_RETRIEVED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

// Get a consult report by ID
export const getByIdConsultReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await consultReportService.getConsultReportById(req.params.report_id)
    res.status(HTTP_STATUS.OK).json({
      message: CONSULT_REPORT_MESSAGES.REPORT_RETRIEVED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

// Get consult report by Consult Appointment ID
export const getConsultReportByAppointmentId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await consultReportService.getConsultReportByAppointmentId(req.params.app_id)
    res.status(HTTP_STATUS.OK).json({
      message: CONSULT_REPORT_MESSAGES.REPORT_RETRIEVED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

// Update a consult report
export const updateConsultReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await consultReportService.updateConsultReport(req.params.report_id, req.body)
    res.status(HTTP_STATUS.OK).json({
      message: CONSULT_REPORT_MESSAGES.REPORT_UPDATED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

// Delete a consult report
export const deleteConsultReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await consultReportService.deleteConsultReport(req.params.report_id)
    res.status(HTTP_STATUS.OK).json({
      message: CONSULT_REPORT_MESSAGES.REPORT_DELETED_SUCCESS
    })
  } catch (error) {
    next(error)
  }
}