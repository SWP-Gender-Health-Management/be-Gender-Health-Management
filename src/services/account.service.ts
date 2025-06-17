import 'reflect-metadata'
import type { StringValue } from 'ms'
import { hashPassword, verifyPassword } from '../utils/crypto.js'
import { signToken, verifyToken } from '../utils/jwt.js'
import { config } from 'dotenv'
import { sendMail } from './email.service.js'
import { AppDataSource } from '../config/database.config.js'
import Account from '../models/Entity/account.entity.js'
import { ErrorWithStatus } from '../models/Error.js'
import { USERS_MESSAGES } from '../constants/message.js'
import redisClient from '../config/redis.config.js'

config()
const accountRepository = AppDataSource.getRepository(Account)
class AccountService {
  /**
   * @description: Kiểm tra email đã tồn tại trong database
   * @param email: string
   * @returns: Account | null
   */
  async checkEmailExist(email: string) {
    return await accountRepository.findOne({ where: { email } })
  }

  /**
   * @description: Kiểm tra mật khẩu có khớp với email trong database
   * @param email: string
   * @param password: string
   * @returns: boolean
   */
  async checkPassword(email: string, password: string) {
    const user = await accountRepository.findOne({ where: { email } })
    if (!user) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.ACCOUNT_NOT_FOUND,
        status: 400
      })
    }
    const isPasswordValid = await verifyPassword(password, user.password)
    return isPasswordValid
  }

  /**
   * @description: Tạo token access
   * @param account_id: string
   * @param email: string
   * @param password: string
   * @returns: string
   */
  async createAccessToken(account_id: string, email: string, password: string) {
    const token = await signToken({
      payload: {
        account_id: account_id,
        email: email,
        password: password
      },
      secretKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRE_IN as StringValue
      }
    })
    return token
  }

  /**
   * @description: Tạo token refresh
   * @param account_id: string
   * @param email: string
   * @param password: string
   * @returns: string
   */
  async createRefreshToken(account_id: string, email: string, password: string) {
    return await signToken({
      payload: {
        account_id: account_id,
        email: email,
        password: password
      },
      secretKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRE_IN as StringValue
      }
    })
  }

  /**
   * @description: Tạo token email verified
   * @param account_id: string
   * @param secretPasscode: string
   * @returns: string
   */
  async createEmailVerifiedToken(account_id: string, secretPasscode: string) {
    return await signToken({
      payload: {
        account_id: account_id,
        secretPasscode: secretPasscode
      },
      secretKey: process.env.JWT_SECRET_EMAIL_VERIFIED_TOKEN as string,
      options: {
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRE_IN as StringValue
      }
    })
  }

  /**
   * @description: Tạo tài khoản
   * @param email: string
   * @param password: string
   * @returns: {
   *   account_id: string
   *   accessToken: string
   *   refreshToken: string
   *   emailVerifiedToken: string
   * }
   */
  async createAccount(email: string, password: string) {
    const passwordHash = await hashPassword(password)
    const secretPasscode = Math.floor(100000 + Math.random() * 900000).toString()

    const user = accountRepository.create({
      email: email,
      password: passwordHash
    })
    await accountRepository.save(user)

    const [accessToken, refreshToken, emailVerifiedToken] = await Promise.all([
      this.createAccessToken(user.account_id, email, passwordHash),
      this.createRefreshToken(user.account_id, email, passwordHash),
      this.createEmailVerifiedToken(user.account_id, secretPasscode)
    ])
    // await this.sendEmailVerified(user.account_id)
    //lưu token và user vào redis
    await Promise.all([
      redisClient.set(`${process.env.EMAIL_VERRIFY_TOKEN_REDIS}:${user.account_id}`, emailVerifiedToken, 'EX', 60 * 60),
      redisClient.set(user.account_id, JSON.stringify(user), 'EX', 60 * 60)
    ])

    return {
      account_id: user.account_id,
      accessToken,
      refreshToken,
      emailVerifiedToken
    }
  }

  /**
   * @description: Đăng nhập
   * @param account_id: string
   * @param email: string
   * @param password: string
   * @returns: {
   *   accessToken: string
   *   refreshToken: string
   * }
   */
  async login(account_id: string, email: string, password: string) {
    const user: Account = JSON.parse((await redisClient.get(account_id)) as string)
    const [accessToken, refreshToken] = await Promise.all([
      this.createAccessToken(account_id, email, password),
      this.createRefreshToken(account_id, email, password)
    ])
    return { accessToken, refreshToken }
  }

  /**
   * @description: Thay đổi mật khẩu
   * @param account_id: string
   * @param new_password: string
   * @returns: {
   *   accessToken: string
   *   refreshToken: string
   * }
   */
  async changePassword(account_id: string, new_password: string) {
    const passwordHash = await hashPassword(new_password)
    const [userRedis] = await Promise.all([
      redisClient.get(account_id),
      accountRepository.update(account_id, { password: passwordHash })
    ])
    const user: Account = JSON.parse(userRedis as string)
    user.password = passwordHash
    const [accessToken, refreshToken] = await Promise.all([
      this.createAccessToken(account_id, user.email, passwordHash),
      this.createRefreshToken(account_id, user.email, passwordHash),
      redisClient.set(account_id, JSON.stringify(user), 'EX', 60 * 60)
    ])
    return { accessToken, refreshToken }
  }

  /**
   * @description: Lấy thông tin tài khoản từ database
   * @param id: string
   * @returns: Account
   */
  async getAccountById(id: any) {
    const user = await accountRepository.findOneBy({
      account_id: id
    })
    if (!user) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.ACCOUNT_NOT_FOUND,
        status: 400
      })
    }
    return user
  }

  async verifyEmail(payload: any) {
    const { account_id, secretPasscode } = payload
    const userToken = await redisClient.get(`${process.env.JWT_EMAIL_VERIFIED_TOKEN}:${account_id}`)
    // const userTokenParse = JSON.parse(userToken as string)
    console.log(userToken)
    if (!userToken) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.EMAIL_VERIFIED_TOKEN_EXPIRED,
        status: 400
      })
    }
    //kiểm tra token có hợp lệ không
    const isSecretPasscodeValid = await verifyToken({
      token: userToken,
      secretKey: process.env.JWT_SECRET_EMAIL_VERIFIED_TOKEN as string
    })
    //kiểm tra mã passcode có khớp không
    if (secretPasscode !== isSecretPasscodeValid.secretPasscode || isSecretPasscodeValid.account_id !== account_id) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.SECRET_PASSCODE_MISMATCH,
        status: 400
      })
    }
    //cập nhật trạng thái verified
    await Promise.all([
      accountRepository.update(account_id, { is_verified: true }),
      redisClient.del(`${process.env.EMAIL_VERRIFY_TOKEN_REDIS}:${account_id}`)
    ])
    const user: Account | null = await accountRepository.findOne({ where: { account_id } })
    await redisClient.set(account_id, JSON.stringify(user), 'EX', 60 * 60)
    return {
      message: USERS_MESSAGES.EMAIL_VERIFIED_SUCCESS
    }
  }

  async updateProfile(payload: any) {
    const { account_id, full_name, phone, dob, gender } = payload
    const [user] = await Promise.all([
      accountRepository.findOne({ where: { account_id } }),
      accountRepository.update(account_id, {
        full_name: full_name || null,
        phone: phone || null,
        dob: dob || null,
        gender: gender || null
      })
    ])
    await redisClient.set(account_id, JSON.stringify(user), 'EX', 60 * 60)
    return user
  }

  async sendEmailVerified(account_id: string) {
    const secretPasscode = Math.floor(100000 + Math.random() * 900000).toString()
    const emailVerifyToken = await this.createEmailVerifiedToken({
      account_id: account_id,
      secretPasscode: secretPasscode
    })
    console.log(emailVerifyToken)

    await Promise.all([
      //lưu token vào redis
      redisClient.set(`${process.env.JWT_EMAIL_VERIFIED_TOKEN}:${account_id}`, emailVerifyToken, 'EX', 60 * 60),
      //gửi email
      sendMail(
        'ndmanh1005@gmail.com',
        'Verify your email',
        `Your passcode is ${secretPasscode}`,
        'template/email-verify.html',
        {
          USER_NAME: 'Nguyen Duy Manh',
          OTP_CODE: secretPasscode,
          OTP_EXPIRATION_MINUTES: '10',
          CURRENT_YEAR: new Date().getFullYear().toString(),
          SUPPORT_EMAIL: 'anhdonguyennhi@gmail.com'
        }
      )
    ])
  }

  async checkEmailVerified(account_id: string) {
    const user: Account = JSON.parse((await redisClient.get(account_id)) as string)
    return user?.is_verified === true ? user : false
  }

  async viewAccount(account_id: string) {
    const user: Account = JSON.parse((await redisClient.get(account_id)) as string)
    return user
  }

  async createEmailResetPasswordToken(payload: any) {
    const { account_id, secretPasscode } = payload
    return await signToken({
      payload: { account_id, secretPasscode },
      secretKey: process.env.JWT_SECRET_RESET_PASSWORD_TOKEN as string,
      options: { expiresIn: process.env.JWT_TOKEN_EXPIRE_IN as StringValue }
    })
  }

  async sendEmailResetPassword(payload: any) {
    const { account, email } = payload
    const secretPasscode = Math.floor(100000 + Math.random() * 900000).toString()
    const resetPasswordToken = await this.createEmailResetPasswordToken({
      account_id: account.account_id,
      secretPasscode: secretPasscode
    })
    console.log(resetPasswordToken)

    await Promise.all([
      //lưu token vào redis
      redisClient.set(
        `${process.env.JWT_EMAIL_VERIFIED_TOKEN}:${account.account_id}`,
        resetPasswordToken,
        'EX',
        60 * 5
      ),
      //gửi email
      sendMail(email, 'Verify your email', `Your passcode is ${secretPasscode}`, 'template/reset-password.html', {
        EMAIL: email,
        OTP_CODE: secretPasscode,
        OTP_EXPIRATION_MINUTES: '5',
        CURRENT_YEAR: new Date().getFullYear().toString(),
        SUPPORT_EMAIL: 'anhdonguyennhi@gmail.com'
      })
    ])
    return {
      message: USERS_MESSAGES.SEND_PASSCODE_RESET_PASSWORD_SUCCESS
    }
  }

  async verifyPasscodeResetPassword(passcode: string, account_id: string) {
    const userToken = await redisClient.get(`${process.env.JWT_RESET_PASSWORD_TOKEN}:${account_id}`)
    const userTokenParse = await verifyToken({
      token: userToken as string,
      secretKey: process.env.JWT_SECRET_RESET_PASSWORD_TOKEN as string
    })
    if (passcode !== userTokenParse.secretPasscode || userTokenParse.account_id !== account_id) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.SECRET_PASSCODE_MISMATCH,
        status: 400
      })
    }
  }

  async getAccountFromRedis(data: any) {
    const { account_id } = data
    return await this.getAccountById(account_id)
  }
}
const accountService = new AccountService()
export default accountService
