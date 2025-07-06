import { Between, LessThanOrEqual, Like, MoreThanOrEqual } from 'typeorm'
import { AppDataSource } from '~/config/database.config.js'
import { StatusAppointment, stringToStatus } from '~/enum/statusAppointment.enum.js'
import ConsultAppointment from '~/models/Entity/consult_appointment.entity.js'
import LaboratoryAppointment from '~/models/Entity/laborarity_appointment.entity.js'
import Feedback from '~/models/Entity/feedback.entity.js'
import { addDays, endOfWeek, startOfWeek, subDays } from 'date-fns'
import { TypeAppointment } from '~/enum/type_appointment.enum.js'
import Account from '~/models/Entity/account.entity.js'
import { Role } from '~/enum/role.enum.js'
import MenstrualCycle from '~/models/Entity/menstrual_cycle.entity.js'
import StaffPattern from '~/models/Entity/staff_pattern.entity.js'
import ConsultantPattern from '~/models/Entity/consultant_pattern.entity.js'
import Transaction from '~/models/Entity/transaction.entity.js'
import { TransactionStatus } from '~/enum/transaction.enum.js'

const accountRepo = AppDataSource.getRepository(Account)
const conAppRepo = AppDataSource.getRepository(ConsultAppointment)
const labAppRepo = AppDataSource.getRepository(LaboratoryAppointment)
const feedbackRepo = AppDataSource.getRepository(Feedback)
const mensRepo = AppDataSource.getRepository(MenstrualCycle)
const staffPatternRepo = AppDataSource.getRepository(StaffPattern)
const conPatternRepo = AppDataSource.getRepository(ConsultantPattern)
const transactionRepo = AppDataSource.getRepository(Transaction)

class ManagerService {
  async getOverall() {
    const today = new Date()
    const [labApp, conApp, totalLabRevenue, totalConRevenue, totalMenstrual] = await Promise.all([
      labAppRepo.count({
        where: {
          date: today
        }
      }),
      conAppRepo.count({
        where: {
          consultant_pattern: {
            date: today
          }
        }
      }),
      transactionRepo
        .createQueryBuilder('transaction')
        .select('SUM(transaction.amount)', 'totalRevenue')
        .where('transaction.date = :date', { date: today })
        .andWhere('transaction.app_id LIKE :app_id', { app_id: 'Lab_%' })
        .getRawOne()
        .then((result) => result.totalRevenue),
      transactionRepo
        .createQueryBuilder('transaction')
        .select('SUM(transaction.amount)', 'totalRevenue')
        .where('transaction.date = :date', { date: today })
        .andWhere('transaction.app_id LIKE :app_id', { app_id: 'Con_%' })
        .getRawOne()
        .then((result) => result.totalRevenue),
      mensRepo
        .createQueryBuilder('MenstrualCycle')
        .select('COUNT(mens.id)', 'totalMenstrual')
        .where("date_trunc('week', MenstrualCycle.created_at) = date_trunc('week', NOW())")
        .getRawOne()
        .then((result) => result.totalMenstrual)
    ])
    return {
      totalApp: labApp + conApp,
      totalLabRevenue,
      totalConRevenue,
      totalMenstrual
    }
  }

  async getOverallWeekly() {
    const today = new Date()
    const startOfWeekDate = startOfWeek(today)
    const endOfWeekDate = endOfWeek(today)
    const [
      pendingLabApp,
      pendingConApp,
      completedLabApp,
      completedConApp,
      totalLabApp,
      totalConApp,
      goodFeedback,
      totalFeedback
    ] = await Promise.all([
      labAppRepo.count({
        where: {
          date: Between(startOfWeekDate, endOfWeekDate),
          status: StatusAppointment.PENDING
        }
      }),
      conAppRepo.count({
        where: {
          consultant_pattern: {
            date: Between(startOfWeekDate, endOfWeekDate)
          },
          status: StatusAppointment.PENDING
        }
      }),
      labAppRepo.count({
        where: {
          date: Between(startOfWeekDate, endOfWeekDate),
          status: StatusAppointment.COMPLETED
        }
      }),
      conAppRepo.count({
        where: {
          consultant_pattern: {
            date: Between(startOfWeekDate, endOfWeekDate)
          },
          status: StatusAppointment.COMPLETED
        }
      }),
      labAppRepo.count({
        where: {
          date: Between(startOfWeekDate, endOfWeekDate)
        }
      }),
      conAppRepo.count({
        where: {
          consultant_pattern: {
            date: Between(startOfWeekDate, endOfWeekDate)
          }
        }
      }),
      feedbackRepo
        .createQueryBuilder('feedback')
        .select('SUM(feedback.rating)', 'totalRating')
        .where('feedback.date BETWEEN :startOfWeek AND :endOfWeek', {
          startOfWeek: startOfWeekDate,
          endOfWeek: endOfWeekDate
        })
        .getRawOne()
        .then((result) => result.totalRating),
      feedbackRepo.count({
        where: {
          date: Between(startOfWeekDate, endOfWeekDate)
        }
      })
    ])
    return {
      totalPendingApp: pendingLabApp + pendingConApp,
      totalCompletedApp: completedLabApp + completedConApp,
      completedPercent: ((completedLabApp + completedConApp) / (totalLabApp + totalConApp)) * 100,
      goodFeedPercent: goodFeedback / totalFeedback
    }
  }

  async getAppPercent() {
    const today = new Date()
    const startOfWeekDate = subDays(today, 7)
    const endOfWeekDate = addDays(today, 1)
    const [totalLabApp, totalConApp] = await Promise.all([
      labAppRepo.count({
        where: {
          date: Between(startOfWeekDate, endOfWeekDate)
        }
      }),
      conAppRepo.count({
        where: {
          consultant_pattern: {
            date: Between(startOfWeekDate, endOfWeekDate)
          }
        }
      })
    ])
    return {
      totalLabApp,
      totalConApp
    }
  }

  async getRecentApp() {
    const [labApp, conApp] = await Promise.all([
      labAppRepo.find({
        order: {
          date: 'DESC'
        },
        take: 5
      }),
      conAppRepo.find({
        order: {
          consultant_pattern: {
            date: 'DESC'
          }
        },
        take: 5,
        relations: {
          consultant_pattern: true
        }
      })
    ])
    const app = [...labApp, ...conApp]
    const appSort = app.sort((a, b) => {
      const aDate = new Date(a.created_at.toString()).getTime()
      const bDate = new Date(b.created_at.toString()).getTime()
      return bDate - aDate
    })
    return {
      appSort: appSort.slice(0, 5)
    }
  }

  async getConsultants(page: string, limit: string, isBan: boolean) {
    const pageNumber = parseInt(page) || 1
    const limitNumber = parseInt(limit) || 10
    const skip = (pageNumber - 1) * limitNumber
    const [consultants, total] = await accountRepo.findAndCount({
      where: {
        role: Role.CONSULTANT,
        is_banned: isBan
      },
      skip,
      take: limitNumber
    })
    return {
      consultants,
      totalPage: Math.ceil(total / limitNumber)
    }
  }

  async getStaffs(page: string, limit: string, isBan: boolean) {
    const pageNumber = parseInt(page) || 1
    const limitNumber = parseInt(limit) || 10
    const skip = (pageNumber - 1) * limitNumber
    const [staffs, total] = await accountRepo.findAndCount({
      where: {
        role: Role.STAFF,
        is_banned: isBan
      },
      skip,
      take: limitNumber
    })
    return {
      staffs,
      totalPage: Math.ceil(total / limitNumber)
    }
  }

  async getConApp(
    pageVar: { limit: number; page: number },
    filter: { fullname: string; status: number; date: string }
  ) {
    const { limit, page } = pageVar
    const { fullname, status, date } = filter
    const skip = (page - 1) * limit
    const conApp = await conAppRepo.findAndCount({
      where: {
        customer: {
          full_name: fullname ? Like(`%${fullname}%`) : undefined
        },
        status: status ? stringToStatus(status) : undefined,
        consultant_pattern: {
          date: date ? new Date(date) : undefined
        }
      },
      skip,
      take: limit,
      relations: {
        customer: true,
        consultant_pattern: true
      }
    })
    return conApp
  }

  async getLabApp(
    pageVar: { limit: number; page: number },
    filter: { fullname: string; status: number; date: string }
  ) {
    const { limit, page } = pageVar
    const skip = (page - 1) * limit
    const { fullname, status, date } = filter
    const labApp = await labAppRepo.findAndCount({
      where: {
        customer: {
          full_name: fullname ? Like(`%${fullname}%`) : undefined
        },
        status: status ? stringToStatus(status) : undefined,
        date: date ? new Date(date) : undefined
      },
      skip,
      take: limit,
      relations: {
        customer: true
        // working_slot: true
      }
    })
    return labApp
  }
}
const managerService = new ManagerService()
export default managerService
