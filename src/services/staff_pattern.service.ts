import { AppDataSource } from '../config/database.config.js'
import Account from '../models/Entity/account.entity.js'
import StaffPattern from '../models/Entity/staff_pattern.entity.js'
import WorkingSlot from '../models/Entity/working_slot.entity.js'
import { STAFF_PATTERN_MESSAGES } from '../constants/message.js'

const staffPatternRepository = AppDataSource.getRepository(StaffPattern)
const accountRepository = AppDataSource.getRepository(Account)
const workingSlotRepository = AppDataSource.getRepository(WorkingSlot)
class StaffPatternService {
  async addStaffPattern(date: string, account_id: string, working_slot_id: string) {
    // const [account, workingSlot] = await Promise.all([
    //   accountRepository.findOneBy({ account_id: account_id }),
    //   workingSlotRepository.findOneBy({ slot_id: working_slot_id })
    // ])
    const staffPattern = await staffPatternRepository.create({
      account: { account_id: account_id },
      working_slot: { slot_id: working_slot_id },
      date: new Date(date)
    })
    await staffPatternRepository.save(staffPattern)
    return staffPattern
  }

  async getStaffPattern(date: string) {
    const staffPattern = await staffPatternRepository.find({
      where: { date: new Date(date) }
    })
    return staffPattern
  }

  async getAllStaffPattern() {
    const staffPattern = await staffPatternRepository.find({
      where: { is_active: true }
    })
    return staffPattern
  }

  async updateStaffPattern(pattern_id: string, date?: string, account_id?: string, working_slot_id?: string) {
    const staffPattern = await staffPatternRepository.findOneBy({ pattern_id })
    if (!staffPattern) {
      throw new Error(STAFF_PATTERN_MESSAGES.STAFF_PATTERN_NOT_FOUND)
    }
    const [account, workingSlot] = await Promise.all([
      accountRepository.findOneBy({ account_id: account_id || staffPattern.account.account_id }),
      workingSlotRepository.findOneBy({ slot_id: working_slot_id || staffPattern.working_slot.slot_id })
    ])
    staffPattern.date = new Date(date || staffPattern.date)
    staffPattern.account = account as Account
    staffPattern.working_slot = workingSlot as WorkingSlot
    await staffPatternRepository.save(staffPattern)
    return staffPattern
  }

  async deleteStaffPattern(pattern_id: string) {
    const staffPattern = await staffPatternRepository.findOneBy({ pattern_id })
    if (!staffPattern) {
      throw new Error(STAFF_PATTERN_MESSAGES.STAFF_PATTERN_NOT_FOUND)
    }
    staffPattern.is_active = false
    await staffPatternRepository.save(staffPattern)
    return { message: STAFF_PATTERN_MESSAGES.STAFF_PATTERN_DELETED_SUCCESS }
  }
}
const staffPatternService = new StaffPatternService()
export default staffPatternService
