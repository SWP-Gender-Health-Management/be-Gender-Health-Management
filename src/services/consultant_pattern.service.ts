import { Repository } from 'typeorm'
import { AppDataSource } from '~/config/database.config'
import HTTP_STATUS from '~/constants/httpStatus'
import { CONSULTANT_PATTERNS_MESSAGES } from '~/constants/message'
import { ErrorWithStatus } from '~/models/Error'
import ConsultantPattern, { ConsultantPatternType } from '~/models/Entity/consultant_pattern.entity'
import WorkingSlot from '~/models/Entity/working_slot.entity'
import Account from '~/models/Entity/account.entity'
import { Role } from '~/enum/role.enum'

const consultantPatternRepository = AppDataSource.getRepository(ConsultantPattern)
const workingSlotRepository = AppDataSource.getRepository(WorkingSlot)
const accountRepository = AppDataSource.getRepository(Account)

export class ConsultantPatternService {
  // Create a new consultant pattern
  async createConsultantPattern(data: any): Promise<ConsultantPattern> {
    // Validate working slot

    const workingSlot = await workingSlotRepository.findOne({ where: { slot_id: data.slot_id } });
    if (!workingSlot) {
      throw new ErrorWithStatus({
        message: CONSULTANT_PATTERNS_MESSAGES.WORKING_SLOT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Validate consultant (account)
    const consultant = await accountRepository.findOne({ where: { account_id: data.consultant_id } })
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
        date: data.date
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
      date: data.date,
      is_booked: data.is_booked ?? false
    })

    return await consultantPatternRepository.save(consultantPattern)
  }

  // Get all consultant patterns
  async getAllConsultantPatterns(filter: any, pageVar: any): Promise<ConsultantPattern[]> {
    let { limit, page } = pageVar;
    if (!limit || !page) {
      limit = 0;
      page = 1;
    }
    const skip = (page - 1) * limit;
    return await consultantPatternRepository.find({
      where: { ...filter },
      skip,
      take: limit,
      relations: ['working_slot', 'consultant']
    })
  }

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

  // Get a consultant pattern by Consultant ID
  async getConsultantPatternByConsultantId(consultant_id: string, filter: any, pageVar: any): Promise<ConsultantPattern[]> {
    
    const consultant = await accountRepository.findOne({ where: { account_id: consultant_id } });
    if (!consultant) {
      throw new ErrorWithStatus({
        message: CONSULTANT_PATTERNS_MESSAGES.CONSULTANT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    let {limit, page} = pageVar;
    if(!limit || !page) {
      limit = 0;
      page = 1;
    }
    const skip = (page - 1) * limit;

    const consultantPattern = await consultantPatternRepository.find({
      where: { consultant: consultant, ...filter },
      skip,
      take: limit,
      relations: ['working_slot', 'consultant']
    });

    if (!consultantPattern) {
      throw new ErrorWithStatus({
        message: CONSULTANT_PATTERNS_MESSAGES.CONSULTANT_PATTERN_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return consultantPattern;
  }

  // Get a consultant pattern by Slot ID
  async getConsultantPatternBySlotId(slot_id: string, filter: any, pageVar:any): Promise<ConsultantPattern[]> {
    const workingSlot = await workingSlotRepository.findOne({ where: { slot_id } });
    if (!workingSlot) {
      throw new ErrorWithStatus({
        message: CONSULTANT_PATTERNS_MESSAGES.WORKING_SLOT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    let {limit, page} = pageVar;
    if(!limit || !page) {
      limit = 0;
      page = 1;
    }
    const skip = (page - 1) * limit;

    const consultantPattern = await consultantPatternRepository.find({
      where: { working_slot: workingSlot, ...filter },
      skip,
      take: limit,
      relations: ['working_slot', 'consultant']
    });

    if (!consultantPattern) {
      throw new ErrorWithStatus({
        message: CONSULTANT_PATTERNS_MESSAGES.CONSULTANT_PATTERN_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return consultantPattern;
  }

  // Update a consultant pattern
  async updateConsultantPattern(pattern_id: string, data: any): Promise<ConsultantPattern> {
    const consultantPattern = await this.getConsultantPatternById(pattern_id);
    let workingSlot;
    let consultant;
    // Validate working slot if provided
    if (data.slot_id && (!consultantPattern.working_slot || data.slot_id !== consultantPattern.working_slot.slot_id)) {
      workingSlot = await workingSlotRepository.findOne({ where: { slot_id: data.slot_id } })
      if (!workingSlot) {
        throw new ErrorWithStatus({
          message: CONSULTANT_PATTERNS_MESSAGES.WORKING_SLOT_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
    }

    // Validate consultant if provided
    if (data.consultant_id && (!consultantPattern.consultant || data.consultant_id !== consultantPattern.consultant.account_id)) {
      consultant = await accountRepository.findOne({ where: { account_id: data.consultant_id } })
      if (!consultant || consultant.role !== Role.CONSULTANT) {
        throw new ErrorWithStatus({
          message: CONSULTANT_PATTERNS_MESSAGES.CONSULTANT_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
    }

    // Check for duplicate pattern if key fields are updated
    if (data.slot_id || data.consultant_id || data.date) {
      const existingPattern = await consultantPatternRepository.findOne({
        where: {
          working_slot: workingSlot || consultantPattern.working_slot,
          consultant: consultant || consultantPattern.consultant,
          date: data.date || consultantPattern.date
        }
      })
      if (existingPattern && existingPattern.pattern_id !== pattern_id) {
        throw new ErrorWithStatus({
          message: CONSULTANT_PATTERNS_MESSAGES.CONSULTANT_PATTERN_ALREADY_EXISTS,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
    }
    console.log(consultant);
    await Object.assign(consultantPattern, {
      working_slot: workingSlot || consultantPattern.working_slot,
      consultant: consultant || consultantPattern.consultant,
      date: data.date || consultantPattern.date,
      is_booked: data.is_booked !== undefined ? data.is_booked : consultantPattern.is_booked
    })

    return await consultantPatternRepository.save(consultantPattern)
  }

  // Delete a consultant pattern
  async deleteConsultantPattern(pattern_id: string): Promise<void> {
    const consultantPattern = await this.getConsultantPatternById(pattern_id)

    // Check if pattern is booked or has associated appointments
    if (consultantPattern.is_booked || (consultantPattern.consult_appointment)) {
      throw new ErrorWithStatus({
        message: CONSULTANT_PATTERNS_MESSAGES.CONSULTANT_PATTERN_CANNOT_DELETE,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    await consultantPatternRepository.remove(consultantPattern)
  }
}

const consultantPatternService = new ConsultantPatternService();
export default consultantPatternService;