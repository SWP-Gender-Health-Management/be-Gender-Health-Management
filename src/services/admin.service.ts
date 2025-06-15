import { AppDataSource } from '../config/database.config.js'
import Account from '../models/Entity/account.entity.js'
import { Role } from '../enum/role.enum.js'
import { hashPassword } from '../utils/crypto.js'

const accountRepository = AppDataSource.getRepository(Account)

class AdminService {
  async createAdmin(payload: any) {
    const { full_name, email, password } = payload
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

  async createManager(payload: any) {
    const { full_name, email, password } = payload
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

  async createStaff(payload: any) {
    const { full_name, email, password } = payload
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

  async getAllStaff() {
    return await accountRepository.find({
      where: {
        role: Role.STAFF
      }
    })
  }

  async createConsultant(payload: any) {
    const { full_name, email, password } = payload
    const hashedPassword = await hashPassword(password)
    const newConsultant = await accountRepository.create({
      full_name,
      email,
      password: hashedPassword,
      role: Role.CONSULTANT
    })
    await accountRepository.save(newConsultant)
    return newConsultant
  }

  async createCustomer(payload: any) {
    const { full_name, email, password } = payload
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
}

export default new AdminService()
