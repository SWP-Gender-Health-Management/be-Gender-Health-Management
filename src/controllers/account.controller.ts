import { NextFunction, Request, Response } from 'express'
import redisClient from '~/config/redis.config'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/message'
import { ErrorWithStatus } from '~/models/Error'
import accountService from '~/services/account.service'
import refreshTokenService from '~/services/refresh_token.service'

export const registerController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await accountService.createAccount(req.body)
  console.log(result)

  const { account_id, refreshToken } = result
  const account = JSON.parse((await redisClient.get(account_id)) as string)
  await refreshTokenService.createRefreshToken({ account: account, token: refreshToken })

  // res.cookie('refreshToken', refreshToken, {
  //   httpOnly: true, // Quan trọng: Ngăn JavaScript phía client truy cập
  //   secure: process.env.NODE_ENV === 'production', // Chỉ gửi cookie qua HTTPS ở môi trường production
  //   sameSite: 'strict', // Hoặc 'lax'. Giúp chống tấn công CSRF. 'strict' là an toàn nhất.
  //   maxAge: parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN as string) // Thời gian sống của cookie (tính bằng mili giây)
  //   // path: '/', // (Tùy chọn) Đường dẫn mà cookie hợp lệ, '/' là cho toàn bộ domain
  //   // domain: 'yourdomain.com', // (Tùy chọn) Chỉ định domain cho cookie
  // })
  res.status(HTTP_STATUS.CREATED).json({
    message: USERS_MESSAGES.USER_CREATED_SUCCESS,
    result
  })
}

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await accountService.login(req.body)
  const { refreshToken } = result
  const account = JSON.parse((await redisClient.get(req.body.account_id)) as string)
  // await refreshTokenService.updateRefreshToken({ account: account, token: refreshToken })
  // res.cookie('refreshToken', refreshToken, {
  //   httpOnly: true, // Quan trọng: Ngăn JavaScript phía client truy cập
  //   secure: process.env.NODE_ENV === 'production', // Chỉ gửi cookie qua HTTPS ở môi trường production
  //   sameSite: 'strict', // Hoặc 'lax'. Giúp chống tấn công CSRF. 'strict' là an toàn nhất.
  //   maxAge: parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN as string), // Thời gian sống của cookie (tính bằng mili giây)
  //   // path: '/', // (Tùy chọn) Đường dẫn mà cookie hợp lệ, '/' là cho toàn bộ domain
  //   // domain: 'yourdomain.com', // (Tùy chọn) Chỉ định domain cho cookie
  // })
  res.status(HTTP_STATUS.NOT_FOUND).json({
    message: USERS_MESSAGES.USER_LOGGED_IN_SUCCESS,
    result
  })
}

export const changePasswordController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await accounttService.changePassword(req.body)
  if (!result) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.CHANGE_PASSWORD_FAILED,
      status: 400
    })
  }
  const account = JSON.parse((await redisClient.get(req.body.account_id)) as string)
  await refreshTokenService.updateRefreshToken({ account: account, token: result.refreshToken })

  // res.cookie('refreshToken', result.refreshToken, {
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === 'production', // Quan trọng: Chỉ gửi cookie qua HTTPS (true cho production)
  //   sameSite: 'strict', // Hoặc 'Lax'. 'Strict' là an toàn nhất (chống CSRF)
  //   expires: new Date(Date.now() + parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN as string)),
  //   // path: '/api/auth/refresh-token' // Tùy chọn: Giới hạn cookie chỉ được gửi đến endpoint cụ thể này
  //   path: '/' // Hoặc đặt path rộng hơn nếu cần thiết cho các kịch bản khác nhau
  // })

  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.PASSWORD_CHANGED_SUCCESS,
    result
  })
}

export const verifyEmailController = async (req: Request, res: Response, next: NextFunction) => {
  await accountService.verifyEmail(req.body)
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.EMAIL_VERIFIED_SUCCESS
  })
}

export const sendEmailVerifiedController = async (req: Request, res: Response, next: NextFunction) => {
  await accountService.sendEmailVerified(req.body.account_id)
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.SEND_EMAIL_VERIFIED_SUCCESS
  })
}

export const viewAccountController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await accountService.viewAccount(req.body.account_id)
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.USER_VIEWED_SUCCESS,
    result
  })
}

export const updateAccountController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await accountService.updateProfile(req.body)
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.USER_UPDATED_SUCCESS,
    result
  })
}

export const checkEmailVerifiedController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await accountService.checkEmailVerified(req.body)
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

export const logoutController = async (req: Request, res: Response, next: NextFunction) => {
  await refreshTokenService.deleteRefreshToken(req.body.account_id)
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.USER_LOGGED_OUT_SUCCESS
  })
}
