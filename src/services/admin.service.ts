import { AppDataSource } from '../config/database.config.js'
import Account from '../models/Entity/account.entity.js'
import { Role } from '../enum/role.enum.js'
import { hashPassword } from '../utils/crypto.js'
import { ADMIN_MESSAGES, USERS_MESSAGES } from '~/constants/message.js'
import { ErrorWithStatus } from '~/models/Error.js'
import LaboratoryAppointment from '~/models/Entity/laborarity_appointment.entity.js'
import ConsultAppointment from '~/models/Entity/consult_appointment.entity.js'
import Transaction from '~/models/Entity/transaction.entity.js'
import { TransactionStatus } from '~/enum/transaction.enum.js'
import { addDays, subDays } from 'date-fns'
import { StatusAppointment } from '~/enum/statusAppointment.enum.js'
import Feedback from '~/models/Entity/feedback.entity.js'
import { Between, LessThan, LessThanOrEqual, MoreThanOrEqual } from 'typeorm'
import { TypeNoti } from '~/enum/type_noti.enum.js'
import Notification from '~/models/Entity/notification.entity.js'

const accountRepo = AppDataSource.getRepository(Account)
const labAppRepo = AppDataSource.getRepository(LaboratoryAppointment)
const conAppRepo = AppDataSource.getRepository(ConsultAppointment)
const transactionRepo = AppDataSource.getRepository(Transaction)
const feedbackRepo = AppDataSource.getRepository(Feedback)
const notificationRepo = AppDataSource.getRepository(Notification)

class AdminService {
  /**
   * @description: Lấy tổng số lượng khách hàng, lịch thí nghiệm, lịch tư vấn, doanh thu
   * @returns: {
   * totalCustomers: number,
   * totalNewCustomers: number,
   * totalRevenue: number
   * importantNews: number
   * }
   */
  async getOverall() {
    const today = new Date()
    const tomorrow = addDays(today, 1)
    const previousDay = subDays(today, 30)
    const [totalCustomers, totalNewCustomers, totalRevenue, importantNews] = await Promise.all([
      accountRepo.count({
        where: { role: Role.CUSTOMER }
      }),
      accountRepo
        .createQueryBuilder('account')
        // So sánh tháng và năm của cột 'createdAt' với tháng và năm của ngày hiện tại
        .where("date_trunc('month', account.created_at) = date_trunc('month', NOW())")
        .getCount(), // Dùng getCount() để lấy kết quả đếm trực tiếp
      transactionRepo
        .createQueryBuilder('transaction')
        .select('SUM(transaction.amount)', 'total_revenue')
        .where('transaction.status = :status', { status: TransactionStatus.PAID })
        .andWhere('transaction.updated_at <= :date', { date: today })
        .andWhere('transaction.updated_at >= :date', { date: previousDay })
        .getRawOne(),
      notificationRepo.count({
        where: {
          created_at: Between(today, tomorrow)
        }
      })
    ])
    return {
      totalCustomers: totalCustomers,
      totalNewCustomers: totalNewCustomers,
      totalRevenue: totalRevenue,
      importantNews: importantNews
    }
  }

  async getRecentNews(limit: string, page: string): Promise<Notification[]> {
    const limitNumber = parseInt(limit) || 10
    const pageNumber = parseInt(page) || 1
    const skip = (pageNumber - 1) * limitNumber
    const news = await notificationRepo.find({
      order: { created_at: 'DESC' },
      skip: skip,
      take: limitNumber
    })
    return news
  }
  /**
   * @description: Lấy tổng số lượng khách hàng, lịch thí nghiệm, lịch tư vấn, doanh thu
   * @param date: string
   * @returns: {
   *  reportDate: string,
   *  kpiToday: {
   *    totalBooking: number,
   *    labBooking: number,
   *    conBooking: number,
   *    revenue: number
   *  },
   *  kpiYesterday: {
   *    totalBooking: number,
   *    labBooking: number,
   *    conBooking: number,
   *    revenue: number
   *  },
   *  performance: {
   *    vsYes: {
   *      revenueChangePercent: number,
   *      bookingChangePercent: number
   *    }
   *  }
   * }
   */
  async getSummary(date: string) {
    const today = new Date(date + 'T00:00:00')
    const [totalLab, totalCon, totalRevenue] = await Promise.all([
      labAppRepo.count({
        where: {
          date: today
        }
      }),
      conAppRepo.count({
        where: {
          consultant_pattern: { date: today }
        }
      }),
      transactionRepo
        .createQueryBuilder('transaction')
        .select('SUM(transaction.amount)', 'total_revenue')
        .where('transaction.status = :status', { status: TransactionStatus.PAID })
        .andWhere('transaction.created_at >= :date', { date: today })
        .getRawOne()
    ])
    const yesterday = subDays(today, 1)
    const [totalLabYes, totalConYes, totalRevenueYes] = await Promise.all([
      labAppRepo.count({
        where: {
          date: yesterday
        }
      }),
      conAppRepo.count({
        where: {
          consultant_pattern: { date: yesterday }
        }
      }),
      transactionRepo
        .createQueryBuilder('transaction')
        .select('SUM(transaction.amount)', 'total_revenue')
        .where('transaction.status = :status', { status: TransactionStatus.PAID })
        .andWhere('transaction.created_at >= :date', { date: yesterday })
        .andWhere('transaction.created_at < :date', { date: today })
        .getRawOne()
    ])

    return {
      reportDate: date,
      kpiToday: {
        totalBooking: totalLab + totalCon,
        labBooking: totalLab,
        conBooking: totalCon,
        revenue: totalRevenue
      },
      kpiYesterday: {
        totalBooking: totalLabYes + totalConYes,
        labBooking: totalLabYes,
        conBooking: totalConYes,
        revenue: totalRevenueYes
      },
      performance: {
        vsYes: {
          revenueChangePercent: ((totalRevenue - totalRevenueYes) / totalRevenueYes) * 100,
          bookingChangePercent:
            ((totalLab + totalCon - (totalLabYes + totalConYes)) / (totalLabYes + totalConYes)) * 100
        }
      }
    }
  }

  async getPerformance() {
    const [totalLab, totalLabDelayed, totalLabCancelled, totalLabCompleted] = await Promise.all([
      labAppRepo.count(),
      labAppRepo.count({
        where: {
          status: StatusAppointment.DELAYED
        }
      }),
      labAppRepo.count({
        where: {
          status: StatusAppointment.CANCELLED
        }
      }),
      labAppRepo.count({
        where: {
          status: StatusAppointment.COMPLETED
        }
      })
    ])
    const [totalCon, totalConDelayed, totalConCancelled, totalConCompleted] = await Promise.all([
      conAppRepo.count(),
      conAppRepo.count({
        where: {
          status: StatusAppointment.DELAYED
        }
      }),
      conAppRepo.count({
        where: {
          status: StatusAppointment.CANCELLED
        }
      }),
      conAppRepo.count({
        where: {
          status: StatusAppointment.COMPLETED
        }
      })
    ])
    const totalApp = totalLab + totalCon
    const totalAppDelayed = totalLabDelayed + totalConDelayed
    const totalAppCancelled = totalLabCancelled + totalConCancelled
    const totalAppCompleted = totalLabCompleted + totalConCompleted
    const [totalFeed, sumRating, goodFeed, badFeed] = await Promise.all([
      feedbackRepo.count(),
      feedbackRepo.createQueryBuilder('feedback').select('SUM(feedback.rating)', 'sum_rating').getRawOne(),
      feedbackRepo.count({
        where: {
          rating: MoreThanOrEqual(4)
        }
      }),
      feedbackRepo.count({
        where: {
          rating: LessThanOrEqual(3)
        }
      })
    ])
    const goodFeedPercent = (goodFeed / totalFeed) * 100
    const badFeedPercent = (badFeed / totalFeed) * 100
    const avgRating = sumRating / totalFeed
    return {
      totalApp: totalApp,
      totalAppDelayed: totalAppDelayed,
      totalAppCancelled: totalAppCancelled,
      totalAppCompleted: totalAppCompleted,
      totalFeed: totalFeed,
      goodFeed: goodFeed,
      badFeed: badFeed,
      goodFeedPercent: goodFeedPercent,
      badFeedPercent: badFeedPercent,
      avgRating: avgRating
    }
  }

  // Manage account

  /**
   * @description: Tạo tài khoản admin
   * @param full_name: string
   * @param email: string
   * @param password: string
   * @returns: Account
   */
  async createAdmin(full_name: string, email: string, password: string) {
    const hashedPassword = await hashPassword(password)
    const newAdmin = accountRepo.create({
      full_name,
      email,
      password: hashedPassword,
      role: Role.ADMIN
    })

    await accountRepo.save(newAdmin)
    return newAdmin
  }

  /**
   * @description: Lấy tất cả tài khoản admin
   * @param limit - The limit of the admins
   * @param page - The page of the admins
   * @returns: Account[]
   */
  async getAdmins(limit: string, page: string) {
    const limitNumber = parseInt(limit) || 10
    const pageNumber = parseInt(page) || 1
    const skip = (pageNumber - 1) * limitNumber
    const [admins, totalItems] = await accountRepo.findAndCount({
      where: { role: Role.ADMIN },
      order: { created_at: 'DESC' },
      skip: skip,
      take: limitNumber
    })
    const totalPages = Math.ceil(totalItems / limitNumber)
    return {
      admins,
      totalItems,
      totalPages
    }
  }

  /**
   * @description: Tạo tài khoản manager
   * @param full_name: string
   * @param email: string
   * @param password: string
   * @returns: Account
   */
  async createManager(full_name: string, email: string, password: string) {
    const hashedPassword = await hashPassword(password)

    const newManager = accountRepo.create({
      full_name,
      email,
      password: hashedPassword,
      role: Role.MANAGER
    })
    await accountRepo.save(newManager)
    return newManager
  }

  /**
   * @description: Lấy tất cả tài khoản manager
   * @param limit - The limit of the managers
   * @param page - The page of the managers
   * @returns: Account[]
   */
  async getManagers(limit: string, page: string) {
    const limitNumber = parseInt(limit) || 10
    const pageNumber = parseInt(page) || 1
    const skip = (pageNumber - 1) * limitNumber
    const [managers, totalItems] = await accountRepo.findAndCount({
      where: {
        role: Role.MANAGER
      },
      order: {
        created_at: 'DESC'
      },
      skip: skip,
      take: limitNumber
    })
    const totalPages = Math.ceil(totalItems / limitNumber)
    return {
      managers,
      totalItems,
      totalPages
    }
  }

  /**
   * @description: Tạo tài khoản staff
   * @param full_name: string
   * @param email: string
   * @param password: string
   * @returns: Account
   */
  async createStaff(full_name: string, email: string, password: string) {
    const hashedPassword = await hashPassword(password)
    const newStaff = accountRepo.create({
      full_name,
      email,
      password: hashedPassword,
      role: Role.STAFF
    })
    await accountRepo.save(newStaff)
    return newStaff
  }

  /**
   * @description: Lấy tất cả tài khoản staff
   * @param limit - The limit of the staffs
   * @param page - The page of the staffs
   * @returns: Account[]
   */
  async getStaffs(limit: string, page: string) {
    // 1. Lấy tham số `page` và `limit` từ query string
    const limitNumber = parseInt(limit) || 10
    const pageNumber = parseInt(page) || 1

    // 2. Tính toán giá trị `skip` (bỏ qua bao nhiêu mục)
    // Ví dụ: trang 1 -> skip 0, trang 2 -> skip 10
    const skip = (pageNumber - 1) * limitNumber

    // 3. Sử dụng `findAndCount` của TypeORM
    // Sắp xếp theo ngày tạo mới nhất
    const [staffs, totalItems] = await accountRepo.findAndCount({
      where: {
        role: Role.STAFF
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
      staffs,
      totalItems,
      totalPages
    }
  }

  /**
   * @description: Tạo tài khoản consultant
   * @param full_name: string
   * @param email: string
   * @param password: string
   * @returns: Account
   */
  async createConsultant(full_name: string, email: string, password: string) {
    const hashedPassword = await hashPassword(password)
    const newConsultant = accountRepo.create({
      full_name,
      email,
      password: hashedPassword,
      role: Role.CONSULTANT
    })
    await accountRepo.save(newConsultant)
    return newConsultant
  }

  /**
   * @description: Lấy tất cả tài khoản consultant
   * @param limit - The limit of the consultants
   * @param page - The page of the consultants
   * @returns: Account[]
   */
  async getConsultants(limit: string, page: string) {
    const limitNumber = parseInt(limit) || 10
    const pageNumber = parseInt(page) || 1
    const skip = (pageNumber - 1) * limitNumber
    const [consultants, totalItems] = await accountRepo.findAndCount({
      where: {
        role: Role.CONSULTANT
      },
      order: {
        created_at: 'DESC'
      },
      skip: skip,
      take: limitNumber
    })
    const totalPages = Math.ceil(totalItems / limitNumber)
    return {
      consultants,
      totalItems,
      totalPages
    }
  }

  /**
   * @description: Tạo tài khoản customer
   * @param full_name: string
   * @param email: string
   * @param password: string
   * @returns: Account
   */
  async createCustomer(full_name: string, email: string, password: string) {
    const hashedPassword = await hashPassword(password)
    const newCustomer = accountRepo.create({
      full_name,
      email,
      password: hashedPassword,
      role: Role.CUSTOMER
    })
    await accountRepo.save(newCustomer)
    return newCustomer
  }

  /**
   * @description: Ban tài khoản
   * @param account_id: string
   * @returns: Account
   */
  async banAccount(account_id: string) {
    const account = await accountRepo.findOne({
      where: { account_id }
    })
    if (!account) {
      throw new ErrorWithStatus({
        message: ADMIN_MESSAGES.ACCOUNT_NOT_FOUND,
        status: 404
      })
    }
    await accountRepo.update(account_id, { is_banned: true })
    return {
      message: ADMIN_MESSAGES.ACCOUNT_BANNED_SUCCESS
    }
  }

  /**
   * @description: Bỏ chặn tài khoản
   * @param account_id: string
   * @returns: Account
   */
  async unbanAccount(account_id: string) {
    const account = await accountRepo.findOne({
      where: { account_id }
    })
    if (!account) {
      throw new ErrorWithStatus({
        message: ADMIN_MESSAGES.ACCOUNT_NOT_FOUND,
        status: 404
      })
    }
    await accountRepo.update(account_id, { is_banned: false })
    return {
      message: ADMIN_MESSAGES.ACCOUNT_UNBANNED_SUCCESS
    }
  }

  /**
   * @description: Lấy tất cả tài khoản customer
   * @param limit - The limit of the customers
   * @param page - The page of the customers
   * @returns: Account[]
   */
  async getCustomers(limit: string, page: string) {
    const limitNumber = parseInt(limit) || 10
    const pageNumber = parseInt(page) || 1
    const skip = (pageNumber - 1) * limitNumber
    const [customers, totalItems] = await accountRepo.findAndCount({
      where: { role: Role.CUSTOMER },
      order: {
        created_at: 'DESC'
      },
      skip: skip,
      take: limitNumber
    })
    const totalPages = Math.ceil(totalItems / limitNumber)
    return {
      customers,
      totalItems,
      totalPages
    }
  }
}

export default new AdminService()
