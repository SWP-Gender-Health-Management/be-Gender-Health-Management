import { AppDataSource } from '~/config/database.config'
import refresh_tokens from '~/models/Entity/Refresh_token.entity'
import refresh_tokens from '~/models/Entity/refresh_token.entity'

class RefreshTokenService {
  async createRefreshToken({ account_id, token }: { account_id: string; token: string }) {
    const refreshTokenRepository = AppDataSource.getRepository(refresh_tokens)
    console.log('account_id, token', account_id, token)

    return await refreshTokenRepository.save({
      account_id: account_id,
      token: token,
      created_at: new Date(),
      updated_at: new Date()
    })
  }

  async updateRefreshToken({ account_id, token }: { account_id: string; token: string }) {
    // Check if refresh token exists for this account
    const existingToken = await this.getRefreshToken({ account_id })

    if (existingToken) {
      // Update existing token
      const refreshTokenRepository = AppDataSource.getRepository(refresh_tokens)
      await refreshTokenRepository.update(existingToken.account_id, {
        token: token,
        updated_at: new Date()
      })
    } else {
      // Create new token if doesn't exist
      await this.createRefreshToken({ account_id, token })
    }
  }

  async getRefreshToken({ account_id }: { account_id: string }) {
    const refreshTokenRepository = AppDataSource.getRepository(refresh_tokens)
    return await refreshTokenRepository.findOne({ where: { account_id: account_id } })
  }
}

const refreshTokenService = new RefreshTokenService()
export default refreshTokenService
