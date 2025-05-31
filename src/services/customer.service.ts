import { AppDataSource } from '~/config/database.config'
import MenstrualCycle from '~/models/Entity/menstrual_cycle.entity'
import { CUSTOMER_MESSAGES, USERS_MESSAGES } from '~/constants/message'
import { ErrorWithStatus } from '~/models/Error'
import Account from '~/models/Entity/account.entity'
import HTTP_STATUS from '~/constants/httpStatus'
import { scheduleNotification } from './notificationScheduler.service'
import { v4 as uuidv4 } from 'uuid'
import redisClient from '~/config/redis.config'
import { NotificationPayload } from '~/worker/notificationWorker'
const menstrualCycleRepository = AppDataSource.getRepository(MenstrualCycle)
const userRepository = AppDataSource.getRepository(Account)

class CustomerService {
  async createMenstrualCycle(payload: any) {
    const [user, menstrual]: [Account | null, MenstrualCycle | null] = await Promise.all([
      userRepository.findOne({
        where: { account_id: payload.account_id }
      }),
      menstrualCycleRepository.findOne({
        where: { account_id: payload.account_id }
      })
    ])
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
    const { account_id, start_date, end_date, period, note } = payload
    const menstrualCycle = menstrualCycleRepository.create({
      account_id,
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
      where: { account_id }
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
          account_id: menstrualCycle.account_id,
          email: payload.email,
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
      where: { account_id }
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
}

const customerService = new CustomerService()
export default customerService
