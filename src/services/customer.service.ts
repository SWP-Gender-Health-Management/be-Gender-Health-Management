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
import Transaction from '~/models/Entity/transaction.entity.js'
import { TransactionStatus } from '~/enum/transaction.enum.js'
import { StatusAppointment } from '~/enum/statusAppointment.enum.js'
import Refund from '~/models/Entity/refund.entity.js'
import HTTP_STATUS from '~/constants/httpStatus.js'
import REFUND_RATE from '~/constants/refundRate.js'

const menstrualCycleRepository = AppDataSource.getRepository(MenstrualCycle)
const accountRepository = AppDataSource.getRepository(Account)
const appointmentRepository = AppDataSource.getRepository(LaboratoryAppointment)
const labRepository = AppDataSource.getRepository(Laboratory)
const resultRepository = AppDataSource.getRepository(Result)
const transactionRepository = AppDataSource.getRepository(Transaction)
const refundRepository = AppDataSource.getRepository(Refund)

class CustomerService {
  // tính ngày hành kinh
  calculatePeriodDays = (lastPeriodStart: Date, lastPeriodEnd: Date, periodLength: number) => {
    if (!lastPeriodStart || !lastPeriodEnd || !periodLength) return {}
    const periodDaysMap: any = {}
    const year = new Date().getFullYear()
    const lastStartDate = new Date(lastPeriodStart)
    const lastEndDate = new Date(lastPeriodEnd)
    const cycleLength = (lastEndDate.getTime() - lastStartDate.getTime()) / (24 * 60 * 60 * 1000) + 1
    const end = new Date(year + 1, 11, 31)

    let current = new Date(lastStartDate)

    while (current <= end) {
      const monthKey = `${current.getFullYear()}-${current.getMonth()}`
      for (let i = 0; i < cycleLength; i++) {
        const day = new Date(current)
        day.setDate(current.getDate() + i)
        if (day.getMonth() === current.getMonth()) {
          if (!periodDaysMap[monthKey]) periodDaysMap[monthKey] = []
          periodDaysMap[monthKey].push(day.getDate())
        }
      }
      current.setDate(current.getDate() + periodLength)
    }
    return periodDaysMap
  }

  calculateOvulationDays = (lastPeriodStart: Date, lastPeriodEnd: Date, periodLength: number) => {
    if (!lastPeriodStart || !lastPeriodEnd || !periodLength) return {}
    const ovulationDaysMap: any = {}
    const year = new Date().getFullYear()
    const lastStartDate = new Date(lastPeriodStart)
    const lastEndDate = new Date(lastPeriodEnd)
    const cycleLength = (lastEndDate.getTime() - lastStartDate.getTime()) / (24 * 60 * 60 * 1000) + 1
    const start = new Date(lastStartDate)
    const end = new Date(year + 1, 11, 31)
    let current = new Date(start)

    while (current <= end) {
      const ovulationDay = new Date(current)
      ovulationDay.setDate(current.getDate() + periodLength - 14)

      if (ovulationDay.getFullYear() === year || ovulationDay.getFullYear() === year + 1) {
        const monthKey = `${ovulationDay.getFullYear()}-${ovulationDay.getMonth()}`
        if (!ovulationDaysMap[monthKey]) ovulationDaysMap[monthKey] = []
        ovulationDaysMap[monthKey].push(ovulationDay.getDate())
      }
      current.setDate(current.getDate() + periodLength)
    }
    return ovulationDaysMap
  }

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

  async getMenstrualCycle(account_id: string): Promise<string> {
    console.log('Checking menstrual cycle for account:', account_id)
    const user = JSON.parse((await redisClient.get(`account:${account_id}`)) as string)
    if (!user) {
      return '00'
    }
    if ((user.gender as string).toLowerCase() !== 'female') {
      return '01'
    }
    const menstrualCycle = await menstrualCycleRepository.findOne({
      where: { account: { account_id } }
    })
    if (!menstrualCycle) {
      return '10'
    }
    return '11'
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
    const user = JSON.parse((await redisClient.get(`account:${account_id}`)) as string)
    console.log('user', user)
    const menstrual = await menstrualCycleRepository.findOne({
      where: { account: user }
    })
    // if (menstrual) {
    //   return {
    //     message: CUSTOMER_MESSAGES.MENSTRUAL_CYCLE_ALREADY_EXISTS,
    //     result: '11'
    //   }
    // }
    if ((user?.gender as string).toLowerCase() !== 'female') {
      return {
        message: USERS_MESSAGES.YOU_ARE_NOT_FEMALE,
        result: '00'
      }
    }
    const menstrualCycle = menstrualCycleRepository.create({
      account: user,
      start_date,
      end_date,
      period: period || 30,
      note: note || ''
    })
    return await menstrualCycleRepository.save(menstrualCycle)
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
      return {
        message: CUSTOMER_MESSAGES.MENSTRUAL_CYCLE_NOT_FOUND,
        data: null
      }
    }

    const periodDaysMap = this.calculatePeriodDays(
      menstrualCycle.start_date,
      menstrualCycle.end_date,
      menstrualCycle.period
    )
    const ovulationDaysMap = this.calculateOvulationDays(
      menstrualCycle.start_date,
      menstrualCycle.end_date,
      menstrualCycle.period
    )
    console.log('periodDaysMap', periodDaysMap)
    console.log('ovulationDaysMap', ovulationDaysMap)

    const year = new Date().getFullYear()
    const month = new Date().getMonth()
    const key = `${year}-${month + 1}`

    await redisClient.set(
      `${account_id}: notiDate`,
      JSON.stringify({
        notiDate: periodDaysMap[key][0],
        notiPayload: {
          notificationId: uuidv4(),
          account_id: menstrualCycle.account.account_id,
          email: menstrualCycle.account.email,
          message: CUSTOMER_MESSAGES.MENSTRUAL_CYCLE_SCHEDULED_NOTIFICATION,
          notificationType: 'Reminder',
          daysUntilPeriod: 2,
          predictedPeriodDate: `${periodDaysMap[key][0]}/${month}/${year}`
        } as NotificationPayload
      })
    )
    return {
      current_start_date: menstrualCycle.start_date,
      current_end_date: menstrualCycle.end_date,
      current_period: menstrualCycle.period,
      current_note: menstrualCycle.note,
      periodDaysMap,
      ovulationDaysMap,
      notiDate: `${year}-${month}-${periodDaysMap[key][0]}`
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
  async createLaborarityAppointment(account_id: string, lab_id: string[], slot_id: string, date: string) {
    // console.log('account_id', account_id)
    // console.log('lab_id', lab_id)
    // console.log('slot_id', slot_id)
    // console.log('date', date)
    const [staff, queueIndex] = await Promise.all([
      staffService.countStaff(date, slot_id),
      appointmentRepository.count({
        where: {
          working_slot: { slot_id: slot_id as string },
          date: new Date(date)
        }
      })
    ])
    // console.log('staff', staff)
    // console.log('queueIndex', queueIndex)
    if (staff * 10 <= queueIndex) {
      throw new ErrorWithStatus({
        message: CUSTOMER_MESSAGES.LABORARITY_NOT_ENOUGH_STAFF,
        status: 400
      })
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
      appointment,
      amount
    }
  }

  async getLaborarityAppointments(limit: string, page: string, account_id: string) {
    const limitNumber = parseInt(limit) || 0
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
      let isRequestedRefund: boolean = false
      let isRefunded: boolean = false
      if (appointment.status === StatusAppointment.CONFIRMED_CANCELLED) {
        const transaction = await transactionRepository.findOne({
          where: { app_id: 'Lab_' + appointment.app_id },
          relations: ['refund']
        })
        if (transaction && transaction.refund) {
          isRequestedRefund = true
          if( transaction.refund.is_refunded) {
            isRefunded = true
          }
        }
      }
      const appData = {
        date: appointment.date,
        time: appointment.working_slot.start_at.slice(0, 5) + ' - ' + appointment.working_slot.end_at.slice(0, 5),
        lab: appointment.laborarity,
        description: appointment.description,
        result: appointment.result,
        status: appointment.status,
        app_id: appointment.app_id,
        feed_id: appointment.feed_id,
        isRequestedRefund,
        isRefunded
      }
      app.push(appData)
    }
    console.log(app)
    return {
      labApp: app,
      pages: Math.ceil(total / limitNumber)
    }
  }

  async cancelLaborarityAppointment(app_id: string) {
    const appointment: LaboratoryAppointment | null = await appointmentRepository.findOne({
      where: { app_id },
      relations: ['customer', 'laborarity']
    })

    if (!appointment) {
      throw new ErrorWithStatus({
        message: CUSTOMER_MESSAGES.LABORARITY_APPOINTMENT_NOT_FOUND,
        status: 400
      })
    }

    const transaction = await transactionRepository.findOne({
      where: { app_id: 'Lab_' + appointment.app_id }
    })
    if (transaction && transaction.status === TransactionStatus.PAID) {
      await appointmentRepository.update(appointment.app_id, {
        status: StatusAppointment.CONFIRMED_CANCELLED
      })
    } else {
      await appointmentRepository.update(appointment.app_id, {
        status: StatusAppointment.PENDING_CANCELLED
      })
    }
  }

  async createLabAppointmentRefund(
    app_id: string,
    description: string,
    bankName: string,
    accountNumber: string
    // status: StatusAppointment
  ): Promise<{ savedLabAppointmentRefund: Refund; amount: number }> {
    // Validate consultant pattern
    const labAppointment = await appointmentRepository.findOne({
      where: { app_id }
    })

    if (!labAppointment) {
      throw new ErrorWithStatus({
        message: CUSTOMER_MESSAGES.LABORARITY_APPOINTMENT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const transaction = await transactionRepository.findOne({
      where: { app_id: 'Lab_' + labAppointment.app_id }
    })

    if (!transaction || transaction.status !== TransactionStatus.PAID) {
      throw new ErrorWithStatus({
        message: CUSTOMER_MESSAGES.TRANSACTION_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    if (transaction.refund) {
      throw new ErrorWithStatus({
        message: CUSTOMER_MESSAGES.LAB_APPOINTMENT_REFUND_ALREADY_EXISTS,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    let refundAmount = transaction.amount * REFUND_RATE.LAB_APPOINTMENT // 70% refund;
    if (refundAmount < 0) {
      refundAmount = 0 // Ensure refund amount is not negative
    }

    const refund = new Refund()
    refund.description = description || ''
    refund.amount = refundAmount
    refund.is_refunded = false
    refund.transaction = transaction
    refund.bankName = bankName || ''
    refund.accountNumber = accountNumber || ''

    const savedRefund = await refundRepository.save(refund)

    return {
      savedLabAppointmentRefund: savedRefund,
      amount: refundAmount
    }
  }
}

const customerService = new CustomerService()
export default customerService
