import { AppDataSource } from '~/config/database.config'
import RefreshToken from '~/models/Entity/refresh_token.entity'
import Account from '~/models/Entity/account.entity'

const refreshTokenRepository = AppDataSource.getRepository(RefreshToken)
class RefreshTokenService {
  async createRefreshToken({ account, token }: { account: Account; token: string }) {
    const refreshToken = refreshTokenRepository.create({
      account: account,
      token: token
    })
    return await refreshTokenRepository.save(refreshToken)
  }

  async updateRefreshToken({ account, token }: { account: Account; token: string }) {
    // Check if refresh token exists for this account
    const existingToken = await this.getRefreshToken({ account })

    if (existingToken) {
      // Update existing token
      await refreshTokenRepository.update(existingToken.account, {
        token: token
      })
    } else {
      // Create new token if doesn't exist
      await this.createRefreshToken({ account, token })
    }
  }

  async getRefreshToken({ account }: { account: Account }) {
    return await refreshTokenRepository.findOne({ where: { account: account } })
  }

  async deleteRefreshToken({ account }: { account: Account }) {
    return await refreshTokenRepository.delete({ account: account })
  }
}

const refreshTokenService = new RefreshTokenService()
export default refreshTokenService
