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
import StaffPattern from '~/models/Entity/staff_pattern.entity.js'
import ConsultantPattern from '~/models/Entity/consultant_pattern.entity.js'

const cusReportRepo = AppDataSource.getRepository(Account)
const ConAppRepo = AppDataSource.getRepository(ConsultAppointment)
const labRepo = AppDataSource.getRepository(LaboratoryAppointment)
const feedbackRepo = AppDataSource.getRepository(Feedback)
const mensRepo = AppDataSource.getRepository(MenstrualCycle)
const staffPatternRepo = AppDataSource.getRepository(StaffPattern)
const conPatternRepo = AppDataSource.getRepository(ConsultantPattern)

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

  async createStaffPattern(date: string, account_id: string, slot_id: string[]): Promise<StaffPattern[]> {
    const pattern = []
    for (const slotId of slot_id) {
      const staffPattern = staffPatternRepo.create({
        date: date,
        account_id: account_id,
        working_slot: {
          slot_id: slotId
        }
      })
      pattern.push(staffPattern)
      await staffPatternRepo.save(staffPattern)
    }
    return pattern
  }

  async createConsultantPattern(date: string, consultant_id: string, slot_id: string[]): Promise<ConsultantPattern[]> {
    const pattern = []
    for (const slotId of slot_id) {
      const consultantPattern = conPatternRepo.create({
        date: date,
        account_id: consultant_id,
        working_slot: {
          slot_id: slotId
        }
      })
      pattern.push(consultantPattern)
      await conPatternRepo.save(consultantPattern)
    }
    return pattern
  }

  async getStaffPattern(staff_id: string): Promise<StaffPattern[]> {
    const staffPattern = await staffPatternRepo
      .createQueryBuilder('staff_pattern')
      .where('date_trunc(\'week\', "staff_pattern"."date") = date_trunc(\'week\', NOW())')
      .andWhere('"staff_pattern"."account_id" = :staff_id', { staff_id })
      .orderBy('"staff_pattern"."date"', 'DESC')
      .getMany()
    return staffPattern
  }

  async getConsultantPattern(consultant_id: string): Promise<ConsultantPattern[]> {
    const consultantPattern = await conPatternRepo
      .createQueryBuilder('consultant_pattern')
      .where('date_trunc(\'week\', "consultant_pattern"."date") = date_trunc(\'week\', NOW())')
      .andWhere('"consultant_pattern"."account_id" = :consultant_id', { consultant_id })
      .orderBy('"consultant_pattern"."date"', 'DESC')
      .getMany()
    return consultantPattern
  }
}

const managerService = new ManagerService()
export default new ManagerService()
