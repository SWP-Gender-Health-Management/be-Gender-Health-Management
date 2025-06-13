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
  async checkEmailExist(email: string) {
    return await accountRepository.findOne({ where: { email } })
  }

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

  async createAccessToken(payload: any) {
    const token = await signToken({
      payload,
      secretKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRE_IN as StringValue
      }
    })
    return token
  }

  async createRefreshToken(payload: any) {
    return await signToken({
      payload,
      secretKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRE_IN as StringValue
      }
    })
  }

  async createEmailVerifiedToken(payload: any) {
    return await signToken({
      payload,
      secretKey: process.env.JWT_SECRET_EMAIL_VERIFIED_TOKEN as string,
      options: {
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRE_IN as StringValue
      }
    })
  }

  async createAccount(payload: any) {
    const { email, password } = payload

    const passwordHash = await hashPassword(password)
    const secretPasscode = Math.floor(100000 + Math.random() * 900000).toString()

    const user = await accountRepository.create({
      email: email,
      password: passwordHash
    })
    await accountRepository.save(user)

    const [accessToken, refreshToken, emailVerifiedToken] = await Promise.all([
      this.createAccessToken({ account_id: user.account_id, email: email, password: passwordHash }),
      this.createRefreshToken({ account_id: user.account_id, email: email, password: passwordHash }),
      this.createEmailVerifiedToken({ account_id: user.account_id, secretPasscode })
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

  async login(payload: any) {
    const { account_id } = payload
    const user: Account = JSON.parse((await redisClient.get(account_id)) as string)
    const [accessToken, refreshToken] = await Promise.all([
      this.createAccessToken({ account_id: account_id, email: user.email, password: user.password }),
      this.createRefreshToken({ account_id: account_id, email: user.email, password: user.password })
    ])
    return { accessToken, refreshToken }
  }

  async changePassword(payload: any) {
    const { account_id, new_password } = payload
    const passwordHash = await hashPassword(new_password)
    const [userRedis] = await Promise.all([
      redisClient.get(account_id),
      accountRepository.update(account_id, { password: passwordHash })
    ])
    const user: Account = JSON.parse(userRedis as string)
    user.password = passwordHash
    const [accessToken, refreshToken] = await Promise.all([
      this.createAccessToken({ account_id, new_password }),
      this.createRefreshToken({ account_id, new_password }),
      redisClient.set(account_id, JSON.stringify(user), 'EX', 60 * 60)
    ])
    return { accessToken, refreshToken }
  }

  async verifyEmail(payload: any) {
    const { account_id, secretPasscode } = payload
    const userToken = await redisClient.get(`${process.env.EMAIL_VERRIFY_TOKEN_REDIS}:${account_id}`)
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
      redisClient.set(`${process.env.EMAIL_VERRIFY_TOKEN_REDIS}:${account_id}`, emailVerifyToken, 'EX', 60 * 60),
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
}
const accountService = new AccountService()
export default accountService
