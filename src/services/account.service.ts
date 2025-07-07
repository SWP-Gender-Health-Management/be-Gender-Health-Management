import 'reflect-metadata'
import type { StringValue } from 'ms'
import { hashPassword, verifyPassword } from '../utils/crypto.js'
import { signToken, verifyToken } from '../utils/jwt.js'
import { config } from 'dotenv'
import { MailOptions, sendMail } from './email.service.js'
import { AppDataSource } from '../config/database.config.js'
import Account from '../models/Entity/account.entity.js'
import { ErrorWithStatus } from '../models/Error.js'
import { USERS_MESSAGES } from '../constants/message.js'
import redisClient from '../config/redis.config.js'
import { OAuth2Client } from 'google-auth-library'
import crypto from 'crypto'

config()
const accountRepository = AppDataSource.getRepository(Account)
const client = new OAuth2Client(process.env.GG_AUTH_CLIENTID as string) // Lấy Client ID từ Doppler/.env

class AccountService {
  /**
   * @description: Kiểm tra email đã tồn tại trong database
   * @param email: string
   * @returns: Account | null
   */
  async checkEmailExist(email: string): Promise<Account | null> {
    return await accountRepository.findOne({ where: { email } })
  }

  /**
   * @description: Kiểm tra mật khẩu có khớp với email trong database
   * @param email: string
   * @param password: string
   * @returns: boolean
   */
  async checkPassword(email: string, password: string): Promise<boolean> {
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
  async createAccessToken(account_id: string, email: string): Promise<string> {
    const token = await signToken({
      payload: {
        account_id: account_id,
        email: email
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
  async createRefreshToken(account_id: string, email: string): Promise<string> {
    return await signToken({
      payload: {
        account_id: account_id,
        email: email
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
  async createEmailVerifiedToken(account_id: string, secretPasscode: string): Promise<string> {
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
   * @param isGoogleAccount?: boolean
   * @returns: {
   *   account_id: string
   *   accessToken: string
   *   refreshToken: string
   *   emailVerifiedToken?: string
   * }
   */
  async createAccount(
    email: string,
    password?: string,
    isGoogleAccount: boolean = false
  ): Promise<{
    account_id: string
    accessToken: string
    refreshToken: string
    emailVerifiedToken?: string
  }> {
    let passwordHash: string | undefined
    let secretPasscode: string | undefined

    if (!isGoogleAccount && password) {
      passwordHash = await hashPassword(password)
      secretPasscode = Math.floor(100000 + Math.random() * 900000).toString()
    }

    const userData: Partial<Account> = {
      email: email,
      is_google_account: isGoogleAccount
    }

    if (passwordHash) {
      userData.password = passwordHash
    }

    if (isGoogleAccount) {
      userData.is_verified = true // Tài khoản Google đã được xác thực
    }

    const user = accountRepository.create(userData)
    await accountRepository.save(user)

    const [accessToken, refreshToken] = await Promise.all([
      this.createAccessToken(user.account_id, email),
      this.createRefreshToken(user.account_id, email)
    ])

    let emailVerifiedToken: string | undefined
    if (secretPasscode) {
      emailVerifiedToken = await this.createEmailVerifiedToken(user.account_id, secretPasscode)
    }

    // Lưu token và user vào redis
    const redisPromises = [redisClient.set(user.account_id, JSON.stringify(user), 'EX', 60 * 60)]

    if (emailVerifiedToken) {
      redisPromises.push(
        redisClient.set(
          `${process.env.EMAIL_VERRIFY_TOKEN_REDIS}:${user.account_id}`,
          emailVerifiedToken,
          'EX',
          60 * 60
        )
      )
    }

    await Promise.all(redisPromises)

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
  async login(
    account_id: string,
    email: string,
    password: string
  ): Promise<{
    accessToken: string
    refreshToken: string
    role: string
  }> {
    const user = (await redisClient.get(`account:${account_id}`)) as string
    const user_data = JSON.parse(user)
    console.log(user_data)
    const [accessToken, refreshToken] = await Promise.all([
      this.createAccessToken(user_data.account_id, email),
      this.createRefreshToken(user_data.account_id, email)
    ])
    // console.log('accessToken:', accessToken)
    // console.log('refreshToken:', refreshToken)
    return { accessToken, refreshToken, role: user_data.role as string }
  }

  /**
   * @description: Xác thực token Google
   * @param idToken: string
   * @returns: {
   *   accessToken: string
   *   refreshToken: string
   *   account: Account
   * }
   */
  async googleVerify(idToken: string): Promise<{
    accessToken: string
    refreshToken: string
    account: Account
  }> {
    // Xác minh token với Google
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GG_AUTH_CLIENTID as string // Xác định rằng token này dành cho ứng dụng của bạn
    })

    const payload = ticket.getPayload()
    if (!payload) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.GOOGLE_ACCOUNT_NOT_FOUND,
        status: 400
      })
    }
    // payload chứa thông tin người dùng: { sub, email, name, picture, ... }
    const googleId = payload.sub
    const email = payload.email
    const displayName = payload.name
    const avatar = payload.picture

    // Tìm hoặc tạo người dùng trong database của bạn (logic tương tự Passport)
    let account = await accountRepository.findOne({
      where: {
        email: email
      }
    })
    console.log('account:', account)

    if (!account) {
      // Nếu người dùng không tồn tại, tạo mới tài khoản Google (không có mật khẩu)
      account = accountRepository.create({
        email: email,
        full_name: displayName,
        avatar: avatar,
        is_google_account: true,
        is_verified: true // Tài khoản Google đã được xác thực
      })
      await accountRepository.save(account)
    } else {
      // Nếu tài khoản đã tồn tại, cập nhật thông tin Google nếu cần
      if (!account.is_google_account) {
        await accountRepository.update(account.account_id, {
          is_google_account: true,
          is_verified: true
        })
        account.is_google_account = true
        account.is_verified = true
      }
    }

    // Tạo JWT token của riêng ứng dụng để trả về cho client
    const [accessToken, refreshToken] = await Promise.all([
      this.createAccessToken(account.account_id, email as string),
      this.createRefreshToken(account.account_id, email as string)
    ])
    console.log('accessToken:', accessToken)
    console.log('refreshToken:', refreshToken)
    // Trả về token và thông tin người dùng
    return { accessToken, refreshToken, account }
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
  async changePassword(
    account_id: string,
    newPassword: string
  ): Promise<{
    accessToken: string
    refreshToken: string
  }> {
    // Kiểm tra xem tài khoản có phải là Google account không
    const account = await accountRepository.findOne({ where: { account_id } })
    if (!account) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.ACCOUNT_NOT_FOUND,
        status: 400
      })
    }

    if (account.is_google_account) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.GOOGLE_ACCOUNT_NO_PASSWORD,
        status: 400
      })
    }

    const passwordHash = await hashPassword(newPassword)
    const [userRedis] = await Promise.all([
      redisClient.get(`account:${account_id}`),
      accountRepository.update(account_id, { password: passwordHash })
    ])
    const user: Account = JSON.parse(userRedis as string)
    user.password = passwordHash
    const [accessToken, refreshToken] = await Promise.all([
      this.createAccessToken(account_id, user.email as string),
      this.createRefreshToken(account_id, user.email as string),
      redisClient.set(account_id, JSON.stringify(user), 'EX', 60 * 60)
    ])
    return { accessToken, refreshToken }
  }

  /**
   * @description: Lấy thông tin tài khoản từ database
   * @param id: string
   * @returns: Account
   */
  async getAccountById(id: any): Promise<Account> {
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

  /**
   * @description: Xác thực email
   * @param account_id: string
   * @param secretPasscode: string
   * @returns: {
   *   message: string
   * }
   */
  async verifyEmail(
    account_id: string,
    secretPasscode: string
  ): Promise<{
    message: string
  }> {
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

  /**
   * @description: Cập nhật thông tin tài khoản
   * @param account_id: string
   * @param full_name: string
   * @param phone: string
   * @param dob: string
   * @param gender: string
   * @returns: Account
   */
  async updateProfile(
    account_id: string,
    full_name?: string,
    phone?: string,
    dob?: string,
    gender?: string
  ): Promise<Account> {
    const [user] = await Promise.all([
      accountRepository.findOne({ where: { account_id } }),
      accountRepository.update(account_id, {
        full_name: full_name || undefined,
        phone: phone || undefined,
        dob: dob || undefined,
        gender: gender || undefined
      })
    ])
    await redisClient.set(account_id, JSON.stringify(user), 'EX', 60 * 60)
    return user as Account
  }

  /**
   * @description: Gửi email xác thực
   * @param account_id: string
   * @returns: {
   *   message: string
   * }
   */
  async sendEmailVerified(account_id: string): Promise<void> {
    const secretPasscode = Math.floor(100000 + Math.random() * 900000).toString()
    const emailVerifyToken = await this.createEmailVerifiedToken(account_id, secretPasscode)
    console.log(emailVerifyToken)
    const user = await redisClient.get(`account:${account_id}`)
    const userParse = JSON.parse(user as string)
    const options = {
      to: userParse.email,
      subject: 'Verify your email',
      text: `Your passcode is ${secretPasscode}`,
      htmlPath: 'template/email-verify.html',
      placeholders: {
        USER_NAME: userParse.full_name,
        OTP_CODE: secretPasscode,
        OTP_EXPIRATION_MINUTES: '10',
        CURRENT_YEAR: new Date().getFullYear().toString(),
        SUPPORT_EMAIL: 'anhdonguyennhi@gmail.com'
      }
    } as MailOptions
    await Promise.all([
      //lưu token vào redis
      redisClient.set(`${process.env.JWT_EMAIL_VERIFIED_TOKEN}:${account_id}`, emailVerifyToken, 'EX', 60 * 60),
      //gửi email
      sendMail(options)
    ])
  }

  /**
   * @description: Kiểm tra email đã được xác thực
   * @param account_id: string
   * @returns: Account
   */
  async checkEmailVerified(account_id: string): Promise<Account | boolean> {
    const user: Account = JSON.parse((await redisClient.get(`account:${account_id}`)) as string)
    return user?.is_verified === true ? user : false
  }

  /**
   * @description: Xem thông tin tài khoản
   * @param account_id: string
   * @returns: Account
   */

  async viewAccount(account_id: string): Promise<Account> {
    const user = (await redisClient.get(`account:${account_id}`)) as string
    const userParse = JSON.parse(user)
    return userParse
  }

  /**
   * @description: Tạo token đặt lại mật khẩu
   * @param account_id: string
   * @param secretPasscode: string
   * @returns: string
   */
  async createEmailResetPasswordToken(account_id: string, secretPasscode: string): Promise<string> {
    return await signToken({
      payload: { account_id, secretPasscode },
      secretKey: process.env.JWT_SECRET_RESET_PASSWORD_TOKEN as string,
      options: { expiresIn: process.env.JWT_TOKEN_EXPIRE_IN as StringValue }
    })
  }

  /**
   * @description: Gửi email đặt lại mật khẩu
   * @param account_id: string
   * @param email: string
   * @returns: {
   *   message: string
   * }
   */
  async sendEmailResetPassword(
    account_id: string,
    email: string
  ): Promise<{
    message: string
    secretPasscode: string
  }> {
    // Kiểm tra xem tài khoản có phải là Google account không
    const account = await accountRepository.findOne({ where: { account_id } })
    if (!account) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.ACCOUNT_NOT_FOUND,
        status: 400
      })
    }

    if (account.is_google_account) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.GOOGLE_ACCOUNT_NO_RESET_EMAIL,
        status: 400
      })
    }

    const secretPasscode = crypto.randomInt(100000, 999999).toString()
    console.log('secretPasscode:', secretPasscode)

    const resetPasswordToken = await this.createEmailResetPasswordToken(account_id, secretPasscode)
    console.log('resetPasswordToken:', resetPasswordToken)
    const options = {
      to: email,
      subject: 'Reset your password',
      text: `Your passcode is ${secretPasscode}`,
      htmlPath: 'template/reset-password.html',
      placeholders: {
        EMAIL: email,
        OTP_CODE: secretPasscode,
        OTP_EXPIRATION_MINUTES: '5',
        CURRENT_YEAR: new Date().getFullYear().toString(),
        SUPPORT_EMAIL: 'anhdonguyennhi@gmail.com'
      }
    } as MailOptions
    await Promise.all([
      //lưu token vào redis
      redisClient.set(`ResetPasswordToken:${account_id}`, resetPasswordToken, 'EX', 60 * 5),
      //gửi email
      sendMail(options)
    ])
    return {
      message: USERS_MESSAGES.SEND_RESET_PASSWORD_SUCCESS,
      secretPasscode: secretPasscode
    }
  }

  /**
   * @description: Xác thực mã passcode đặt lại mật khẩu
   * @param passcode: string
   * @param account_id: string
   * @returns: void
   */
  async verifyPasscodeResetPassword(passcode: string, account_id: string): Promise<void> {
    const userToken = await redisClient.get(`ResetPasswordToken:${account_id}`)
    console.log('userToken:', userToken)
    const userTokenParse = await verifyToken({
      token: userToken as string,
      secretKey: process.env.JWT_SECRET_RESET_PASSWORD_TOKEN as string
    })
    console.log('userTokenParse:', userTokenParse)
    console.log('passcode:', passcode)
    if (passcode !== userTokenParse.secretPasscode || userTokenParse.account_id !== account_id) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.SECRET_PASSCODE_MISMATCH,
        status: 400
      })
    }
  }

  async resetPassword(
    account_id: string,
    new_password: string
  ): Promise<{
    message: string
  }> {
    // Kiểm tra xem tài khoản có phải là Google account không
    const account = await accountRepository.findOne({ where: { account_id } })
    if (!account) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.ACCOUNT_NOT_FOUND,
        status: 400
      })
    }

    if (account.is_google_account) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.GOOGLE_ACCOUNT_NO_RESET,
        status: 400
      })
    }

    const passwordHash = await hashPassword(new_password)
    await accountRepository.update(account_id, { password: passwordHash })
    // await redisClient.del(`${process.env.JWT_FORFOT_PASSWORD_TOKEN}:${account_id}`)
    return {
      message: USERS_MESSAGES.RESET_PASSWORD_SUCCESS
    }
  }
}
const accountService = new AccountService()
export default accountService
