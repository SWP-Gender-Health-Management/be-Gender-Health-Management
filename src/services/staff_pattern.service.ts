import { AppDataSource } from '../config/database.config.js'
import Account from '../models/Entity/account.entity.js'
import StaffPattern from '../models/Entity/staff_pattern.entity.js'
import WorkingSlot from '../models/Entity/working_slot.entity.js'
import { STAFF_PATTERN_MESSAGES } from '../constants/message.js'

const staffPatternRepository = AppDataSource.getRepository(StaffPattern)
const accountRepository = AppDataSource.getRepository(Account)
const workingSlotRepository = AppDataSource.getRepository(WorkingSlot)
class StaffPatternService {
  /**
   * Add a staff pattern
   * @param date - The date of the appointment
   * @param account_id - The ID of the account
   * @param working_slot_id - The ID of the working slot
   * @returns The staff pattern
   */
  // Add a staff pattern
  async addStaffPattern(date: string, account_id: string, working_slot_id: string): Promise<StaffPattern> {
    // const [account, workingSlot] = await Promise.all([
    //   accountRepository.findOneBy({ account_id: account_id }),
    //   workingSlotRepository.findOneBy({ slot_id: working_slot_id })
    // ])
    const staffPattern = await staffPatternRepository.create({
      account_id: account_id,
      working_slot: { slot_id: working_slot_id },
      date: new Date(date)
    })
    await staffPatternRepository.save(staffPattern)
    return staffPattern
  }

  /**
   * Get a staff pattern by date
   * @param date - The date of the appointment
   * @returns The staff pattern
   */
  // Get a staff pattern by date
  // get staff pattern by date
  async getStaffPattern(date: string): Promise<StaffPattern[]> {
    const staffPattern = await staffPatternRepository.find({
      where: { date: new Date(date) }
    })
    return staffPattern
  }

  /**
   * Get all staff patterns
   * @returns The staff patterns
   */
  // Get all staff patterns
  
  async getAllStaffPatternOfStaff(staff_id: string): Promise<StaffPattern[]> {
    const staffPattern = await staffPatternRepository.find({
      where: { account_id: staff_id, is_active: true}
    })
    return staffPattern
  }
  
  async getAllStaffPatternInWeek(): Promise<StaffPattern[]> {
    const staffPattern = await staffPatternRepository.find({
      where: { is_active: true }
    })
    return staffPattern
  }
  async getAllStaffPatternInMonth(): Promise<StaffPattern[]> {
    const staffPatterns = await staffPatternRepository
      .createQueryBuilder('staff_pattern')
      // "pattern" là một alias cho entity Pattern
      .where('date_trunc(\'week\', "staff_pattern"."date") = date_trunc(\'week\', NOW())')
      // So sánh tuần của cột 'createdAt' với tuần của ngày hiện tại (NOW())
      .orderBy('"staff_pattern"."date"', 'DESC')
      .getMany() // Lấy tất cả các bản ghi khớp
    return staffPatterns
  }

  /**
   * Update a staff pattern
   * @param pattern_id - The ID of the staff pattern
   * @param date - The date of the appointment
   * @param account_id - The ID of the account
   * @param working_slot_id - The ID of the working slot
   * @returns The staff pattern
   */
  // Update a staff pattern
  async updateStaffPattern(
    pattern_id: string,
    date?: string,
    account_id?: string,
    working_slot_id?: string
  ): Promise<StaffPattern> {
    const staffPattern = await staffPatternRepository.findOneBy({ pattern_id })
    if (!staffPattern) {
      throw new Error(STAFF_PATTERN_MESSAGES.STAFF_PATTERN_NOT_FOUND)
    }
    const [account, workingSlot] = await Promise.all([
      accountRepository.findOneBy({ account_id: account_id || staffPattern.account_id }),
      workingSlotRepository.findOneBy({ slot_id: working_slot_id || staffPattern.working_slot.slot_id })
    ])
    staffPattern.date = new Date(date || staffPattern.date)
    staffPattern.account_id = account_id || staffPattern.account_id
    staffPattern.working_slot = workingSlot as WorkingSlot
    await staffPatternRepository.save(staffPattern)
    return staffPattern
  }

  /**
   * Delete a staff pattern
   * @param pattern_id - The ID of the staff pattern
   * @returns The staff pattern
   */
  // Delete a staff pattern
  async deleteStaffPattern(pattern_id: string): Promise<{ message: string }> {
    const staffPattern = await staffPatternRepository.findOneBy({ pattern_id })
    if (!staffPattern) {
      throw new Error(STAFF_PATTERN_MESSAGES.STAFF_PATTERN_NOT_FOUND)
    }
    staffPattern.is_active = false
    await staffPatternRepository.save(staffPattern)
    return { message: STAFF_PATTERN_MESSAGES.STAFF_PATTERN_DELETED_SUCCESS }
  }

  async getStaffPatternByDate(staff_id: string, date: string): Promise<StaffPattern[]> {
    const patterns = await staffPatternRepository.find({
      where: {
        date: new Date(date),
        account_id: staff_id
      },
      relations: ['working_slot']
    });
    return patterns;
  }
}
const staffPatternService = new StaffPatternService()
export default staffPatternService
