import { Between, IsNull } from 'typeorm'
import { AppDataSource } from '../config/database.config.js'
import StaffPattern from '../models/Entity/staff_pattern.entity.js'
import Result from '../models/Entity/result.entity.js'
import Laborarity from '../models/Entity/laborarity.entity.js'
import LaboratoryAppointment from '../models/Entity/laborarity_appointment.entity.js'
import { StatusAppointment, stringToStatus } from '../enum/statusAppointment.enum.js'
import HTTP_STATUS from '~/constants/httpStatus.js'
import { ErrorWithStatus } from '~/models/Error.js'
import { STAFF_MESSAGES } from '~/constants/message.js'
import Account from '~/models/Entity/account.entity.js'

const staffPatternRepository = AppDataSource.getRepository(StaffPattern)
const resultRepository = AppDataSource.getRepository(Result)
const laborarityRepository = AppDataSource.getRepository(Laborarity)
const laboratoryAppointmentRepository = AppDataSource.getRepository(LaboratoryAppointment)
const accountRepository = AppDataSource.getRepository(Account)
class StaffService {
  /**
   * Count the number of staff available for a given date and slot
   * @param date - The date of the appointment
   * @param slot_id - The ID of the slot
   * @returns The number of staff available
   */
  // Count the number of staff available for a given date and slot
  async countStaff(date: string, slot_id: string): Promise<number> {
    const appointmentDate = new Date(date)
    const staff = await staffPatternRepository.count({
      where: {
        working_slot: { slot_id: slot_id },
        date: Between(
          new Date(appointmentDate.setHours(0, 0, 0, 0)),
          new Date(appointmentDate.setHours(23, 59, 59, 999))
        )
      }
    })
    return staff * 20
  }

  /**
   * @description Update the result of a laboratory appointment
   * @param app_id - The ID of the laboratory appointment
   * @param result - The result of the laboratory appointment
   * @returns The result entities
   */
  // Update the result of a laboratory appointment
  async updateResult(app_id: string, result: any[]): Promise<Result[]> {
    const resultEntities = []
    for (const item of result) {
      const laborarity = await laborarityRepository.findOne({
        where: {
          name: item.name
        }
      })
      if (!laborarity) {
        return []
      }
      const resultEntity = resultRepository.create({
        name: item.name,
        result: item.result,
        unit: laborarity.unit,
        normal_range: laborarity.normal_range || '',
        conclusion: item.result > laborarity.normal_range ? 'Positive' : 'Negative',
        laboratoryAppointment: {
          app_id: app_id
        }
      })
      resultEntities.push(resultEntity)
    }
    await resultRepository.save(resultEntities)
    return resultEntities
  }

  /**
   * @description Update the status of a laboratory appointment
   * @param appointment_id - The ID of the laboratory appointment
   * @param status - The status of the laboratory appointment
   * @returns The laboratory appointment entity
   */
  // Update the status of a laboratory appointment
  async updateAppointmentStatus(appointment_id: string, status: string, staff_id: string, description: string): Promise<LaboratoryAppointment | boolean> {
    const appointment = await laboratoryAppointmentRepository.findOne({
      where: { app_id: appointment_id }
    })
    if (!appointment) {
      throw new ErrorWithStatus({
        message: STAFF_MESSAGES.APPOINTMENT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    if ((appointment.staff_id && appointment.staff_id !== staff_id)) {
      console.log("so sanh appointment.staff_id vs staff_id", appointment.staff_id, " vs ", staff_id);
      throw new ErrorWithStatus({
        message: STAFF_MESSAGES.APPOINTMENT_OWNED_BY_OTHER,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
    const staff = await accountRepository.findOne({
      where: { account_id: staff_id }
    });
    if (!staff) {
      throw new ErrorWithStatus({
        message: STAFF_MESSAGES.STAFF_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    appointment.status = status as StatusAppointment
    appointment.staff_id = staff_id;
    if (!appointment.description || appointment.description?.trim() !== description.trim()) {
      appointment.description = description.trim();
    }
    await laboratoryAppointmentRepository.save(appointment)
    return appointment
  }

  async getAppointmentOfStaff(staff_id: string): Promise<LaboratoryAppointment[]> {
    const appointments = await laboratoryAppointmentRepository.find({
      where: [
        { staff_id: staff_id }
      ],
      relations: ['working_slot', 'laborarity', 'result', 'customer'],
      order: { date: 'DESC' }
    });
    return appointments;
  }

  async getAppointmentOfStaffByPattern(staff_id: string, date: string, slot_id: string): Promise<LaboratoryAppointment[]> {
    const appointments = await laboratoryAppointmentRepository.find({
      where: [
        {
          staff_id,
          date: new Date(date),
          working_slot: { slot_id }
        },
        {
          staff_id: IsNull(),
          date: new Date(date),
          working_slot: { slot_id }
        },
      ],
      relations: ['working_slot', 'laborarity', 'result', 'customer'],
      order: { date: 'DESC' }
    });
    return appointments;
  }
}

const staffService = new StaffService()
export default staffService
