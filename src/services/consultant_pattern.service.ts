import { Repository } from 'typeorm'
import { AppDataSource } from '../config/database.config.js'
import HTTP_STATUS from '../constants/httpStatus.js'
import { CONSULTANT_PATTERNS_MESSAGES } from '../constants/message.js'
import { ErrorWithStatus } from '../models/Error.js'
import ConsultantPattern, { ConsultantPatternType } from '../models/Entity/consultant_pattern.entity.js'
import WorkingSlot from '../models/Entity/working_slot.entity.js'
import Account from '../models/Entity/account.entity.js'
import { Role } from '../enum/role.enum.js'

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

    const workingSlot = await workingSlotRepository.findOne({ where: { slot_id } })
    if (!workingSlot) {
      throw new ErrorWithStatus({
        message: CONSULTANT_PATTERNS_MESSAGES.WORKING_SLOT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Validate consultant (account)
    const consultant = await accountRepository.findOne({ where: { account_id: consultant_id } })
    if (!consultant || consultant.role !== Role.CONSULTANT) {
      throw new ErrorWithStatus({
        message: CONSULTANT_PATTERNS_MESSAGES.CONSULTANT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Check for duplicate pattern (same slot, consultant, and date)
    const existingPattern = await consultantPatternRepository.findOne({
      where: {
        working_slot: workingSlot,
        consultant: consultant,
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
      consultant: consultant,
      date: date,
      is_booked: is_booked ?? false
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
  async getAllConsultantPatterns(filter: any, pageVar: any): Promise<ConsultantPattern[]> {
    let { limit, page } = pageVar
    if (!limit || !page) {
      limit = 0
      page = 1
    }
    const skip = (page - 1) * limit
    return await consultantPatternRepository.find({
      where: { ...filter },
      skip,
      take: limit,
      relations: ['working_slot', 'consultant']
    })
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
      relations: ['working_slot', 'consultant']
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
    consultant_id: string,
    filter: any,
    pageVar: any
  ): Promise<ConsultantPattern[]> {
    const consultant = await accountRepository.findOne({ where: { account_id: consultant_id } })
    if (!consultant) {
      throw new ErrorWithStatus({
        message: CONSULTANT_PATTERNS_MESSAGES.CONSULTANT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    let { limit, page } = pageVar
    if (!limit || !page) {
      limit = 0
      page = 1
    }
    const skip = (page - 1) * limit

    const consultantPattern = await consultantPatternRepository.find({
      where: { consultant: consultant, ...filter },
      skip,
      take: limit,
      relations: ['working_slot', 'consultant']
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
  async getConsultantPatternBySlotId(slot_id: string, filter: any, pageVar: any): Promise<ConsultantPattern[]> {
    const workingSlot = await workingSlotRepository.findOne({ where: { slot_id } })
    if (!workingSlot) {
      throw new ErrorWithStatus({
        message: CONSULTANT_PATTERNS_MESSAGES.WORKING_SLOT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    let { limit, page } = pageVar
    if (!limit || !page) {
      limit = 0
      page = 1
    }
    const skip = (page - 1) * limit

    const consultantPattern = await consultantPatternRepository.find({
      where: { working_slot: workingSlot, ...filter },
      skip,
      take: limit,
      relations: ['working_slot', 'consultant']
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
    slot_id: string,
    consultant_id: string,
    date: string,
    is_booked: boolean
  ): Promise<ConsultantPattern> {
    const consultantPattern = await this.getConsultantPatternById(pattern_id)
    let workingSlot
    let consultant
    // Validate working slot if provided
    if (slot_id && (!consultantPattern.working_slot || slot_id !== consultantPattern.working_slot.slot_id)) {
      workingSlot = await workingSlotRepository.findOne({ where: { slot_id } })
      if (!workingSlot) {
        throw new ErrorWithStatus({
          message: CONSULTANT_PATTERNS_MESSAGES.WORKING_SLOT_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
    }

    // Validate consultant if provided
    if (consultant_id && (!consultantPattern.consultant || consultant_id !== consultantPattern.consultant.account_id)) {
      consultant = await accountRepository.findOne({ where: { account_id: consultant_id } })
      if (!consultant || consultant.role !== Role.CONSULTANT) {
        throw new ErrorWithStatus({
          message: CONSULTANT_PATTERNS_MESSAGES.CONSULTANT_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
    }

    // Check for duplicate pattern if key fields are updated
    if (slot_id || consultant_id || date) {
      const existingPattern = await consultantPatternRepository.findOne({
        where: {
          working_slot: workingSlot || consultantPattern.working_slot,
          consultant: consultant || consultantPattern.consultant,
          date: new Date(date) || consultantPattern.date
        }
      })
      if (existingPattern && existingPattern.pattern_id !== pattern_id) {
        throw new ErrorWithStatus({
          message: CONSULTANT_PATTERNS_MESSAGES.CONSULTANT_PATTERN_ALREADY_EXISTS,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
    }
    console.log(consultant)
    await Object.assign(consultantPattern, {
      working_slot: workingSlot || consultantPattern.working_slot,
      consultant: consultant || consultantPattern.consultant,
      date: new Date(date) || consultantPattern.date,
      is_booked: is_booked !== undefined ? is_booked : consultantPattern.is_booked
    })

    return await consultantPatternRepository.save(consultantPattern)
  }

  /**
   * @description Delete a consultant pattern
   * @param pattern_id - The ID of the consultant pattern
   * @returns The deleted consultant pattern
   */
  // Delete a consultant pattern
  async deleteConsultantPattern(pattern_id: string): Promise<void> {
    const consultantPattern = await this.getConsultantPatternById(pattern_id)

    // Check if pattern is booked or has associated appointments
    if (consultantPattern.is_booked || consultantPattern.consult_appointment) {
      throw new ErrorWithStatus({
        message: CONSULTANT_PATTERNS_MESSAGES.CONSULTANT_PATTERN_CANNOT_DELETE,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    await consultantPatternRepository.remove(consultantPattern)
  }
}

const consultantPatternService = new ConsultantPatternService()
export default consultantPatternService
