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
import { subDays } from 'date-fns'

const accountRepo = AppDataSource.getRepository(Account)
const labAppRepo = AppDataSource.getRepository(LaboratoryAppointment)
const conAppRepo = AppDataSource.getRepository(ConsultAppointment)
const transactionRepo = AppDataSource.getRepository(Transaction)

class AdminService {
  /**
   * @description: Lấy tổng số lượng khách hàng, lịch thí nghiệm, lịch tư vấn, doanh thu
   * @returns: {
   * totalCustomers: number,
   * totalLab: number,
   * totalCon: number,
   * totalRevenue: number
   * }
   */
  async getOverall() {
    const totalCustomers = await accountRepo.count({
      where: { role: Role.CUSTOMER }
    })
    const totalLab = await labAppRepo.count()
    const totalCon = await conAppRepo.count()
    const totalRevenue = await transactionRepo
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total_revenue')
      .where('transaction.status = :status', { status: TransactionStatus.PAID })
      .getRawOne()
    console.log(totalRevenue)
    return {
      totalCustomers: totalCustomers,
      labBooking: totalLab,
      conBooking: totalCon,
      revenue: totalRevenue
    }
  }

  /**
   * @description: Lấy tổng số lượng khách hàng, lịch thí nghiệm, lịch tư vấn, doanh thu
   * @returns: {
   * totalCustomers: number,
   * totalLab: number,
   * totalCon: number,
   * totalRevenue: number
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

  /**
   * @description: Tạo tài khoản admin
   * @param full_name: string
   * @param email: string
   * @param password: string
   * @returns: Account
   */
  async createAdmin(full_name: string, email: string, password: string) {
    const hashedPassword = await hashPassword(password)
    const newAdmin = await accountRepo.create({
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
}

export default new AdminService()
