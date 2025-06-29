import { Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm'
import { AppDataSource } from '~/config/database.config.js'
import { StatusAppointment } from '~/enum/statusAppointment.enum.js'
import ConsultAppointment from '~/models/Entity/consult_appointment.entity.js'
import LaboratoryAppointment from '~/models/Entity/laborarity_appointment.entity.js'
import Feedback from '~/models/Entity/feedback.entity.js'
import { addDays, formatDate, subDays } from 'date-fns'
import { TypeAppointment } from '~/enum/type_appointment.enum.js'
import Account from '~/models/Entity/account.entity.js'
import { Role } from '~/enum/role.enum.js'
import MenstrualCycle from '~/models/Entity/menstrual_cycle.entity.js'

const cusReportRepo = AppDataSource.getRepository(Account)
const ConAppRepo = AppDataSource.getRepository(ConsultAppointment)
const labRepo = AppDataSource.getRepository(LaboratoryAppointment)
const feedbackRepo = AppDataSource.getRepository(Feedback)
const mensRepo = AppDataSource.getRepository(MenstrualCycle)

class ManagerService {
  async reportPerformance() {
    const listDate: Date[] = []
    const date = new Date()
    listDate.push(date)
    const yesDate = subDays(date, 1)
    listDate.push(yesDate)
    const sevenDaysAgo = subDays(date, 7)
    listDate.push(sevenDaysAgo)

    const result = []
    for (const date of listDate) {
      const nextDate = addDays(date, 1)
      const [totalCon, goodCon, badCon, totalLab, goodLab, badLab] = await Promise.all([
        ConAppRepo.count({
          where: {
            consultant_pattern: {
              date: Between(date, nextDate)
            },
            status: StatusAppointment.COMPLETED
          }
        }),
        feedbackRepo.count({
          where: {
            type: TypeAppointment.CONSULT,
            date: Between(date, nextDate),
            rating: MoreThanOrEqual(4)
          }
        }),
        feedbackRepo.count({
          where: {
            type: TypeAppointment.CONSULT,
            date: Between(date, nextDate),
            rating: LessThanOrEqual(3)
          }
        }),
        labRepo.count({
          where: {
            date: Between(date, nextDate),
            status: StatusAppointment.COMPLETED
          }
        }),
        feedbackRepo.count({
          where: {
            type: TypeAppointment.LABORATORY,
            date: Between(date, nextDate),
            rating: MoreThanOrEqual(4)
          }
        }),
        feedbackRepo.count({
          where: {
            type: TypeAppointment.LABORATORY,
            date: Between(date, nextDate),
            rating: LessThanOrEqual(3)
          }
        })
      ])
      result.push({
        date: formatDate(date, 'yyyy-MM-dd'),
        totalApp: totalCon + totalLab,
        totalConApp: totalCon,
        goodConPercent: (goodCon / totalCon) * 100,
        badConPercent: (badCon / totalCon) * 100,
        totalLabApp: totalLab,
        goodLabPercent: (goodLab / totalLab) * 100,
        badLabPercent: (badLab / totalLab) * 100,
        goodAppPercent: ((goodCon + goodLab) / (totalCon + totalLab)) * 100,
        badAppPercent: ((badCon + badLab) / (totalCon + totalLab)) * 100
      })
    }

    return result
  }

  async reportCustomer(dateText: string) {
    const listDate: Date[] = []
    const date = new Date(dateText) || new Date()
    listDate.push(date)
    const yesDate = subDays(date, 1)
    listDate.push(yesDate)
    const sevenDaysAgo = subDays(date, 7)
    listDate.push(sevenDaysAgo)
    const result = []

    for (const date of listDate) {
      const nextDate = addDays(date, 1)
      const [totalCus, totalCusConApp, totalCusLabApp, totalCusMens] = await Promise.all([
        cusReportRepo.count({
          where: {
            role: Role.CUSTOMER,
            created_at: Between(date, nextDate)
          }
        }),
        ConAppRepo.count({
          where: {
            customer: {
              created_at: Between(date, nextDate)
            }
          }
        }),
        labRepo.count({
          where: {
            customer: {
              created_at: Between(date, nextDate)
            }
          }
        }),
        mensRepo.count({
          where: {
            created_at: LessThanOrEqual(nextDate)
          }
        })
      ])
      result.push({
        date: formatDate(date, 'yyyy-MM-dd'),
        totalCus: totalCus,
        totalCusConApp: totalCusConApp, // in 1 day
        totalCusLabApp: totalCusLabApp, // in 1 day
        totalCusMens: totalCusMens
      })
    }
  }
}

const managerService = new ManagerService()
export default new ManagerService()
