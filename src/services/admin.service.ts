import { AppDataSource } from '../config/database.config.js'
import Account from '../models/Entity/account.entity.js'
import { Role } from '../enum/role.enum.js'
import { hashPassword } from '../utils/crypto.js'
import { ADMIN_MESSAGES, USERS_MESSAGES } from '~/constants/message.js'
import { ErrorWithStatus } from '~/models/Error.js'

const accountRepository = AppDataSource.getRepository(Account)

class AdminService {
  /**
   * @description: Tạo tài khoản admin
   * @param full_name: string
   * @param email: string
   * @param password: string
   * @returns: Account
   */
  async createAdmin(full_name: string, email: string, password: string) {
    const hashedPassword = await hashPassword(password)
    const newAdmin = await accountRepository.create({
      full_name,
      email,
      password: hashedPassword,
      role: Role.ADMIN
    })

    await accountRepository.save(newAdmin)
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
    const [admins, totalItems] = await accountRepository.findAndCount({
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

    const newManager = accountRepository.create({
      full_name,
      email,
      password: hashedPassword,
      role: Role.MANAGER
    })
    await accountRepository.save(newManager)
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
    const [managers, totalItems] = await accountRepository.findAndCount({
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
    const newStaff = accountRepository.create({
      full_name,
      email,
      password: hashedPassword,
      role: Role.STAFF
    })
    await accountRepository.save(newStaff)
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
    const [staffs, totalItems] = await accountRepository.findAndCount({
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
    const newConsultant = accountRepository.create({
      full_name,
      email,
      password: hashedPassword,
      role: Role.CONSULTANT
    })
    await accountRepository.save(newConsultant)
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
    const [consultants, totalItems] = await accountRepository.findAndCount({
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
    const newCustomer = accountRepository.create({
      full_name,
      email,
      password: hashedPassword,
      role: Role.CUSTOMER
    })
    await accountRepository.save(newCustomer)
    return newCustomer
  }

  /**
   * @description: Ban tài khoản
   * @param account_id: string
   * @returns: Account
   */
  async banAccount(account_id: string) {
    const account = await accountRepository.findOne({
      where: { account_id }
    })
    if (!account) {
      throw new ErrorWithStatus({
        message: ADMIN_MESSAGES.ACCOUNT_NOT_FOUND,
        status: 404
      })
    }
    await accountRepository.update(account_id, { is_banned: true })
    return {
      message: ADMIN_MESSAGES.ACCOUNT_BANNED_SUCCESS
    }
  }
}

export default new AdminService()
