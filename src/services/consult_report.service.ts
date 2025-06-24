import { Repository } from 'typeorm'
import { AppDataSource } from '../config/database.config.js'
import HTTP_STATUS from '../constants/httpStatus.js'
import { CONSULT_REPORT_MESSAGES } from '../constants/message.js'
import { ErrorWithStatus } from '../models/Error.js'
import ConsultReport, { ConsultReportType } from '../models/Entity/consult_report.entity.js'
import ConsultAppointment from '../models/Entity/consult_appointment.entity.js'
import LIMIT from '~/constants/limit.js'

const consultReportRepository = AppDataSource.getRepository(ConsultReport)
const consultAppointmentRepository = AppDataSource.getRepository(ConsultAppointment)

export class ConsultReportService {
  /**
   * @description Create a new consult report
   * @param app_id - The ID of the consult appointment
   * @param name - The name of the consult report
   * @param description - The description of the consult report
   * @returns The created consult report
   */
  // Create a new consult report
  async createConsultReport(app_id: string, name: string, description: string): Promise<ConsultReport> {
    // Validate consult appointment
    const consultAppointment = await consultAppointmentRepository.findOne({
      where: { app_id },
      relations: ['report']
    })
    if (!consultAppointment) {
      throw new ErrorWithStatus({
        message: CONSULT_REPORT_MESSAGES.CONSULT_APPOINTMENT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Check if consult appointment already has a report
    if (consultAppointment.report) {
      throw new ErrorWithStatus({
        message: CONSULT_REPORT_MESSAGES.REPORT_ALREADY_EXISTS,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Validate name
    if (!name || name.trim() === '') {
      throw new ErrorWithStatus({
        message: CONSULT_REPORT_MESSAGES.NAME_REQUIRED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Validate description
    if (!description || description.trim() === '') {
      throw new ErrorWithStatus({
        message: CONSULT_REPORT_MESSAGES.DESCRIPTION_REQUIRED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const consultReport = consultReportRepository.create({
      consult_appointment: consultAppointment,
      name: name || '',
      description: description || ''
    })

    // Save the consult report
    const savedReport = await consultReportRepository.save(consultReport)

    // Assign the report to the consult appointment and save
    consultAppointment.report = savedReport
    await consultAppointmentRepository.save(consultAppointment)

    return savedReport
  }

  /**
   * @description Get all consult reports
   * @param filter - The filter for the consult reports
   * @param pageVar - The page and limit for the consult reports
   * @returns The consult reports
   */
  // Get all consult reports
  async getAllConsultReports(pageVar: { limit: number, page: number }): Promise<ConsultReport[]> {
    let {limit, page} = pageVar;
    if(!limit || !page) {
      limit = LIMIT.default;
      page = 1;
    }
    const skip = (page - 1) * limit
    return await consultReportRepository.find({
      skip,
      take: limit,
      relations: ['consult_appointment']
    })
  }

  /**
   * @description Get a consult report by ID
   * @param report_id - The ID of the consult report
   * @returns The consult report
   */
  // Get a consult report by ID
  async getConsultReportById(report_id: string): Promise<ConsultReport> {
    const consultReport = await consultReportRepository.findOne({
      where: { report_id },
      relations: ['consult_appointment']
    })

    if (!consultReport) {
      throw new ErrorWithStatus({
        message: CONSULT_REPORT_MESSAGES.REPORT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return consultReport
  }

  /**
   * @description Get a consult report by Consult Appointment ID
   * @param app_id - The ID of the consult appointment
   * @returns The consult report
   */
  // Get consult report by Consult Appointment ID
  async getConsultReportByAppointmentId(app_id: string): Promise<ConsultReport> {
    const consultAppointment = await consultAppointmentRepository.findOne({ where: { app_id } })
    if (!consultAppointment) {
      throw new ErrorWithStatus({
        message: CONSULT_REPORT_MESSAGES.CONSULT_APPOINTMENT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const consultReport = await consultReportRepository.findOne({
      where: { consult_appointment: consultAppointment },
      relations: ['consult_appointment']
    })

    if (!consultReport) {
      throw new ErrorWithStatus({
        message: CONSULT_REPORT_MESSAGES.REPORT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return consultReport
  }

  /**
   * @description Update a consult report
   * @param report_id - The ID of the consult report
   * @param data - The data for the consult report
   * @returns The updated consult report
   */
  // Update a consult report
  async updateConsultReport(report_id: string, data: any): Promise<ConsultReport> {
    const consultReport = await this.getConsultReportById(report_id)
    let consultAppointment

    // Validate consult appointment if provided
    if (data.app_id && data.app_id !== consultReport.consult_appointment.app_id) {
      consultAppointment = await consultAppointmentRepository.findOne({
        where: { app_id: data.app_id },
        relations: ['report']
      })
      if (!consultAppointment) {
        throw new ErrorWithStatus({
          message: CONSULT_REPORT_MESSAGES.CONSULT_APPOINTMENT_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
      // Check if the new consult appointment already has a report
      if (consultAppointment.report && consultAppointment.report.report_id !== report_id) {
        throw new ErrorWithStatus({
          message: CONSULT_REPORT_MESSAGES.REPORT_ALREADY_EXISTS,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
    }

    // Validate name if provided
    if (data.name && data.name.trim() === '') {
      throw new ErrorWithStatus({
        message: CONSULT_REPORT_MESSAGES.NAME_REQUIRED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Validate description if provided
    if (data.description && data.description.trim() === '') {
      throw new ErrorWithStatus({
        message: CONSULT_REPORT_MESSAGES.DESCRIPTION_REQUIRED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    Object.assign(consultReport, {
      consult_appointment: consultAppointment || consultReport.consult_appointment,
      name: data.name || consultReport.name,
      description: data.description || consultReport.description
    })

    // Save the updated report
    const updatedReport = await consultReportRepository.save(consultReport)

    // If consult appointment changed, update the old and new appointments
    if (consultAppointment) {
      // Remove report from old appointment
      const oldAppointment = await consultAppointmentRepository.findOne({
        where: { report: { report_id: report_id } }
      })
      if (oldAppointment && oldAppointment.app_id !== consultAppointment.app_id) {
        oldAppointment.report = null
        await consultAppointmentRepository.save(oldAppointment)
      }
      // Assign report to new appointment
      consultAppointment.report = updatedReport
      await consultAppointmentRepository.save(consultAppointment)
    }

    return updatedReport
  }

  /**
   * @description Delete a consult report
   * @param report_id - The ID of the consult report
   * @returns The deleted consult report
   */
  // Delete a consult report
  async deleteConsultReport(report_id: string): Promise<void> {
    const consultReport = await this.getConsultReportById(report_id)

    // Remove the report reference from the associated consult appointment
    const consultAppointment = await consultAppointmentRepository.findOne({
      where: { report: { report_id: report_id } },
      relations: ['report']
    })

    if (consultAppointment) {
      consultAppointment.report = null
      await consultAppointmentRepository.save(consultAppointment)
    }

    // Delete the consult report
    await consultReportRepository.remove(consultReport)
  }
}

const consultReportService = new ConsultReportService()
export default consultReportService
