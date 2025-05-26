import 'reflect-metadata'
import account from '~/models/Entity/account.entity'
// import db_service from './database.service'
import { hashPassword, verifyPassword } from '~/utils/crypto'
import { signToken, verifyToken } from '~/utils/jwt'
import { config } from 'dotenv'
import { sendMail } from './email.service'
import { AppDataSource } from '~/config/database.config'
import Account from '~/models/Entity/account.entity'
import { ErrorWithStatus } from '~/models/Error'
import { USERS_MESSAGES } from '~/constants/message'
import { Verify, verify } from 'crypto'
import { log } from 'console'
config()
const accountRepository = AppDataSource.getRepository(account)
class AccountService {
  async checkEmailExist(email: string) {
    return await accountRepository.findOne({ where: { email } })
  }

  async checkPassword(email: string, password: string) {
    const user = await accountRepository.findOne({ where: { email } })
    if (!user) {
      throw new Error('Account not found')
    }
    const isPasswordValid = await verifyPassword(password, user.password)
    return isPasswordValid
  }

  async createAccessToken(payload: any) {
    const token = await signToken({
      payload,
      secretKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRE_IN as string
      }
    })
    return token
  }

  async createRefreshToken(payload: any) {
    return await signToken({
      payload,
      secretKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRE_IN as string
      }
    })
  }

  async createEmailVerifiedToken(payload: any) {
    return await signToken({
      payload,
      secretKey: process.env.JWT_SECRET_EMAIL_VERIFIED_TOKEN as string,
      options: {
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRE_IN as string
      }
    })
  }

  async createAccount(payload: any) {
    const { email, password } = payload
    const result = await accountRepository.findOne({ where: { email } })

    if (result) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.ACCOUNT_ALREADY_EXISTS,
        status: 400
      })
    }

    const passwordHash = await hashPassword(password)
    const secretPasscode = Math.floor(100000 + Math.random() * 900000).toString()

    const user = await accountRepository.create({
      email: email,
      password: passwordHash,
      created_at: new Date(),
      updated_at: new Date()
    })
    await accountRepository.save(user)

    const [accessToken, refreshToken, emailVerifiedToken] = await Promise.all([
      this.createAccessToken({ account_id: user.account_id, password }),
      this.createRefreshToken({ account_id: user.account_id, password }),
      this.createEmailVerifiedToken({ account_id: user.account_id, secretPasscode })
    ])

    await this.sendEmailVerified(user.account_id)

    return {
      account_id: user.account_id,
      accessToken,
      refreshToken,
      emailVerifiedToken
    }
  }

  async login(payload: any) {
    const { account_id } = payload
    const [accessToken, refreshToken] = await Promise.all([
      this.createAccessToken({ account_id }),
      this.createRefreshToken({ account_id })
    ])
    return { accessToken, refreshToken }
  }

  async changePassword(payload: any) {
    const { account_id, new_password } = payload
    const user = await accountRepository.update(account_id, { password: new_password })
    const [accessToken, refreshToken] = await Promise.all([
      this.createAccessToken({ account_id, new_password }),
      this.createRefreshToken({ account_id, new_password })
    ])
    return { accessToken, refreshToken }
  }

  async getAccountsList(id: any) {}

  async updateAccount(id: any) {}

  async verifyEmail(payload: any) {
    const { account_id, secretPasscode } = payload
    const user: account | null = await accountRepository.findOne({ where: { account_id } })
    console.log(user)

    if (user?.is_verified === '1') {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED,
        status: 400
      })
    }
    const isSecretPasscodeValid = await verifyToken({
      token: user?.is_verified as string,
      secretKey: process.env.JWT_SECRET_EMAIL_VERIFIED_TOKEN as string
    })

    console.log(isSecretPasscodeValid)

    if (secretPasscode !== isSecretPasscodeValid.secretPasscode && account_id !== isSecretPasscodeValid.account_id) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.SECRET_PASSCODE_MISMATCH,
        status: 400
      })
    }

    await accountRepository.update(user?.account_id as string, { is_verified: '1' as string })
    return {
      message: USERS_MESSAGES.EMAIL_VERIFIED_SUCCESS
    }
  }

  async updateProfile(payload: any) {
    if (!(await this.checkEmailExist(payload.account_id))) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.ACCOUNT_NOT_FOUND,
        status: 400
      })
    }
    const { account_id, full_name, phone, dob, gender } = payload
    const user = await accountRepository.update(account_id, { full_name, phone, dob, gender })
    return user
  }

  async sendEmailVerified(account_id: string) {
    const secretPasscode = Math.floor(100000 + Math.random() * 900000).toString()
    const emailVerifyToken = await this.createEmailVerifiedToken({
      account_id: account_id,
      secretPasscode: secretPasscode
    })
    await Promise.all([
      accountRepository.update(account_id, { is_verified: emailVerifyToken }),
      sendMail({
        to: 'ndmanh1005@gmail.com',
        subject: 'Verify your email',
        text: `Your passcode is ${secretPasscode}`
      })
    ])
  }
}
const accountService = new AccountService()
export default accountService
