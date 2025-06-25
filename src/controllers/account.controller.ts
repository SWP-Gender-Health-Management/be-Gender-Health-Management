import { NextFunction, Request, Response } from 'express'
import redisClient from '~/config/redis.config.js'
import HTTP_STATUS from '~/constants/httpStatus.js'
import { USERS_MESSAGES } from '~/constants/message.js'
import { ErrorWithStatus } from '~/models/Error.js'
import accountService from '~/services/account.service.js'
import refreshTokenService from '~/services/refresh_token.service.js'
import notificationService from '~/services/notification.service.js'
import { TypeNoti } from '~/enum/type_noti.enum.js'
/**
 * @swagger
 * /account/register:
 *   post:
 *     summary: Register a new account
 *     description: Creates a new account and returns account details with access and refresh tokens.
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email of the account
 *               password:
 *                 type: string
 *                 description: The password of the account
 *               confirmPassword:
 *                 type: string
 *                 description: Confirmation of the password
 *             required: [email, password, confirmPassword]
 *     responses:
 *       201:
 *         description: Account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 result:
 *                   type: object
 *                   properties:
 *                     account_id:
 *                       type: string
 *                       description: The account ID (UUID)
 *                     accessToken:
 *                       type: string
 *                       description: JWT access token
 *                     refreshToken:
 *                       type: string
 *                       description: JWT refresh token
 *                     emailVerifiedToken:
 *                       type: string
 *                       description: Token for email verification
 *       400:
 *         description: Bad request (e.g., email already exists)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
export const registerController = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body
  const result = await accountService.createAccount(email, password)
  console.log(result)

  const { account_id, accessToken, refreshToken } = result
  const account = (await redisClient.get(account_id)) as string
  const account_data = JSON.parse(account)
  await Promise.all([
    refreshTokenService.createRefreshToken({ account: account_data, token: refreshToken }),
    redisClient.set(`accessToken:${account_id}`, accessToken, {
      EX: 60 * 60
    })
  ])
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true, // Quan trọng: Ngăn JavaScript phía client truy cập
    secure: true, // Chỉ gửi cookie qua HTTPS ở môi trường production
    sameSite: 'strict', // Hoặc 'lax'. Giúp chống tấn công CSRF. 'strict' là an toàn nhất.
    maxAge: parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN as string) // Thời gian sống của cookie (tính bằng mili giây)
  })
  await notificationService.createNotification(
    {
      type: TypeNoti.ACCOUNT_REGISTER_SUCCESS,
      title: 'Account registered successfully',
      message: 'Your account has been registered successfully'
    },
    account_id
  )
  res.status(HTTP_STATUS.CREATED).json({
    message: USERS_MESSAGES.USER_CREATED_SUCCESS,
    result
  })
}

/**
 * @swagger
 * /account/login:
 *   post:
 *     summary: Login to an account
 *     description: Authenticates a user and returns access and refresh tokens.
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email of the account
 *               password:
 *                 type: string
 *                 description: The password of the account
 *             required: [email, password]
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 result:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: JWT access token
 *                     refreshToken:
 *                       type: string
 *                       description: JWT refresh token
 *       400:
 *         description: Bad request (e.g., invalid credentials)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  const { account_id, email, password } = req.body
  const result = await accountService.login(account_id, email, password)
  const { accessToken, refreshToken } = result
  const account = (await redisClient.get(`account:${account_id}`)) as string
  const account_data = JSON.parse(account)
  await Promise.all([
    refreshTokenService.updateRefreshToken({ account: account_data, token: refreshToken }),
    redisClient.set(`accessToken:${account_id}`, JSON.stringify(accessToken), {
      EX: 60 * 60
    })
  ])
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true, // Quan trọng: Ngăn JavaScript phía client truy cập
    secure: true, // Chỉ gửi cookie qua HTTPS ở môi trường production
    sameSite: 'strict', // Hoặc 'lax'. Giúp chống tấn công CSRF. 'strict' là an toàn nhất.
    maxAge: 60 * 60 * 24 * 30 // Thời gian sống của cookie (tính bằng mili giây)
  })
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.USER_LOGGED_IN_SUCCESS,
    result
  })
}

export const googleVerifyController = async (req: Request, res: Response, next: NextFunction) => {
  console.log('Google verify controller')
  const { idToken } = req.body // Lấy ID Token từ body của request1
  try {
    console.log('Token:', idToken)

    const result = await accountService.googleVerify(idToken)
    const { accessToken, refreshToken, account } = result
    await Promise.all([
      refreshTokenService.updateRefreshToken({ account: account, token: refreshToken }),
      redisClient.set(`accessToken:${account.account_id}`, accessToken, {
        EX: 60 * 60
      })
    ])
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // Quan trọng: Ngăn JavaScript phía client truy cập
      secure: true, // Chỉ gửi cookie qua HTTPS ở môi trường production
      sameSite: 'strict', // Hoặc 'lax'. Giúp chống tấn công CSRF. 'strict' là an toàn nhất.
      maxAge: 60 * 60 * 24 * 30 // Thời gian sống của cookie (tính bằng mili giây)
    })
    res.status(HTTP_STATUS.OK).json({
      message: USERS_MESSAGES.GOOGLE_VERIFY_SUCCESS,
      result
    })
  } catch (error) {
    console.log('Google verify failed:', error)
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.GOOGLE_VERIFY_FAILED,
      status: 400
    })
  }
}

/**
 * @swagger
 * /account/change-password:
 *   post:
 *     summary: Change account password
 *     description: Changes the password for an authenticated account and returns new tokens.
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email of the account
 *               password:
 *                 type: string
 *                 description: The current password
 *               new_password:
 *                 type: string
 *                 description: The new password
 *             required: [email, password, new_password]
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 result:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: JWT access token
 *                     refreshToken:
 *                       type: string
 *                       description: JWT refresh token
 *       400:
 *         description: Bad request (e.g., invalid password)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       401:
 *         description: Unauthorized (invalid token)
 */
export const changePasswordController = async (req: Request, res: Response, next: NextFunction) => {
  const { account, newPassword } = req.body
  const result = await accountService.changePassword(account.account_id, newPassword)
  if (!result) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.CHANGE_PASSWORD_FAILED,
      status: 400
    })
  }
  await refreshTokenService.updateRefreshToken({ account: account, token: result.refreshToken })

  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Quan trọng: Chỉ gửi cookie qua HTTPS (true cho production)
    sameSite: 'strict', // Hoặc 'Lax'. 'Strict' là an toàn nhất (chống CSRF)
    expires: new Date(Date.now() + parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN as string)),
    // path: '/account/auth/refresh-token' // Tùy chọn: Giới hạn cookie chỉ được gửi đến endpoint cụ thể này
    path: '/' // Hoặc đặt path rộng hơn nếu cần thiết cho các kịch bản khác nhau
  })

  await notificationService.createNotification(
    {
      type: TypeNoti.PASSWORD_CHANGED_SUCCESS,
      title: 'Password changed successfully',
      message: 'Your password has been changed successfully'
    },
    account.account_id
  )
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.PASSWORD_CHANGED_SUCCESS,
    result
  })
}

export const sendResetPasswordController = async (req: Request, res: Response, next: NextFunction) => {
  const { account, email } = req.body
  console.log('account:', account)
  const result = await accountService.sendEmailResetPassword(account.account_id, email)
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.SEND_RESET_PASSWORD_SUCCESS,
    result
  })
}

export const verifyResetPasswordController = async (req: Request, res: Response, next: NextFunction) => {
  const { passcode, account } = req.body
  console.log(account)
  const result = await accountService.verifyPasscodeResetPassword(passcode, account.account_id)
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.VERIFY_PASSCODE_RESET_PASSWORD_SUCCESS,
    result
  })
}

export const resetPasswordController = async (req: Request, res: Response, next: NextFunction) => {
  const { account, newPassword } = req.body
  console.log('newPassword:', newPassword)
  const result = await accountService.resetPassword(account.account_id, newPassword)
  await notificationService.createNotification(
    {
      type: TypeNoti.PASSWORD_RESET_SUCCESS,
      title: 'Password reset successfully',
      message: 'Your password has been reset successfully'
    },
    account.account_id
  )
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.RESET_PASSWORD_SUCCESS,
    result
  })
}

/**
 * @swagger
 * /account/verify-email:
 *   post:
 *     summary: Verify email address
 *     description: Verifies the email address of an account using a secret passcode.
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email of the account
 *               secretPasscode:
 *                 type: string
 *                 description: The verification passcode sent to the email
 *             required: [email, secretPasscode]
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *       400:
 *         description: Bad request (e.g., invalid passcode)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       401:
 *         description: Unauthorized (invalid token)
 */
export const verifyEmailController = async (req: Request, res: Response, next: NextFunction) => {
  const { account_id, secretPasscode } = req.body
  await accountService.verifyEmail(account_id, secretPasscode)
  await notificationService.createNotification(
    {
      type: TypeNoti.EMAIL_VERIFIED,
      title: 'Email verified successfully',
      message: 'Your email has been verified successfully'
    },
    account_id
  )
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.EMAIL_VERIFIED_SUCCESS
  })
}

/**
 * @swagger
 * /account/send-email-verified:
 *   post:
 *     summary: Send email verification
 *     description: Sends an email containing a verification passcode to the account.
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               account_id:
 *                 type: string
 *                 description: The account ID (UUID)
 *             required: [account_id]
 *     responses:
 *       200:
 *         description: Email verification sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *       401:
 *         description: Unauthorized (invalid token)
 */
export const sendEmailVerifiedController = async (req: Request, res: Response, next: NextFunction) => {
  await accountService.sendEmailVerified(req.body.account_id)
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.SEND_EMAIL_VERIFIED_SUCCESS
  })
}

/**
 * @swagger
 * /account/update-profile:
 *   post:
 *     summary: Update account profile
 *     description: Updates the profile information of an authenticated account.
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *                 description: The full name of the account
 *               phone:
 *                 type: string
 *                 description: The phone number of the account
 *               dob:
 *                 type: string
 *                 format: date
 *                 description: Date of birth
 *               gender:
 *                 type: string
 *                 description: Gender of the account
 *             required: []
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 result:
 *                   $ref: '#/components/schemas/Account'
 *       401:
 *         description: Unauthorized (invalid token)
 */
export const updateAccountController = async (req: Request, res: Response, next: NextFunction) => {
  const { account_id, full_name, phone, dob, gender } = req.body
  const result = await accountService.updateProfile(account_id, full_name, phone, dob, gender)
  await notificationService.createNotification(
    {
      type: TypeNoti.ACCOUNT_UPDATED_SUCCESS,
      title: 'Account updated successfully',
      message: 'Your account has been updated successfully'
    },
    account_id
  )
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.USER_UPDATED_SUCCESS,
    result
  })
}

/**
 * @swagger
 * /account/check-email-verified:
 *   post:
 *     summary: Check email verification status
 *     description: Checks if the email of an authenticated account is verified.
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email of the account
 *             required: [email]
 *     responses:
 *       200:
 *         description: Email verification status checked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 result:
 *                   $ref: '#/components/schemas/Account'
 *       400:
 *         description: Bad request (email not verified)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       401:
 *         description: Unauthorized (invalid token)
 */
export const checkEmailVerifiedController = async (req: Request, res: Response, next: NextFunction) => {
  const { account_id } = req.body
  const result = await accountService.checkEmailVerified(account_id)
  if (!result) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.EMAIL_NOT_VERIFIED,
      status: 400
    })
  }
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.EMAIL_VERIFIED_SUCCESS,
    result
  })
}

/**
 * @swagger
 * /account/view-account:
 *   post:
 *     summary: View account details
 *     description: Retrieves the details of an authenticated account.
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               account_id:
 *                 type: string
 *                 description: The account ID (UUID)
 *             required: [account_id]
 *     responses:
 *       200:
 *         description: Account details retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 result:
 *                   $ref: '#/components/schemas/Account'
 *       401:
 *         description: Unauthorized (invalid token)
 */
export const viewAccountController = async (req: Request, res: Response, next: NextFunction) => {
  const { account_id } = req.body
  const result = await accountService.viewAccount(account_id)
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.USER_VIEWED_SUCCESS,
    result
  })
}

/**
 * @swagger
 * /account/logout:
 *   post:
 *     summary: Logout from account
 *     description: Logs out an authenticated account by deleting the refresh token.
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               account_id:
 *                 type: string
 *                 description: The account ID (UUID)
 *             required: [account_id]
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *       401:
 *         description: Unauthorized (invalid token)
 */
export const logoutController = async (req: Request, res: Response, next: NextFunction) => {
  const { account_id } = req.body
  await refreshTokenService.deleteRefreshToken(account_id)
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.USER_LOGGED_OUT_SUCCESS
  })
}
