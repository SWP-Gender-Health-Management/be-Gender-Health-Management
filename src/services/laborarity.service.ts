import 'reflect-metadata'
import { AppDataSource } from '../config/database.config.js'
import HTTP_STATUS from '../constants/httpStatus.js'
import { LABORARITY_MESSAGES } from '../constants/message.js'
import { ErrorWithStatus } from '../models/Error.js'
import Laboratory from '../models/Entity/laborarity.entity.js'
import { DeleteResult } from 'typeorm'
import LIMIT from '~/constants/limit.js'

const laboratoryRepository = AppDataSource.getRepository(Laboratory)

export class LaboratoryService {
  /**
   * @description Create a new laboratory
   * @param name - The name of the laboratory
   * @param specimen - The specimen of the laboratory
   * @param description - The description of the laboratory
   * @param price - The price of the laboratory
   * @returns The created laboratory
   */
  // Create a new laboratory
  async createLaboratory(name: string, specimen: string, description: string, price: number): Promise<Laboratory> {
    const existingLab = await laboratoryRepository.findOne({ where: { name } })
    if (existingLab) {
      throw new ErrorWithStatus({
        message: LABORARITY_MESSAGES.LABORATORY_NAME_ALREADY_EXISTS,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const laboratory = laboratoryRepository.create({
      name,
      specimen,
      description,
      price
    })

    return await laboratoryRepository.save(laboratory)
  }

  /**
   * @description Get all laboratories
   * @param filter - The filter for the laboratories
   * @param pageVar - The page and limit for the laboratories
   * @returns The laboratories
   */
  // Get all laboratories
  async getAllLaboratories(pageVar: { limit: number, page: number }): Promise<Laboratory[]> {
    let { limit, page } = pageVar;
    if (!limit || !page) {
      limit = LIMIT.default;
      page = 1;
    }
    const skip = (page - 1) * limit

    return await laboratoryRepository.find({
      skip,
      take: limit
    })
  }

  /**
   * @description Get a laboratory by ID
   * @param lab_id - The ID of the laboratory
   * @returns The laboratory
   */
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

  /**
   * @description Update a laboratory
   * @param lab_id - The ID of the laboratory
   * @param name - The name of the laboratory
   * @param specimen - The specimen of the laboratory
   * @param description - The description of the laboratory
   * @param price - The price of the laboratory
   * @returns The updated laboratory
   */
  // Update a laboratory
  async updateLaboratory(
    lab_id: string,
    name?: string,
    specimen?: string,
    description?: string,
    price?: number
  ): Promise<Laboratory> {
    const laboratory = await this.getLaboratoryById(lab_id)
    laboratory.name = name || laboratory.name
    laboratory.specimen = specimen || laboratory.specimen
    laboratory.description = description || laboratory.description
    laboratory.price = price || laboratory.price

    return await laboratoryRepository.save(laboratory)
  }

  /**
   * @description Delete a laboratory
   * @param lab_id - The ID of the laboratory
   * @returns The deleted laboratory
   */
  // Delete a laboratory
  async deleteLaboratory(lab_id: string): Promise<DeleteResult> {
    const laboratory = await this.getLaboratoryById(lab_id)

    // Check if laboratory is associated with appointments
    if (laboratory.laboratoryAppointment && laboratory.laboratoryAppointment.length > 0) {
      throw new ErrorWithStatus({
        message: LABORARITY_MESSAGES.LABORATORY_HAS_APPOINTMENTS,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    return await laboratoryRepository.delete(lab_id)
  }
}

const laboratoryService = new LaboratoryService()
export default laboratoryService
