import LIMIT from '~/constants/limit.js'
import { AppDataSource } from '../config/database.config.js'
import { TypeAppointment } from '../enum/type_appointment.enum.js'
import WorkingSlot from '../models/Entity/working_slot.entity.js'

const slotRepository = AppDataSource.getRepository(WorkingSlot)

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
  async addSlot(name: string, start_at: string, end_at: string, type: string) {
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
  async getSlotByType(type: string, pageVar: { limit: number, page: number }) {
    let { limit, page } = pageVar
    if (!limit || !page) {
      limit = LIMIT.default;
      page = 1;
    }
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
  async getSlot(pageVar: { limit: number, page: number }) {
    let { limit, page } = pageVar
    if (!limit || !page) {
      limit = LIMIT.default;
      page = 1;
    }
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
  async updateSlot(id: string, name: string, start_at: string, end_at: string, type: number) {
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
}

const workingSlotService = new WorkingSlotService()
export default workingSlotService
