import { NextFunction, Request, Response } from 'express'
import { config } from 'dotenv'
import jwt from 'jsonwebtoken'
import RefreshToken from '~/models/Entity/refresh_token.entity.js'
import { AppDataSource } from '~/config/database.config.js'
import HTTP_STATUS from '~/constants/httpStatus.js'
import AccountService from '~/services/account.service.js'
import { REFRESH_TOKEN_MESSAGES, USERS_MESSAGES } from '~/constants/message.js'

config()
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken)

export const refreshTokenController = async (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.cookies
  if (!refreshToken) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: REFRESH_TOKEN_MESSAGES.REFRESH_TOKEN_NOT_FOUND })
  }

  // 2. Kiểm tra xem refresh token có trong DB và còn hợp lệ không
  // (Đây là bước bạn so sánh token trong cookie với token đã lưu trong DB)
  const isValid = await refreshTokenRepository.findOneBy({
    token: refreshToken
  })

  if (!isValid) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({ message: REFRESH_TOKEN_MESSAGES.INVALID_REFRESH_TOKEN })
  }

  // 3. Xác thực JWT của refresh token
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string, (err: any, user: any) => {
    if (err) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({ message: REFRESH_TOKEN_MESSAGES.INVALID_REFRESH_TOKEN })
    }

    // 4. Tạo một accessToken MỚI (không tạo refresh token mới ở đây)
    const newRefreshToken = AccountService.createRefreshToken(user.account_id, user.email)

    // 5. Trả accessToken mới về cho client
    res.status(HTTP_STATUS.OK).json({
      message: USERS_MESSAGES.REFRESH_TOKEN_SUCCESS,
      data: {
        accessToken: newRefreshToken
      }
    })
  })
}
