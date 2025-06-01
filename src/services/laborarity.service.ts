import 'reflect-metadata'
import { AppDataSource } from '~/config/database.config'
import HTTP_STATUS from '~/constants/httpStatus'
import { LABORATORIES_MESSAGES } from '~/constants/message'
import { ErrorWithStatus } from '~/models/Error'
import Laboratory, { LaborarityType } from '~/models/Entity/laborarity.entity'
import LaboratoryAppointment from '~/models/Entity/laborarity_appointment.entity'

const laboratoryRepository = AppDataSource.getRepository(Laboratory)

export class LaboratoryService {
  // Create a new laboratory
  async createLaboratory(payload: Partial<LaborarityType>): Promise<Laboratory> {
    const { name, description, price } = payload

    const existingLab = await laboratoryRepository.findOne({ where: { name } })
    if (existingLab) {
      throw new ErrorWithStatus({
        message: LABORATORIES_MESSAGES.LABORATORY_NAME_ALREADY_EXISTS,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const laboratory = laboratoryRepository.create({
      name,
      description,
      price
    })

    return await laboratoryRepository.save(laboratory)
  }

  // Get all laboratories
  async getAllLaboratories(): Promise<Laboratory[]> {
    return await laboratoryRepository.find({
    })
  }

  // Get a laboratory by ID
  async getLaboratoryById(lab_id: string): Promise<Laboratory> {
    const laboratory = await laboratoryRepository.findOne({
      where: { lab_id },
    })

    if (!laboratory) {
      throw new ErrorWithStatus({
        message: LABORATORIES_MESSAGES.LABORATORY_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return laboratory
  }

  // Update a laboratory
  async updateLaboratory(lab_id: string, payload: Partial<LaborarityType>): Promise<Laboratory> {
    const laboratory = await this.getLaboratoryById(lab_id)
    const { name, description, price } = payload

    if (name && name !== laboratory.name) {
      const existingLab = await laboratoryRepository.findOne({ where: { name } })
      if (existingLab) {
        throw new ErrorWithStatus({
          message: LABORATORIES_MESSAGES.LABORATORY_NAME_ALREADY_EXISTS,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
    }

    Object.assign(laboratory, {
      name: name || laboratory.name,
      description: description || laboratory.description,
      price: price !== undefined ? price : laboratory.price
    })

    return await laboratoryRepository.save(laboratory)
  }

  // Delete a laboratory
  async deleteLaboratory(lab_id: string): Promise<void> {
    const laboratory = await this.getLaboratoryById(lab_id)

    // Check if laboratory is associated with appointments
    if (laboratory.laboratoryAppointment && laboratory.laboratoryAppointment.length > 0) {
      throw new ErrorWithStatus({
        message: LABORATORIES_MESSAGES.LABORATORY_HAS_APPOINTMENTS,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    await laboratoryRepository.remove(laboratory)
  }
}

const laboratoryService = new LaboratoryService()
export default laboratoryService