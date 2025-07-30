import LIMIT from '~/constants/limit.js'
import { AppDataSource } from '../config/database.config.js'
import { TypeAppointment } from '../enum/type_appointment.enum.js'
import WorkingSlot from '../models/Entity/working_slot.entity.js'
import { UpdateResult } from 'typeorm'
import LaboratoryAppointment from '~/models/Entity/laborarity_appointment.entity.js'
import StaffPattern from '~/models/Entity/staff_pattern.entity.js'
import { FindManyOptions } from 'typeorm'

const slotRepository = AppDataSource.getRepository(WorkingSlot)
const staffPatternRepository = AppDataSource.getRepository(StaffPattern)

class WorkingSlotService {
  /**
   * @description Add a slot
   * @param name - The name of the slot
   * @param start_at - The start time of the slot
   * @param end_at - The end time of the slot
   * @param type - The type of the slot
   * @returns The added slot
   */
  // Add a slot
  async addSlot(name: string, start_at: string, end_at: string, type: string): Promise<WorkingSlot> {
    const slot: WorkingSlot = slotRepository.create({
      name: name,
      start_at: start_at,
      end_at: end_at,
      type: type === '1' ? TypeAppointment.CONSULT : TypeAppointment.LABORATORY
    })
    return await slotRepository.save(slot)
  }

  /**
   * @description Get a slot by type
   * @param type - The type of the slot
   * @param pageVar - The page and limit for the slots
   * @returns The slots
   */
  // Get a slot by type
  async getSlotByType(type: string, pageVar: { limit: string; page: string }): Promise<WorkingSlot[]> {
    const limit = parseInt(pageVar.limit) || LIMIT.all
    const page = parseInt(pageVar.page) || 1
    const skip = (page - 1) * limit

    return await slotRepository.find({
      where: {
        type: type === '1' ? TypeAppointment.CONSULT : TypeAppointment.LABORATORY
      },
      skip,
      take: limit
    })
  }

  /**
   * @description Get all slots
   * @param pageVar - The page and limit for the slots
   * @returns The slots
   */
  // Get all slots
  async getSlot(pageVar: { limit: string; page: string }): Promise<WorkingSlot[]> {
    let limit = parseInt(pageVar.limit) || LIMIT.default
    let page = parseInt(pageVar.page) || 1
    const skip = (page - 1) * limit
    return await slotRepository.find({
      skip,
      take: limit
    })
  }

  /**
   * @description Update a slot
   * @param id - The ID of the slot
   * @param name - The name of the slot
   * @param start_at - The start time of the slot
   * @param end_at - The end time of the slot
   * @param type - The type of the slot
   * @returns The updated slot
   */
  // Update a slot
  async updateSlot(id: string, name: string, start_at: string, end_at: string, type: number): Promise<UpdateResult> {
    const slot = await slotRepository.findOne({
      where: {
        slot_id: id
      }
    })
    return await slotRepository.update(id, {
      name: name || slot?.name,
      start_at: start_at || slot?.start_at,
      end_at: end_at || slot?.end_at,
      type: (type === 1 ? TypeAppointment.CONSULT : TypeAppointment.LABORATORY) || slot?.type
    })
  }

  /**
   * @description Delete a slot
   * @param id - The ID of the slot
   * @returns The deleted slot
   */
  // Delete a slot
  async deleteSlot(id: string) {
    return await slotRepository.delete(id)
  }

  async getLabWorkingSlot(date: string) {
    const slots = await slotRepository.find({
      where: {
        type: TypeAppointment.LABORATORY
      },
      order: {
        name: 'ASC'
      }
    })
    const [amountMorning, amountAfternoon] = await Promise.all([
      AppDataSource.createQueryBuilder(LaboratoryAppointment, 'laboratory_appointment')
        .where('laboratory_appointment.date = :date', { date })
        .andWhere('laboratory_appointment.slot_id = :slot_id', { slot_id: slots[0].slot_id })
        .getCount(),
      AppDataSource.createQueryBuilder(LaboratoryAppointment, 'laboratory_appointment')
        .where('laboratory_appointment.date = :date', { date })
        .andWhere('laboratory_appointment.slot_id = :slot_id', { slot_id: slots[1].slot_id })
        .getCount()
    ])
    const morning = await staffPatternRepository.findAndCount({
      where: {
        date: new Date(date),
        working_slot: { slot_id: slots[0].slot_id }
      },
      relations: {
        working_slot: true
      }
    })
    const afternoon = await staffPatternRepository.findAndCount({
      where: {
        date: new Date(date),
        working_slot: { slot_id: slots[1].slot_id }
      },
      relations: {
        working_slot: true
      }
    })
    return {
      morning: {
        isFull: amountMorning >= morning[1] * 10,
        slot: slots[0]
      },
      afternoon: {
        isFull: amountAfternoon >= afternoon[1] * 10,
        slot: slots[1]
      }
    }
  }
}

const workingSlotService = new WorkingSlotService()
export default workingSlotService
