import { AppDataSource } from '../config/database.config.js'
import MenstrualCycle from '../models/Entity/menstrual_cycle.entity.js'
import { CUSTOMER_MESSAGES, LABORARITY_MESSAGES, USERS_MESSAGES } from '../constants/message.js'
import { ErrorWithStatus } from '../models/Error.js'
import Account from '../models/Entity/account.entity.js'
import { scheduleNotification } from './notificationScheduler.service.js'
import { v4 as uuidv4 } from 'uuid'
import redisClient from '../config/redis.config.js'
import { NotificationPayload } from '../worker/notificationWorker.js'
import LaboratoryAppointment from '../models/Entity/laborarity_appointment.entity.js'
import WorkingSlot from '../models/Entity/working_slot.entity.js'
import Laboratory from '../models/Entity/laborarity.entity.js'
import Result from '../models/Entity/result.entity.js'
import Feedback from '../models/Entity/feedback.entity.js'
import StaffPattern from '../models/Entity/staff_pattern.entity.js'
import staffService from './staff.service.js'
import { Role } from '../enum/role.enum.js'
import laborarityService from './laborarity.service.js'
import Transaction from '~/models/Entity/transaction.entity.js'
const menstrualCycleRepository = AppDataSource.getRepository(MenstrualCycle)
const userRepository = AppDataSource.getRepository(Account)
const appointmentRepository = AppDataSource.getRepository(LaboratoryAppointment)
const labRepository = AppDataSource.getRepository(Laboratory)
const transactionRepository = AppDataSource.getRepository(Transaction)
const resultRepository = AppDataSource.getRepository(Result)
const feedbackRepository = AppDataSource.getRepository(Feedback)
const staffPatternRepository = AppDataSource.getRepository(StaffPattern)
class CustomerService {
  async getCustomer() {
    return await userRepository.find({
      where: {
        role: Role.CUSTOMER
      }
    })
  }

  async createMenstrualCycle(payload: any) {
    const user = JSON.parse((await redisClient.get(payload.account_id)) as string)
    const menstrual = await menstrualCycleRepository.findOne({
      where: { account: user }
    })
    if (menstrual) {
      throw new ErrorWithStatus({
        message: CUSTOMER_MESSAGES.MENSTRUAL_CYCLE_ALREADY_EXISTS,
        status: 400
      })
    }
    if (user?.gender !== 'female') {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.YOU_ARE_NOT_FEMALE,
        status: 400
      })
    }
    const { start_date, end_date, period, note } = payload
    const menstrualCycle = menstrualCycleRepository.create({
      account: user,
      start_date,
      end_date,
      period: period || 30,
      note: note || ''
    })
    return menstrualCycleRepository.save(menstrualCycle)
  }

  async predictPeriod(payload: any) {
    const { account_id } = payload
    const menstrualCycle: MenstrualCycle | null = await menstrualCycleRepository.findOne({
      where: { account: { account_id } }
    })
    if (!menstrualCycle) {
      throw new ErrorWithStatus({
        message: CUSTOMER_MESSAGES.MENSTRUAL_CYCLE_NOT_FOUND,
        status: 400
      })
    }
    const next_start_date = new Date(
      new Date(menstrualCycle.start_date).getTime() + menstrualCycle.period * 24 * 60 * 60 * 1000
    )
    const next_end_date = new Date(
      new Date(menstrualCycle.end_date).getTime() + menstrualCycle.period * 24 * 60 * 60 * 1000
    )
    const notiDate = new Date(next_start_date.getTime() - 2 * 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000)

    await redisClient.set(
      `${payload.account_id}: notiDate`,
      JSON.stringify({
        notiDate,
        notiPayload: {
          notificationId: uuidv4(),
          account_id: menstrualCycle.account.account_id,
          email: menstrualCycle.account.email,
          message: CUSTOMER_MESSAGES.MENSTRUAL_CYCLE_SCHEDULED_NOTIFICATION,
          notificationType: 'Reminder',
          daysUntilPeriod: 2,
          predictedPeriodDate: next_start_date.toISOString()
        } as NotificationPayload
      })
    )
    return {
      next_start_date,
      next_end_date,
      notiDate
    }
  }

  async updateMenstrualCycle(payload: any) {
    const { account_id, start_date, end_date, note } = payload
    const menstrualCycle: MenstrualCycle | null = await menstrualCycleRepository.findOne({
      where: { account: { account_id } }
    })
    if (!menstrualCycle) {
      throw new ErrorWithStatus({
        message: CUSTOMER_MESSAGES.MENSTRUAL_CYCLE_NOT_FOUND,
        status: 400
      })
    }

    const period =
      (new Date(start_date).getTime() - new Date(menstrualCycle.start_date).getTime()) / (24 * 60 * 60 * 1000)
    console.log(period)
    await menstrualCycleRepository.update(menstrualCycle.cycle_id, {
      start_date,
      end_date,
      period,
      note
    })
    return {
      message: CUSTOMER_MESSAGES.MENSTRUAL_CYCLE_UPDATED
    }
  }

  async createNotification(payload: any) {
    const redisNoti = await redisClient.get(`${payload.account_id}: notiDate`)
    console.log(redisNoti)
    const noti = JSON.parse(redisNoti as string)
    console.log(noti)
    // gửi thông báo lên redis đợi
    await Promise.all([
      scheduleNotification(new Date('2025-05-31T07:00:00.000Z'), noti.notiPayload),
      redisClient.del(`${payload.account_id}: notiDate`)
    ])
    return {
      message: CUSTOMER_MESSAGES.MENSTRUAL_CYCLE_SCHEDULED_NOTIFICATION
    }
  }

  async createLaborarityAppointment(payload: any) {
    const { account_id, slot_id, date, lab_id } = payload

    const appointmentDate = new Date(date)
    const [staff, queueIndex] = await Promise.all([
      staffService.countStaff({ date, slot_id }),
      appointmentRepository.count({
        where: {
          working_slot: { slot_id: slot_id as string },
          date: appointmentDate.toISOString()
        }
      })
    ])
    if (staff < queueIndex) {
      throw new ErrorWithStatus({
        message: CUSTOMER_MESSAGES.LABORARITY_NOT_ENOUGH_STAFF,
        status: 400
      })
    }

    const appointment = appointmentRepository.create({
      customer: { account_id: account_id as string },
      working_slot: { slot_id: slot_id as string },
      laborarity: lab_id.map((id: string) => ({ lab_id: id })), // add từng lab trong lab_id vào
      date: appointmentDate.toISOString(),
      queue_index: queueIndex + 1
    })
    let amount = 0
    for (const id of lab_id) {
      const lab: Laboratory | null = await labRepository.findOne({
        where: { lab_id: id }
      })
      if (!lab) {
        throw new ErrorWithStatus({
          message: LABORARITY_MESSAGES.LABORARITY_NOT_FOUND,
          status: 400
        })
      }
      amount += lab.price
    }

    await appointmentRepository.save(appointment)
    return {
      message: CUSTOMER_MESSAGES.LABORARITY_APPOINTMENT_CREATED_SUCCESS,
      data: { appointment, amount }
    }
  }
}

const customerService = new CustomerService()
export default customerService
