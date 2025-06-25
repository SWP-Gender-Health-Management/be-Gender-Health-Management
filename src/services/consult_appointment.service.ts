import { Repository } from 'typeorm'
import { AppDataSource } from '../config/database.config.js'
import HTTP_STATUS from '../constants/httpStatus.js'
import { CONSULTANT_APPOINTMENTS_MESSAGES } from '../constants/message.js'
import { ErrorWithStatus } from '../models/Error.js'
import ConsultAppointment, { ConsultAppointmentType } from '../models/Entity/consult_appointment.entity.js'
import ConsultantPattern from '../models/Entity/consultant_pattern.entity.js'
import Account from '../models/Entity/account.entity.js'
import { Role } from '../enum/role.enum.js'
import { StatusAppointment } from '../enum/statusAppointment.enum.js'
import Feedback from '../models/Entity/feedback.entity.js'
import { TypeAppointment } from '../enum/type_appointment.enum.js'
import LIMIT from '~/constants/limit.js'

const consultAppointmentRepository = AppDataSource.getRepository(ConsultAppointment)
const consultantPatternRepository = AppDataSource.getRepository(ConsultantPattern)
const accountRepository = AppDataSource.getRepository(Account)
const feedbackRepository = AppDataSource.getRepository(Feedback)

export class ConsultAppointmentService {
  /**
   * @description Create a new consult appointment
   * @param pattern_id - The ID of the consultant pattern
   * @returns The created consult appointment
   */
  // Create a new consult appointment
  async createConsultAppointment(
    pattern_id: string,
    customer_id: string,
    description: string,
    status: StatusAppointment
  ): Promise<ConsultAppointment> {
    // Validate consultant pattern
    const consultantPattern = await consultantPatternRepository.findOne({
      where: { pattern_id },
      relations: ['consult_appointment']
    })
    if (!consultantPattern) {
      throw new ErrorWithStatus({
        message: CONSULTANT_APPOINTMENTS_MESSAGES.CONSULTANT_PATTERN_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Check if pattern is already booked
    if (consultantPattern.is_booked || consultantPattern.consult_appointment) {
      throw new ErrorWithStatus({
        message: CONSULTANT_APPOINTMENTS_MESSAGES.CONSULTANT_PATTERN_ALREADY_BOOKED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Validate customer (account)
    const customer = await accountRepository.findOne({ where: { account_id: customer_id } })
    if (!customer || customer.role !== Role.CUSTOMER) {
      throw new ErrorWithStatus({
        message: CONSULTANT_APPOINTMENTS_MESSAGES.CUSTOMER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const consultAppointment = consultAppointmentRepository.create({
      consultant_pattern: consultantPattern,
      customer: customer,
      description: description || '',
      status: status || StatusAppointment.PENDING
    })
    const savedConsultAppointment = await consultAppointmentRepository.save(consultAppointment)

    if (savedConsultAppointment) {
      await consultantPatternRepository.update(consultantPattern.pattern_id, {
        is_booked: true,
        consult_appointment: savedConsultAppointment
      });
    }
    const updatedAccount = await accountRepository.findOne({
      where: { account_id: customer_id },
      relations: ['consult_appointment'],
    });
    console.log('Updated consult_appointment array:', updatedAccount);
    return savedConsultAppointment
  }

  /**
   * @description Get all consult appointments
   * @param filter - The filter for the consult appointments
   * @param pageVar - The page and limit for the consult appointments
   * @returns The consult appointments
   */
  // Get all consult appointments
  async getAllConsultAppointments(pageVar: { limit: number, page: number }): Promise<ConsultAppointment[]> {
    let { limit, page } = pageVar;
    if (!limit || !page) {
      limit = LIMIT.default;
      page = 1;
    }
    const skip = (page - 1) * limit
    return await consultAppointmentRepository.find({
      skip,
      take: limit,
      relations: [
        'consultant_pattern',
        'consultant_pattern.working_slot',
        'consultant_pattern.consultant',
        'customer',
        'report'
      ]
    })
  }

  /**
   * @description Get a consult appointment by ID
   * @param app_id - The ID of the consult appointment
   * @returns The consult appointment
   */
  // Get a consult appointment by ID
  async getConsultAppointmentById(app_id: string): Promise<ConsultAppointment> {
    const consultAppointment = await consultAppointmentRepository.findOne({
      where: { app_id },
      relations: [
        'consultant_pattern',
        'consultant_pattern.working_slot',
        'consultant_pattern.consultant',
        'customer',
        'report'
      ]
    })

    if (!consultAppointment) {
      throw new ErrorWithStatus({
        message: CONSULTANT_APPOINTMENTS_MESSAGES.CONSULT_APPOINTMENT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return consultAppointment
  }

  /**
   * @description Get consult appointments by Customer ID
   * @param customer_id - The ID of the customer
   * @param filter - The filter for the consult appointments
   * @param pageVar - The page and limit for the consult appointments
   * @returns The consult appointments
   */
  // Get consult appointments by Customer ID
  async getConsultAppointmentsByCustomerId(customer_id: string, pageVar: { limit: number, page: number }): Promise<ConsultAppointment[]> {
    let { limit, page } = pageVar;
    if (!limit || !page) {
      limit = LIMIT.default;
      page = 1;
    }
    const skip = (page - 1) * limit
    const customer = await accountRepository.findOne({ where: { account_id: customer_id } })
    if (!customer || customer.role !== Role.CUSTOMER) {
      throw new ErrorWithStatus({
        message: CONSULTANT_APPOINTMENTS_MESSAGES.CUSTOMER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const consultAppointments = await consultAppointmentRepository.find({
      where: { customer: { account_id: customer_id } },
      skip,
      take: limit,
      relations: [
        'consultant_pattern',
        'consultant_pattern.working_slot',
        'consultant_pattern.consultant',
        'customer',
        'report'
      ]
    })

    if (!consultAppointments.length) {
      throw new ErrorWithStatus({
        message: CONSULTANT_APPOINTMENTS_MESSAGES.CONSULT_APPOINTMENT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return consultAppointments
  }

  /**
   * @description Get consult appointments by Consultant Pattern ID
   * @param pattern_id - The ID of the consultant pattern
   * @returns The consult appointments
   */
  // Get consult appointments by Consultant Pattern ID
  async getConsultAppointmentsByPatternId(pattern_id: string): Promise<ConsultAppointment> {
    const consultantPattern = await consultantPatternRepository.findOne({ where: { pattern_id } })
    if (!consultantPattern) {
      throw new ErrorWithStatus({
        message: CONSULTANT_APPOINTMENTS_MESSAGES.CONSULTANT_PATTERN_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const consultAppointment = await consultAppointmentRepository.findOne({
      where: { consultant_pattern: consultantPattern },
      relations: [
        'consultant_pattern',
        'consultant_pattern.working_slot',
        'consultant_pattern.consultant',
        'customer',
        'report'
      ]
    })

    if (!consultAppointment) {
      throw new ErrorWithStatus({
        message: CONSULTANT_APPOINTMENTS_MESSAGES.CONSULT_APPOINTMENT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return consultAppointment
  }

  /**
   * @description Update a consult appointment
   * @param app_id - The ID of the consult appointment
   * @param data - The data for the consult appointment
   * @returns The updated consult appointment
   */
  // Update a consult appointment
  async updateConsultAppointment(app_id: string, data: any): Promise<ConsultAppointment> {
    const consultAppointment = await this.getConsultAppointmentById(app_id)
    // Validate consultant pattern if provided
    let consultantPattern
    if (data.pattern_id && data.pattern_id !== consultAppointment.consultant_pattern.pattern_id) {
      consultantPattern = await consultantPatternRepository.findOne({
        where: { pattern_id: data.pattern_id },
        relations: ['consult_appointment']
      })
      if (!consultantPattern) {
        throw new ErrorWithStatus({
          message: CONSULTANT_APPOINTMENTS_MESSAGES.CONSULTANT_PATTERN_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
      if (consultantPattern.is_booked || consultantPattern.consult_appointment) {
        throw new ErrorWithStatus({
          message: CONSULTANT_APPOINTMENTS_MESSAGES.CONSULTANT_PATTERN_ALREADY_BOOKED,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
    }

    // Validate customer if provided
    let customer
    if (data.customer_id && data.customer_id !== consultAppointment.customer.account_id) {
      customer = await accountRepository.findOne({ where: { account_id: data.customer_id } })
      if (!customer || customer.role !== Role.CUSTOMER) {
        throw new ErrorWithStatus({
          message: CONSULTANT_APPOINTMENTS_MESSAGES.CUSTOMER_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
    }

    // Update the old consultant pattern to unbooked if pattern_id is changed
    if (consultantPattern) {
      const oldPattern = await consultantPatternRepository.findOne({
        where: { pattern_id: consultAppointment.consultant_pattern.pattern_id }
      })
      if (oldPattern) {
        oldPattern.is_booked = false
        await consultantPatternRepository.save(oldPattern)
      }
      consultantPattern.is_booked = true
      await consultantPatternRepository.save(consultantPattern)
    }

    Object.assign(consultAppointment, {
      consultant_pattern: consultantPattern || consultAppointment.consultant_pattern,
      customer: customer || consultAppointment.customer,
      description: data.description || consultAppointment.description,
      status: data.status || consultAppointment.status
    })

    return await consultAppointmentRepository.save(consultAppointment)
  }

  /**
   * @description Delete a consult appointment
   * @param app_id - The ID of the consult appointment
   * @returns The deleted consult appointment
   */
  // Delete a consult appointment
  async deleteConsultAppointment(app_id: string): Promise<void> {
    const consultAppointment = await this.getConsultAppointmentById(app_id)
    // const feedback = await feedbackRepository.findOne({
    //   where: { app_id: consultAppointment.app_id, type: TypeAppointment.CONSULT }
    // })
    // // Check if appointment has associated feedback
    // if (feedback) {
    //   throw new ErrorWithStatus({
    //     message: CONSULTANT_APPOINTMENTS_MESSAGES.CONSULT_APPOINTMENT_CANNOT_DELETE,
    //     status: HTTP_STATUS.BAD_REQUEST
    //   })
    // }

    // Update consultant pattern to unbooked
    const consultantPattern = await consultantPatternRepository.findOne({
      where: { pattern_id: consultAppointment.consultant_pattern.pattern_id }
    })
    if (consultantPattern) {
      consultantPattern.is_booked = false
      await consultantPatternRepository.save(consultantPattern)
    }

    await consultAppointmentRepository.remove(consultAppointment)
  }
}

const consultAppointmentService = new ConsultAppointmentService()
export default consultAppointmentService
