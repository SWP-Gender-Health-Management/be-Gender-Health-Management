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
import Laboratory from '../models/Entity/laborarity.entity.js'
import staffService from './staff.service.js'
import { Role } from '../enum/role.enum.js'
import Result from '../models/Entity/result.entity.js'
import { Like } from 'typeorm'

const menstrualCycleRepository = AppDataSource.getRepository(MenstrualCycle)
const accountRepository = AppDataSource.getRepository(Account)
const appointmentRepository = AppDataSource.getRepository(LaboratoryAppointment)
const labRepository = AppDataSource.getRepository(Laboratory)
const resultRepository = AppDataSource.getRepository(Result)
class CustomerService {
  /**
   * Get all customers
   * @param limit - The limit of the customers
   * @param page - The page of the customers
   * @returns The customers
   */
  async getCustomers(limit: string, page: string) {
    // 1. Lấy tham số `page` và `limit` từ query string
    const limitNumber = parseInt(limit) || 10
    const pageNumber = parseInt(page) || 1

    // 2. Tính toán giá trị `skip` (bỏ qua bao nhiêu mục)
    // Ví dụ: trang 1 -> skip 0, trang 2 -> skip 10
    const skip = (pageNumber - 1) * limitNumber

    // 3. Sử dụng `findAndCount` của TypeORM
    // Sắp xếp theo ngày tạo mới nhất
    const [customers, totalItems] = await accountRepository.findAndCount({
      where: {
        role: Role.CUSTOMER
      },
      order: {
        created_at: 'DESC'
      },
      skip: skip, // Bỏ qua `skip` mục đầu tiên
      take: limitNumber // Lấy `limit` mục tiếp theo
    })

    // 4. Tính toán tổng số trang
    const totalPages = Math.ceil(totalItems / limitNumber)
    return {
      customers,
      totalItems,
      totalPages
    }
  }

  /**
   * Create a menstrual cycle
   * @param account_id - The ID of the account
   * @param start_date - The start date of the menstrual cycle
   * @param end_date - The end date of the menstrual cycle
   * @param period - The period of the menstrual cycle
   * @param note - The note of the menstrual cycle
   * @returns The menstrual cycle
   */
  async createMenstrualCycle(account_id: string, start_date: string, end_date: string, period: number, note: string) {
    const user = JSON.parse((await redisClient.get(account_id)) as string)
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
    const menstrualCycle = menstrualCycleRepository.create({
      account: user,
      start_date,
      end_date,
      period: period || 30,
      note: note || ''
    })
    return menstrualCycleRepository.save(menstrualCycle)
  }

  /**
   * Predict the next period
   * @param account_id - The ID of the account
   * @returns The next period
   */
  async predictPeriod(account_id: string) {
    console.log('account_id', account_id)
    const menstrualCycle: MenstrualCycle | null = await menstrualCycleRepository.findOne({
      where: { account: { account_id } },
      relations: ['account']
    })
    console.log('menstrualCycle', menstrualCycle)
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
      `${account_id}: notiDate`,
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

  /**
   * Update a menstrual cycle
   * @param account_id - The ID of the account
   * @param start_date - The start date of the menstrual cycle
   * @param end_date - The end date of the menstrual cycle
   * @param note - The note of the menstrual cycle
   * @returns The menstrual cycle
   */
  async updateMenstrualCycle(account_id: string, start_date: string, end_date: string, note: string) {
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

  /**
   * Create a notification
   * @param account_id - The ID of the account
   * @returns The notification
   */
  async createNotification(account_id: string) {
    const redisNoti = await redisClient.get(`${account_id}: notiDate`)
    console.log(redisNoti)
    const noti = JSON.parse(redisNoti as string)
    console.log(noti)
    // gửi thông báo lên redis đợi
    await Promise.all([
      scheduleNotification(new Date('2025-05-31T07:00:00.000Z'), noti.notiPayload),
      redisClient.del(`${account_id}: notiDate`)
    ])
    return {
      message: CUSTOMER_MESSAGES.MENSTRUAL_CYCLE_SCHEDULED_NOTIFICATION
    }
  }

  /**
   * Create a laborarity appointment
   * @param account_id - The ID of the account
   * @param slot_id - The ID of the slot
   * @param date - The date of the appointment
   * @param lab_id - The ID of the laboratory
   * @returns The appointment
   */
  async createLaborarityAppointment(account_id: string, slot_id: string, date: string, lab_id: string[]) {
    const [staff, queueIndex] = await Promise.all([
      staffService.countStaff(date, slot_id),
      appointmentRepository.count({
        where: {
          working_slot: { slot_id: slot_id as string },
          date: new Date(date)
        }
      })
    ])
    if (staff < queueIndex) {
      throw new ErrorWithStatus({
        message: CUSTOMER_MESSAGES.LABORARITY_NOT_ENOUGH_STAFF,
        status: 400
      })
    }
    if (lab_id.length === 1) {
      const lab: Laboratory | null = await labRepository.findOne({
        where: { lab_id: lab_id[0] }
      })
      if (!lab) {
        throw new ErrorWithStatus({
          message: LABORARITY_MESSAGES.LABORARITY_NOT_FOUND,
          status: 400
        })
      }
      if (lab.name.startsWith('Gói')) {
        const description = lab.description.split(':')[1]
        const labName = description.split(',')
        const labIds: string[] = []
        for (const name of labName) {
          const lab: Laboratory | null = await labRepository.findOne({
            where: { name: Like(`%${name.trim()}%`) }
          })
          if (!lab) {
            throw new ErrorWithStatus({
              message: LABORARITY_MESSAGES.LABORARITY_NOT_FOUND,
              status: 400
            })
          }
          labIds.push(lab.lab_id)
        }
        lab_id = labIds
      }
    }

    const appointment = appointmentRepository.create({
      customer: { account_id: account_id },
      working_slot: { slot_id: slot_id },
      laborarity: lab_id.map((id: string) => ({ lab_id: id })), // add từng lab trong lab_id vào
      date: new Date(date),
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

  async getLaborarityAppointments(limit: string, page: string, account_id: string) {
    const limitNumber = parseInt(limit) || 10
    const pageNumber = parseInt(page) || 1
    const skip = (pageNumber - 1) * limitNumber

    const customer = await accountRepository.findOne({ where: { account_id } })
    if (!customer || customer.role !== Role.CUSTOMER) {
      throw new ErrorWithStatus({
        message: CUSTOMER_MESSAGES.ACCOUNT_ID_INVALID,
        status: 400
      })
    }
    const [appointments, total] = await appointmentRepository.findAndCount({
      where: { customer: { account_id } },
      skip,
      take: limitNumber,
      relations: ['laborarity', 'working_slot', 'result']
    })

    const app: any[] = []
    for (const appointment of appointments) {
      const appData = {
        date: appointment.date,
        time: appointment.working_slot.start_at.slice(0, 5) + ' - ' + appointment.working_slot.end_at.slice(0, 5),
        lab: appointment.laborarity,
        description: appointment.description,
        result: appointment.result,
        status: appointment.status,
        app_id: appointment.app_id
      }
      app.push(appData)
    }
    console.log(app)
    return {
      labApp: app,
      pages: Math.ceil(total / limitNumber)
    }
  }
}

const customerService = new CustomerService()
export default customerService
