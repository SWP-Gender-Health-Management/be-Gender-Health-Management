import { Between, DeleteResult, Repository, UpdateResult } from 'typeorm'
import { AppDataSource } from '../config/database.config.js'
import HTTP_STATUS from '../constants/httpStatus.js'
import { CONSULTANT_PATTERNS_MESSAGES } from '../constants/message.js'
import { ErrorWithStatus } from '../models/Error.js'
import ConsultantPattern, { ConsultantPatternType } from '../models/Entity/consultant_pattern.entity.js'
import WorkingSlot from '../models/Entity/working_slot.entity.js'
import Account from '../models/Entity/account.entity.js'
import { Role } from '../enum/role.enum.js'
import LIMIT from '~/constants/limit.js'
import { TypeAppointment } from '~/enum/type_appointment.enum.js'

const consultantPatternRepository = AppDataSource.getRepository(ConsultantPattern)
const workingSlotRepository = AppDataSource.getRepository(WorkingSlot)
const accountRepository = AppDataSource.getRepository(Account)

export class ConsultantPatternService {
  /**
   * @description Create a new consultant pattern
   * @param slot_id - The ID of the working slot
   * @param consultant_id - The ID of the consultant
   * @param date - The date of the consultant pattern
   * @param is_booked - The status of the consultant pattern
   * @returns The created consultant pattern
   */
  // Create a new consultant pattern
  async createConsultantPattern(
    slot_id: string,
    consultant_id: string,
    date: string,
    is_booked: boolean
  ): Promise<ConsultantPattern> {
    // Validate working slot

    const [workingSlot, consultant] = await Promise.all([
      workingSlotRepository.findOne({ where: { slot_id } }),
      accountRepository.findOne({ where: { account_id: consultant_id } })
    ])
    // working slot ?
    if (!workingSlot || workingSlot.type !== TypeAppointment.CONSULT) {
      throw new ErrorWithStatus({
        message: CONSULTANT_PATTERNS_MESSAGES.WORKING_SLOT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    // consultant ?
    if (!consultant || consultant.role !== Role.CONSULTANT) {
      throw new ErrorWithStatus({
        message: CONSULTANT_PATTERNS_MESSAGES.CONSULTANT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Check for duplicate pattern (same slot, consultant, and date)
    const existingPattern = await consultantPatternRepository.findOne({
      where: {
        working_slot: { slot_id: workingSlot.slot_id },
        account_id: consultant.account_id,
        date: new Date(date)
      }
    })
    if (existingPattern) {
      throw new ErrorWithStatus({
        message: CONSULTANT_PATTERNS_MESSAGES.CONSULTANT_PATTERN_ALREADY_EXISTS,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const consultantPattern = consultantPatternRepository.create({
      working_slot: workingSlot,
      account_id: consultant.account_id,
      date: date
    })

    return await consultantPatternRepository.save(consultantPattern)
  }

  /**
   * @description Get all consultant patterns
   * @param filter - The filter for the consultant patterns
   * @param pageVar - The page and limit for the consultant patterns
   * @returns The consultant patterns
   */
  // Get all consultant patterns
  async getAllConsultantPatterns(limit: string, page: string): Promise<ConsultantPattern[]> {
    const limitNumber = Number(limit) || LIMIT.default
    const pageNumber = Number(page) || 1
    const skip = (pageNumber - 1) * limitNumber
    return await consultantPatternRepository.find({
      skip,
      take: limitNumber,
      relations: ['working_slot']
    })
  }

  async getAllConsultantPatternsInWeek(consultant_id: string): Promise<ConsultantPattern[]> {
    const consultantPatterns = await consultantPatternRepository
      .createQueryBuilder('consultant_pattern')
      .where('date_trunc(\'week\', "consultant_pattern"."date") = date_trunc(\'week\', NOW())')
      .andWhere('consultant_pattern.account_id = :consultant_id', { consultant_id })
      .orderBy('"consultant_pattern"."date"', 'DESC')
      .getMany()
    const list: any[] = []
    for (const consultantPattern of consultantPatterns) {
      const conPattern = await consultantPatternRepository.findOne({
        where: {
          pattern_id: consultantPattern.pattern_id
        },
        relations: ['working_slot']
      })
      if (!conPattern) {
        continue
      }
      list.push({
        date: conPattern.date,
        slot_id: conPattern.working_slot.slot_id,
        start_at: conPattern.working_slot.start_at,
        end_at: conPattern.working_slot.end_at,
        is_booked: conPattern.is_booked,
        pattern_id: conPattern.pattern_id
      })
    }
    return list
  }

  /**
   * @description Get a consultant pattern by ID
   * @param pattern_id - The ID of the consultant pattern
   * @returns The consultant pattern
   */
  // Get a consultant pattern by ID
  async getConsultantPatternById(pattern_id: string): Promise<ConsultantPattern> {
    const consultantPattern = await consultantPatternRepository.findOne({
      where: { pattern_id },
      relations: ['working_slot']
    })

    if (!consultantPattern) {
      throw new ErrorWithStatus({
        message: CONSULTANT_PATTERNS_MESSAGES.CONSULTANT_PATTERN_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return consultantPattern
  }

  /**
   * @description Get a consultant pattern by Consultant ID
   * @param consultant_id - The ID of the consultant
   * @param filter - The filter for the consultant patterns
   * @param pageVar - The page and limit for the consultant patterns
   * @returns The consultant patterns
   */
  // Get a consultant pattern by Consultant ID
  async getConsultantPatternByConsultantId(
    consultant_id: string
    // limit: string,
    // page: string
  ): Promise<ConsultantPattern[]> {
    const consultant = await accountRepository.findOne({ where: { account_id: consultant_id } })
    if (!consultant) {
      throw new ErrorWithStatus({
        message: CONSULTANT_PATTERNS_MESSAGES.CONSULTANT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // const limitNumber = Number(limit) || LIMIT.default
    // const pageNumber = Number(page) || 1
    // const skip = (pageNumber - 1) * limitNumber

    const consultantPattern = await consultantPatternRepository.find({
      where: { account_id: consultant_id },
      // skip,
      // take: limitNumber,
      relations: ['working_slot']
    })

    if (!consultantPattern) {
      throw new ErrorWithStatus({
        message: CONSULTANT_PATTERNS_MESSAGES.CONSULTANT_PATTERN_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return consultantPattern
  }

  /**
   * @description Get a consultant pattern by Slot ID
   * @param slot_id - The ID of the working slot
   * @param filter - The filter for the consultant patterns
   * @param pageVar - The page and limit for the consultant patterns
   * @returns The consultant patterns
   */
  // Get a consultant pattern by Slot ID
  async getConsultantPatternBySlotId(slot_id: string, limit: string, page: string): Promise<ConsultantPattern[]> {
    const workingSlot = await workingSlotRepository.findOne({ where: { slot_id } })
    if (!workingSlot) {
      throw new ErrorWithStatus({
        message: CONSULTANT_PATTERNS_MESSAGES.WORKING_SLOT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const limitNumber = Number(limit) || LIMIT.default
    const pageNumber = Number(page) || 1
    const skip = (pageNumber - 1) * limitNumber

    const consultantPattern = await consultantPatternRepository.find({
      where: { working_slot: { slot_id: workingSlot.slot_id } },
      skip,
      take: limitNumber,
      relations: ['working_slot']
    })

    if (!consultantPattern) {
      throw new ErrorWithStatus({
        message: CONSULTANT_PATTERNS_MESSAGES.CONSULTANT_PATTERN_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return consultantPattern
  }

  async getConsultPatternByWeek(consultant_id: string, weekStartDate: string): Promise<ConsultantPattern[]> {
      const consultant = await accountRepository.findOne({ where: { account_id: consultant_id } })
      if (!consultant || consultant.role !== Role.CONSULTANT) {
        throw new ErrorWithStatus({
          message: CONSULTANT_PATTERNS_MESSAGES.CONSULTANT_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
  
      // Validate and calculate week date range
      const startDate = new Date(weekStartDate);
      if (isNaN(startDate.getTime())) {
        throw new ErrorWithStatus({
          message: 'Invalid weekStartDate format. Use YYYY-MM-DD.',
          status: HTTP_STATUS.BAD_REQUEST,
        });
      }
      const weekEndDate = new Date(startDate);
      weekEndDate.setDate(startDate.getDate() + 6); // End of the week
  
      const consultantPatterns = await consultantPatternRepository.find({
        where: {
            account_id: consultant_id,
            date: Between(startDate, weekEndDate)
        },
        relations: [
          'working_slot',
        ],
      })
      if (!consultantPatterns.length) {
        throw new ErrorWithStatus({
          message: CONSULTANT_PATTERNS_MESSAGES.CONSULTANT_PATTERN_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
  
      return consultantPatterns
    }

  /**
   * @description Update a consultant pattern
   * @param pattern_id - The ID of the consultant pattern
   * @param slot_id - The ID of the working slot
   * @param consultant_id - The ID of the consultant
   * @param date - The date of the consultant pattern
   * @param is_booked - The status of the consultant pattern
   * @returns The updated consultant pattern
   */
  // Update a consultant pattern
  async updateConsultantPattern(
    pattern_id: string,
    slot_id?: string,
    consultant_id?: string,
    date?: string,
    is_booked?: boolean
  ): Promise<UpdateResult> {
    const consultantPattern = await this.getConsultantPatternById(pattern_id)
    let workingSlot
    let consultant
    // Validate working slot if provided
    if (slot_id && slot_id !== consultantPattern.working_slot.slot_id) {
      workingSlot = await workingSlotRepository.findOne({ where: { slot_id } })
      if (!workingSlot) {
        throw new ErrorWithStatus({
          message: CONSULTANT_PATTERNS_MESSAGES.WORKING_SLOT_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
    }

    // Validate consultant if provided
    if (consultant_id && consultant_id !== consultantPattern.account_id) {
      consultant = await accountRepository.findOne({ where: { account_id: consultant_id } })
      if (!consultant || consultant.role !== Role.CONSULTANT) {
        throw new ErrorWithStatus({
          message: CONSULTANT_PATTERNS_MESSAGES.CONSULTANT_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
    }

    // Check for duplicate pattern if key fields are updated
    const updatedPattern = await consultantPatternRepository.update(
      {
        pattern_id: pattern_id
      },
      {
        working_slot: workingSlot ? workingSlot : consultantPattern.working_slot,
        account_id: consultant ? consultant.account_id : consultantPattern.account_id,
        date: date ? new Date(date) : consultantPattern.date,
        is_booked: is_booked !== undefined ? is_booked : consultantPattern.is_booked
      }
    )

    return updatedPattern
  }

  /**
   * @description Delete a consultant pattern
   * @param pattern_id - The ID of the consultant pattern
   * @returns The deleted consultant pattern
   */
  // Delete a consultant pattern
  async deleteConsultantPattern(pattern_id: string): Promise<ConsultantPattern> {
    const consultantPattern = await this.getConsultantPatternById(pattern_id)

    // Check if pattern is booked or has associated appointments
    if (consultantPattern.is_booked || consultantPattern.consult_appointment) {
      throw new ErrorWithStatus({
        message: CONSULTANT_PATTERNS_MESSAGES.CONSULTANT_PATTERN_CANNOT_DELETE,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const deletedPattern = await consultantPatternRepository.remove(consultantPattern)
    return deletedPattern
  }
}

const consultantPatternService = new ConsultantPatternService()
export default consultantPatternService
