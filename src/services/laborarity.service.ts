import 'reflect-metadata'
import { AppDataSource } from '../config/database.config.js'
import HTTP_STATUS from '../constants/httpStatus.js'
import { LABORARITY_MESSAGES } from '../constants/message.js'
import { ErrorWithStatus } from '../models/Error.js'
import Laboratory, { LaboratoryType } from '../models/Entity/laborarity.entity.js'
import LIMIT from '~/constants/limit.js'

const laboratoryRepository = AppDataSource.getRepository(Laboratory)

export class LaboratoryService {
  // Create a new laboratory
  async createLaboratory(payload: Partial<LaboratoryType>): Promise<Laboratory> {
    const { name, description, price } = payload

    const existingLab = await laboratoryRepository.findOne({ where: { name } })
    if (existingLab) {
      throw new ErrorWithStatus({
        message: LABORARITY_MESSAGES.LABORATORY_NAME_ALREADY_EXISTS,
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
  async getAllLaboratories(pageVar: { limit: number, page: number }): Promise<Laboratory[]> {
    let { limit, page } = pageVar;
    if (!limit || !page) {
      limit = LIMIT.default;
      page = 1;
    }
    const skip = (page - 1) * limit;

    return await laboratoryRepository.find({
      skip,
      take: limit
    })
  }

  // Get a laboratory by ID
  async getLaboratoryById(lab_id: string): Promise<Laboratory> {
    const laboratory = await laboratoryRepository.findOne({
      where: { lab_id }
    })

    if (!laboratory) {
      throw new ErrorWithStatus({
        message: LABORARITY_MESSAGES.LABORATORY_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return laboratory
  }

  // Update a laboratory
  async updateLaboratory(lab_id: string, payload: Partial<LaboratoryType>): Promise<Laboratory> {
    const laboratory = await this.getLaboratoryById(lab_id)
    const { name, description, price } = payload

    if (name && name !== laboratory.name) {
      const existingLab = await laboratoryRepository.findOne({ where: { name } })
      if (existingLab) {
        throw new ErrorWithStatus({
          message: LABORARITY_MESSAGES.LABORATORY_NAME_ALREADY_EXISTS,
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
        message: LABORARITY_MESSAGES.LABORATORY_HAS_APPOINTMENTS,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    await laboratoryRepository.remove(laboratory)
  }
}

const laboratoryService = new LaboratoryService()
export default laboratoryService
