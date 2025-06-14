import { Between } from 'typeorm'
import { AppDataSource } from '../config/database.config.js'
import StaffPattern from '../models/Entity/staff_pattern.entity.js'
import Result from '~/models/Entity/result.entity.js'
import Laborarity from '~/models/Entity/laborarity.entity.js'
import { RESULT_MESSAGES } from '~/constants/message.js'
import LaboratoryAppointment from '~/models/Entity/laborarity_appointment.entity.js'
import { StatusAppointment, stringToStatus } from '~/enum/statusAppointment.enum.js'

const staffPatternRepository = AppDataSource.getRepository(StaffPattern)
const resultRepository = AppDataSource.getRepository(Result)
const laborarityRepository = AppDataSource.getRepository(Laborarity)
const laboratoryAppointmentRepository = AppDataSource.getRepository(LaboratoryAppointment)
class StaffService {
  async countStaff(payload: any) {
    const { date, slot_id } = payload
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

  async updateResult(app_id: string, result: any[]) {
    const resultEntities = []
    for (const item of result) {
      const laborarity = await laborarityRepository.findOne({
        where: {
          name: item.name
        }
      })
      if (!laborarity) {
        return false
      }
      const resultEntity = resultRepository.create({
        name: item.name,
        result: item.result,
        unit: laborarity.unit,
        normal_range: laborarity.normal_range,
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

  async updateAppointmentStatus(appointment_id: string, status: number) {
    const appointment = await laboratoryAppointmentRepository.findOne({
      where: { app_id: appointment_id }
    })
    if (!appointment) {
      return false
    }
    appointment.status = stringToStatus(status) as StatusAppointment
    await laboratoryAppointmentRepository.save(appointment)
    return appointment
  }
}

const staffService = new StaffService()
export default staffService
