import { Between, LessThanOrEqual, Like, MoreThanOrEqual } from 'typeorm'
import { AppDataSource } from '~/config/database.config.js'
import { StatusAppointment, stringToStatus } from '~/enum/statusAppointment.enum.js'
import ConsultAppointment from '~/models/Entity/consult_appointment.entity.js'
import LaboratoryAppointment from '~/models/Entity/laborarity_appointment.entity.js'
import Feedback from '~/models/Entity/feedback.entity.js'
import { addDays, endOfMonth, endOfWeek, startOfMonth, startOfWeek, subDays } from 'date-fns'
import { TypeAppointment } from '~/enum/type_appointment.enum.js'
import Account from '~/models/Entity/account.entity.js'
import { Role } from '~/enum/role.enum.js'
import MenstrualCycle from '~/models/Entity/menstrual_cycle.entity.js'
import StaffPattern from '~/models/Entity/staff_pattern.entity.js'
import ConsultantPattern from '~/models/Entity/consultant_pattern.entity.js'
import Transaction from '~/models/Entity/transaction.entity.js'
import { TransactionStatus } from '~/enum/transaction.enum.js'
import Blog from '~/models/Entity/blog.entity.js'
import Question from '~/models/Entity/question.entity.js'

const accountRepo = AppDataSource.getRepository(Account)
const conAppRepo = AppDataSource.getRepository(ConsultAppointment)
const labAppRepo = AppDataSource.getRepository(LaboratoryAppointment)
const feedbackRepo = AppDataSource.getRepository(Feedback)
const mensRepo = AppDataSource.getRepository(MenstrualCycle)
const staffPatternRepo = AppDataSource.getRepository(StaffPattern)
const conPatternRepo = AppDataSource.getRepository(ConsultantPattern)
const transactionRepo = AppDataSource.getRepository(Transaction)
const blogRepo = AppDataSource.getRepository(Blog)
const questionRepo = AppDataSource.getRepository(Question)

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

  async getMensOverall() {
    const today = new Date()
    const startOfMonthDate = startOfMonth(today)
    const endOfMonthDate = endOfMonth(today)
    const [totalMens, totalMensMonth, totalPeriod, totalMensDate] = await Promise.all([
      mensRepo.count(),
      mensRepo.count({
        where: {
          created_at: Between(startOfMonthDate, endOfMonthDate)
        }
      }),
      mensRepo.sum('period'),
      mensRepo
        .createQueryBuilder('MenstrualCycle')
        // EXTRACT(EPOCH FROM ...) sẽ lấy ra tổng số giây giữa 2 mốc thời gian
        .select(
          'SUM(EXTRACT(EPOCH FROM ("MenstrualCycle"."end_date" - "MenstrualCycle"."start_date")))',
          'totalSeconds'
        )
        .getRawOne()
    ])
    // kết quả trả về là tổng số giây, ví dụ: { totalSeconds: '2592000' }
    const totalSeconds = parseFloat(totalMensDate.totalSeconds) || 0

    // Chuyển đổi từ giây sang ngày
    const totalDays = totalSeconds / (60 * 60 * 24)
    return {
      totalMens,
      totalMensMonth,
      averagePeriod: (totalPeriod as number) / totalMens,
      averageDays: totalDays / totalMens
    }
  }

  async getMensAgePercent() {
    const result = await accountRepo
      .createQueryBuilder('account')
      .select(
        `
      CASE
          WHEN TIMESTAMPDIFF(YEAR, account.dob, CURDATE()) BETWEEN 15 AND 19 THEN '15-19 tuổi'
          WHEN TIMESTAMPDIFF(YEAR, account.dob, CURDATE()) BETWEEN 20 AND 24 THEN '20-24 tuổi'
          WHEN TIMESTAMPDIFF(YEAR, account.dob, CURDATE()) BETWEEN 25 AND 29 THEN '25-29 tuổi'
          WHEN TIMESTAMPDIFF(YEAR, account.dob, CURDATE()) BETWEEN 30 AND 34 THEN '30-34 tuổi'
          WHEN TIMESTAMPDIFF(YEAR, account.dob, CURDATE()) BETWEEN 35 AND 39 THEN '35-39 tuổi'
          WHEN TIMESTAMPDIFF(YEAR, account.dob, CURDATE()) > 40 THEN '>40 tuổi'
          ELSE 'Nhóm khác'
      END`,
        'ageGroup'
      ) // Đặt tên cho cột kết quả là "ageGroup"
      .addSelect('COUNT(account.account_id)', 'userCount') // Đếm số lượng user trong mỗi nhóm
      .where('account.role = :role', { role: Role.CUSTOMER })
      .andWhere('account.is_banned = :isBanned', { isBanned: false })
      .andWhere('account.menstrual_cycle IS NOT NULL')
      .groupBy('ageGroup') // Nhóm kết quả lại theo các nhóm tuổi
      .getRawMany() // Lấy kết quả thô
    return { ...result }
  }

  async getMensPeriodPercent() {
    const result = await mensRepo
      .createQueryBuilder('menstrual_cycle')
      .select(
        `
      CASE
          WHEN menstrual_cycle.period BETWEEN 21 AND 24 THEN '21-24 ngày'
          WHEN menstrual_cycle.period BETWEEN 25 AND 27 THEN '25-27 ngày'
          WHEN menstrual_cycle.period BETWEEN 28 AND 30 THEN '28-30 ngày'
          WHEN menstrual_cycle.period > 30 THEN '>30 ngày'
          ELSE 'Nhóm khác'
      END`,
        'periodGroup'
      ) // Đặt tên cho cột kết quả là "ageGroup"
      .addSelect('COUNT(menstrual_cycle.cycle_id)', 'mensCount') // Đếm số lượng user trong mỗi nhóm
      .groupBy('periodGroup') // Nhóm kết quả lại theo các nhóm tuổi
      .getRawMany() // Lấy kết quả thô
    return { ...result }
  }

  async getBlogs(pageVar: { limit: number; page: number }, status: boolean) {
    const { limit, page } = pageVar
    const skip = (page - 1) * limit
    const [result, total] = await blogRepo.findAndCount({
      order: {
        created_at: 'DESC'
      },
      skip,
      take: limit,
      where: {
        status: status
      }
    })
    return {
      result,
      totalPage: Math.ceil(total / limit)
    }
  }

  async getQuestions(pageVar: { limit: number; page: number }, status: boolean) {
    const { limit, page } = pageVar
    const skip = (page - 1) * limit
    const [result, total] = await questionRepo.findAndCount({
      order: {
        created_at: 'DESC'
      },
      where: {
        status: status
      },
      skip,
      take: limit
    })
    return {
      result,
      totalPage: Math.ceil(total / limit)
    }
  }
}
const managerService = new ManagerService()
export default managerService
