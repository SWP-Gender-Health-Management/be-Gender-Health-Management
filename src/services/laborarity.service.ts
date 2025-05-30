import 'reflect-metadata'
import { Repository } from 'typeorm'
import { AppDataSource } from '~/config/database.config'
import HTTP_STATUS from '~/constants/httpStatus'
import { LABORATORIES_MESSAGES } from '~/constants/message'
import { ErrorWithStatus } from '~/models/Error'
import Laboratory from '~/models/Entity/laborarity.entity'
import LaboratoryAppointment from '~/models/Entity/laborarity_appointment.entity'

export class LaboratoryService {
    private laboratoryRepository: Repository<Laboratory>

    constructor() {
        this.laboratoryRepository = AppDataSource.getRepository(Laboratory)
    }

    // Create a new laboratory
    async createLaboratory(data: {
        name: string
        description: string
        price: number
    }): Promise<Laboratory> {
        const existingLab = await this.laboratoryRepository.findOne({ where: { name: data.name } })
        if (existingLab) {
            throw new ErrorWithStatus({
                message: LABORATORIES_MESSAGES.LABORATORY_NAME_ALREADY_EXISTS,
                status: HTTP_STATUS.BAD_REQUEST
            })
        }

        const laboratory = this.laboratoryRepository.create({
            name: data.name,
            description: data.description,
            price: data.price
        })

        return await this.laboratoryRepository.save(laboratory)
    }

    // Get all laboratories
    async getAllLaboratories(): Promise<Laboratory[]> {
        return await this.laboratoryRepository.find()
    }

    // Get a laboratory by ID
    async getLaboratoryById(lab_id: string): Promise<Laboratory> {
        const laboratory = await this.laboratoryRepository.findOne({
            where: { lab_id }
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
    async updateLaboratory(lab_id: string, data: {
        name?: string
        description?: string
        price?: number
    }): Promise<Laboratory> {
        const laboratory = await this.getLaboratoryById(lab_id)

        if (data.name && data.name !== laboratory.name) {
            const existingLab = await this.laboratoryRepository.findOne({ where: { name: data.name } })
            if (existingLab) {
                throw new ErrorWithStatus({
                    message: LABORATORIES_MESSAGES.LABORATORY_NAME_ALREADY_EXISTS,
                    status: HTTP_STATUS.BAD_REQUEST
                })
            }
        }

        Object.assign(laboratory, {
            name: data.name || laboratory.name,
            description: data.description || laboratory.description,
            price: data.price !== undefined ? data.price : laboratory.price
        })

        return await this.laboratoryRepository.save(laboratory)
    }

    // Delete a laboratory
    async deleteLaboratory(lab_id: string): Promise<void> {
        const laboratory = await this.getLaboratoryById(lab_id)

        // Check if laboratory is associated with any appointments
        if (laboratory.laboratoryAppointment && laboratory.laboratoryAppointment.length > 0) {
            throw new ErrorWithStatus({
                message: LABORATORIES_MESSAGES.LABORATORY_HAS_APPOINTMENTS,
                status: HTTP_STATUS.BAD_REQUEST
            })
        }

        await this.laboratoryRepository.remove(laboratory)
    }
}

const laboratoryService = new LaboratoryService();
export default laboratoryService;