import { AppDataSource } from '~/config/database.config'
import refresh_token from '~/models/Entity/refresh_token.entity'

const refreshTokenRepository = AppDataSource.getRepository(refresh_token)
class RefreshTokenService {
  async createRefreshToken({ account_id, token }: { account_id: string; token: string }) {
    const refreshToken = refreshTokenRepository.create({
      account_id: account_id,
      token: token
    })
    return await refreshTokenRepository.save(refreshToken)
  }

  async updateRefreshToken({ account_id, token }: { account_id: string; token: string }) {
    // Check if refresh token exists for this account
    const existingToken = await this.getRefreshToken({ account_id })

    if (existingToken) {
      // Update existing token
      await refreshTokenRepository.update(existingToken.account_id, {
        token: token
      })
    } else {
      // Create new token if doesn't exist
      await this.createRefreshToken({ account_id, token })
    }
  }

  async getRefreshToken({ account_id }: { account_id: string }) {
    return await refreshTokenRepository.findOne({ where: { account_id: account_id } })
  }

  async deleteRefreshToken({ account_id }: { account_id: string }) {
    return await refreshTokenRepository.delete({ account_id: account_id })
  }
}

const refreshTokenService = new RefreshTokenService()
export default refreshTokenService
