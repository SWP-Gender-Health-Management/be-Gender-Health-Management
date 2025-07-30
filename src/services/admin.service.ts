import { AppDataSource } from '../config/database.config.js'
import Account from '../models/Entity/account.entity.js'
import { convertRoleToString, parseNumericEnum, Role } from '../enum/role.enum.js'
import { hashPassword } from '../utils/crypto.js'
import { ADMIN_MESSAGES, USERS_MESSAGES } from '~/constants/message.js'
import { ErrorWithStatus } from '~/models/Error.js'
import LaboratoryAppointment from '~/models/Entity/laborarity_appointment.entity.js'
import ConsultAppointment from '~/models/Entity/consult_appointment.entity.js'
import Transaction from '~/models/Entity/transaction.entity.js'
import { TransactionStatus } from '~/enum/transaction.enum.js'
import { addDays, format, subDays } from 'date-fns'
import { StatusAppointment } from '~/enum/statusAppointment.enum.js'
import Feedback from '~/models/Entity/feedback.entity.js'
import { Between, LessThan, LessThanOrEqual, MoreThanOrEqual, Like, Equal, In } from 'typeorm'
import { TypeNoti } from '~/enum/type_noti.enum.js'
import Notification from '~/models/Entity/notification.entity.js'
import { MailOptions, sendMail } from './email.service.js'
import StaffProfile from '~/models/Entity/staff_profile.entity.js'

const accountRepo = AppDataSource.getRepository(Account)
const labAppRepo = AppDataSource.getRepository(LaboratoryAppointment)
const conAppRepo = AppDataSource.getRepository(ConsultAppointment)
const transactionRepo = AppDataSource.getRepository(Transaction)
const feedbackRepo = AppDataSource.getRepository(Feedback)
const notificationRepo = AppDataSource.getRepository(Notification)
const staffProfileRepo = AppDataSource.getRepository(StaffProfile)

class AdminService {
  // Overall
  /**
   * @description: Lấy tổng số lượng khách hàng, lịch thí nghiệm, lịch tư vấn, doanh thu
   * @returns: {
   * totalCustomers: number,
   * totalNewCustomers: number,
   * totalRevenue: number
   * importantNews: number
   * }
   */
  async getOverall(day: number) {
    const today = new Date()
    const tomorrow = addDays(today, 1)
    const previousDay = subDays(today, day)
    const [totalCustomers, totalNewCustomers, totalRevenue, importantNews] = await Promise.all([
      accountRepo.count({
        where: { role: Role.CUSTOMER }
      }),
      accountRepo
        .createQueryBuilder('account')
        // So sánh tháng và năm của cột 'createdAt' với tháng và năm của ngày hiện tại
        .where("date_trunc('month', account.created_at) = date_trunc('month', NOW())")
        .andWhere('account.role = :role', { role: Role.CUSTOMER })
        .getCount(), // Dùng getCount() để lấy kết quả đếm trực tiếp
      transactionRepo
        .createQueryBuilder('transaction')
        .select('SUM(transaction.amount)', 'total_revenue')
        .where('transaction.status = :status', { status: TransactionStatus.PAID })
        .andWhere('transaction.updated_at <= :startDate', { startDate: today })
        .andWhere('transaction.updated_at >= :endDate', { endDate: previousDay })
        .getRawOne(),
      notificationRepo.count({
        where: {
          created_at: Between(today, tomorrow)
        }
      })
    ])
    console.log(totalRevenue)

    return {
      totalCustomers: totalCustomers,
      totalNewCustomers: totalNewCustomers,
      totalRevenue: totalRevenue,
      importantNews: importantNews
    }
  }

  /**
   * @description: Lấy số lượng khách hàng đăng ký trong 30 ngày
   * @returns: {
   * listDate[]: string,
   * listCount[]: number
   * }
   */
  async getPercentCustomer(day: number) {
    // 1. Tính toán ngày bắt đầu
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - (day - 1)) // Trừ đi (N-1) ngày để có đủ N ngày
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date()

    // 2. Sử dụng raw query để tránh conflict với query builder
    const rawResult = await AppDataSource.query(
      `
      SELECT 
        TO_CHAR(date_series.day, 'YYYY-MM-DD') as date,
        COUNT(account.account_id)::int as count
      FROM generate_series($1::timestamp, $2::timestamp, '1 day') as date_series(day)
      LEFT JOIN account ON DATE_TRUNC('day', account.created_at) = date_series.day 
        AND account.role = '${Role.CUSTOMER}'
      GROUP BY date_series.day
      ORDER BY date_series.day ASC
    `,
      [startDate, endDate]
    )

    // 3. Tạo 2 array riêng biệt
    const listDate: string[] = rawResult.map((item: { date: string; count: number }) =>
      format(new Date(item.date), 'dd/MM')
    ) // Định dạng ngày: '26/06'
    const listCount: number[] = rawResult.map((item: { date: string; count: number }) => item.count) // Số lượng người tham gia theo index

    return {
      listDate,
      listCount
    }
  }

  /**
   * @description: Lấy tin tức gần đây
   * @param limit: string
   * @param page: string
   * @returns: Notification[]
   */
  async getRecentNews(): Promise<{ news: Notification[]; totalPages: number }> {
    const [news, totalItems] = await notificationRepo.findAndCount({
      order: { created_at: 'DESC' },
      take: 4
    })
    return {
      news,
      totalPages: 1
    }
  }

  // Manage account

  /**
   * @description: Tạo tài khoản
   * @param full_name: string
   * @param email: string
   * @param password: string
   * @returns: Account
   */
  async createAccount(full_name: string, email: string, password: string, role: number): Promise<Account> {
    const roleEnum = parseNumericEnum(role)
    const hashedPassword = await hashPassword(password)
    const newAccount = accountRepo.create({
      full_name,
      email,
      password: hashedPassword,
      role: roleEnum
    })

    const options: MailOptions = {
      to: email,
      subject: 'Tạo tài khoản thành công',
      htmlPath: './template/create-account.html',
      placeholders: {
        full_name: full_name,
        login_email: email,
        temporary_password: password,
        CURRENT_YEAR: new Date().getFullYear().toString()
      }
    }

    await Promise.all([accountRepo.save(newAccount), sendMail(options)])
    return newAccount
  }

  async updateStaffProfile(
    account_id: string,
    specialty: string,
    rating: string,
    description: string,
    gg_meet: string
  ) {
    const account = await accountRepo.findOne({
      where: { account_id },
      relations: ['staff_profile']
    })
    const staffProfile = account?.staff_profile ?? staffProfileRepo.create({})
    staffProfile.specialty = specialty
    staffProfile.rating = parseInt(rating)
    staffProfile.description = description
    staffProfile.gg_meet = gg_meet
    await staffProfileRepo.save(staffProfile)
    return staffProfile
  }

  /**
   * @description: Lấy tất cả tài khoản
   * @param limit - The limit of the accounts
   * @param page - The page of the accounts
   * @returns: Account[]
   */
  async getAccounts(limit: string, page: string, role: string, banned: string) {
    const limitNumber = parseInt(limit) || 10
    const pageNumber = parseInt(page) || 1
    const skip = (pageNumber - 1) * limitNumber
    const [accounts, totalItems] = await accountRepo.findAndCount({
      where: {
        role: role === 'all' ? undefined : parseNumericEnum(parseInt(role)),
        is_banned: banned === 'all' ? undefined : banned === 'true' ? true : false
      },
      order: { created_at: 'DESC' },
      skip: skip,
      take: limitNumber,
      relations: {
        staff_profile: true
      }
    })

    const proccessedRoleAccount = await accounts.map(acc => ({
      ...acc,
      role: convertRoleToString(acc.role)
    }))
    const totalPages = Math.ceil(totalItems / limitNumber)
    return {
      accounts: proccessedRoleAccount,
      totalItems,
      totalPages
    }
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

  // report
  /**
   * @description: Lấy tổng số lượng khách hàng, lịch thí nghiệm, lịch tư vấn, doanh thu
   * @param day: number
   * @returns: {
   *  totalCustomer: number,
   *  totalNewCus: number,
   *  totalLab: number,
   *  totalCon: number,
   *  totalRevenue: number,
   *  totalFeed: number,
   *  sumFeedRating: number
   * }
   */
  async getReportOverall(day: number) {
    const today = new Date()
    const yesterday = subDays(today, day)
    const [totalCustomer, totalNewCus, totalLab, totalCon, totalRevenue, totalFeed, sumFeedRating] = await Promise.all([
      accountRepo.count({
        where: { role: Role.CUSTOMER }
      }),
      accountRepo
        .createQueryBuilder('account')
        .select('COUNT(account.account_id)', 'total_new_customer')
        .where('account.role = :role', { role: Role.CUSTOMER })
        .andWhere('account.created_at >= :startDate', { startDate: yesterday })
        .andWhere('account.created_at < :endDate', { endDate: today })
        .getCount(),
      labAppRepo.count(),
      conAppRepo.count(),
      transactionRepo
        .createQueryBuilder('transaction')
        .select('SUM(transaction.amount)', 'total_revenue')
        .where('transaction.status = :status', { status: TransactionStatus.PAID })
        .andWhere('transaction.created_at >= :startDate', { startDate: yesterday })
        .andWhere('transaction.created_at < :endDate', { endDate: today })
        .getRawOne(),
      feedbackRepo.count(),
      feedbackRepo.createQueryBuilder('feedback').select('SUM(feedback.rating)', 'sum_rating').getRawOne()
    ])
    return {
      totalCustomer,
      totalNewCus,
      totalApp: totalLab + totalCon,
      totalLab,
      totalCon,
      totalRevenue: totalRevenue.total_revenue,
      totalFeed: totalFeed,
      sumFeedRating: sumFeedRating.sum_rating / (totalFeed * 5)
    }
  }

  /**
   * @description: Lấy phần trăm doanh thu
   * @param day: number
   * @returns: {
   *  listDate: string[],
   *  listSumRevenue: number[]
   * }
   */
  async getPercentRevenue(day: string) {
    // 1. Tính toán ngày bắt đầu
    let startDate = new Date()
    startDate = subDays(startDate, parseInt(day as string))
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date()
    endDate.setHours(23, 59, 59, 999)

    // 2. Sử dụng raw query để tránh conflict với query builder
    const rawResult = await AppDataSource.query(
      `
      SELECT 
        TO_CHAR(date_series.day, 'YYYY-MM-DD') as date,
        SUM(transaction.amount)::int as sum_revenue
      FROM generate_series($1::timestamp, $2::timestamp, '1 day') as date_series(day)
      LEFT JOIN transaction ON DATE_TRUNC('day', transaction.created_at) = date_series.day 
        AND transaction.status = $3
      GROUP BY date_series.day
      ORDER BY date_series.day ASC
    `,
      [startDate, endDate, TransactionStatus.PAID]
    )

    // 3. Tạo 2 array riêng biệt
    const listDate: string[] = rawResult.map((item: { date: string; sum_revenue: number }) =>
      format(new Date(item.date), 'dd/MM')
    ) // Định dạng ngày: '26/06'
    const listSumRevenue: number[] = rawResult.map((item: { date: string; sum_revenue: number }) => item.sum_revenue) // Số lượng người tham gia theo index

    return {
      listDate,
      listSumRevenue
    }
  }

  /**
   * @description: Lấy phần trăm tài khoản
   * @param day: number
   * @returns: {
   *  listDate: string[],
   *  listSumRevenue: number[]
   * }
   */
  async getPercentAccount() {
    const [customer, consultant, staff, admin, manager] = await Promise.all([
      accountRepo.count({
        where: { role: Role.CUSTOMER }
      }),
      accountRepo.count({
        where: { role: Role.CONSULTANT }
      }),
      accountRepo.count({
        where: { role: Role.STAFF }
      }),
      accountRepo.count({
        where: { role: Role.ADMIN }
      }),
      accountRepo.count({
        where: { role: Role.MANAGER }
      })
    ])
    return {
      customer,
      consultant,
      staff,
      admin,
      manager
    }
  }

  /**
   * @description: Lấy phần trăm doanh thu theo dịch vụ
   * @returns: {
   *  listDate: string[],
   *  listSumRevenue: number[]
   * }
   */
  async getPercentRevenueByService() {
    const today = new Date()
    const yesterday = subDays(today, 30)
    const [lab, con] = await Promise.all([
      transactionRepo.count({
        where: {
          app_id: Like('Lab%'),
          status: TransactionStatus.PAID,
          updated_at: Between(yesterday, today)
        }
      }),
      transactionRepo.count({
        where: {
          app_id: Like('Con%'),
          status: TransactionStatus.PAID,
          updated_at: Between(yesterday, today)
        }
      })
    ])
    return {
      lab,
      con
    }
  }

  /**
   * @description: Lấy phần trăm feedback
   * @returns: {
   *  listDate: string[],
   *  listSumRevenue: number[]
   * }
   */
  async getPercentFeedback() {
    const today = new Date()
    const yesterday = subDays(today, 30)
    const [goodFeed, normalFeed, badFeed] = await Promise.all([
      feedbackRepo.count({
        where: {
          rating: MoreThanOrEqual(4),
          created_at: Between(yesterday, today)
        }
      }),
      feedbackRepo.count({
        where: {
          rating: Equal(3),
          created_at: Between(yesterday, today)
        }
      }),
      feedbackRepo.count({
        where: {
          rating: LessThan(3),
          created_at: Between(yesterday, today)
        }
      })
    ])
    return {
      totalFeed: goodFeed + normalFeed + badFeed,
      goodFeed,
      normalFeed,
      badFeed
    }
  }

  async getNotification(limit: string, page: string) {
    const limitNumber = parseInt(limit) || 10
    const pageNumber = parseInt(page) || 1
    const skip = (pageNumber - 1) * limitNumber
    const [notifications, totalItems] = await notificationRepo.findAndCount({
      order: { created_at: 'DESC' },
      skip: skip,
      take: limitNumber
    })
    const totalPages = Math.ceil(totalItems / limitNumber)
    return {
      notifications,
      totalPages
    }
  }
}

export default new AdminService()
