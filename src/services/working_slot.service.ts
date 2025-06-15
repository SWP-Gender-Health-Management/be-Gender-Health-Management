import { AppDataSource } from '../config/database.config.js'
import { TypeAppointment } from '../enum/type_appointment.enum.js'
import WorkingSlot from '../models/Entity/working_slot.entity.js'

const slotRepository = AppDataSource.getRepository(WorkingSlot)

class WorkingSlotService {
  async addSlot(name: string, start_at: string, end_at: string, type: string) {
    const slot: WorkingSlot = slotRepository.create({
      name: name,
      start_at: start_at,
      end_at: end_at,
      type: type === '1' ? TypeAppointment.CONSULT : TypeAppointment.LABORATORY
    })
    return await slotRepository.save(slot)
  }

  async getSlotByType(type: string) {
    return await slotRepository.find({
      where: {
        type: type === '1' ? TypeAppointment.CONSULT : TypeAppointment.LABORATORY
      }
    })
  }

  async getSlot() {
    return await slotRepository.find()
  }

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

  async deleteSlot(id: string) {
    return await slotRepository.delete(id)
  }
}

const workingSlotService = new WorkingSlotService()
export default workingSlotService
