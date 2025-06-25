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
   * @returns: Account[]
   */
  async getAllStaff() {
    return await accountRepository.find({
      where: {
        role: Role.STAFF
      }
    })
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
