import { AppDataSource } from '../config/database.config.js'
import RefreshToken from '../models/Entity/refresh_token.entity.js'
import Account from '../models/Entity/account.entity.js'

const refreshTokenRepository = AppDataSource.getRepository(RefreshToken)
class RefreshTokenService {
  /**
   * @description Create a new refresh token
   * @param account - The account
   * @param token - The token
   * @returns The created refresh token
   */
  async createRefreshToken({ account, token }: { account: Account; token: string }) {
    const refreshToken = refreshTokenRepository.create({
      account: { account_id: account.account_id },
      token: token
    })
    return await refreshTokenRepository.save(refreshToken)
  }

  /**
   * @description Update a refresh token
   * @param account - The account
   * @param token - The token
   * @returns The updated refresh token
   */
  async updateRefreshToken({ account, token }: { account: Account; token: string }) {
    // Check if refresh token exists for this account
    const existingToken = await this.getRefreshToken(account.account_id)
    console.log('existingToken:', existingToken)
    if (existingToken) {
      // Update existing token
      await refreshTokenRepository.update(account.account_id, {
        token: token
      })
    }
    // else {
    //   // Create new token if doesn't exist
    //   await this.createRefreshToken({ account, token })
    // }
  }

  /**
   * @description Get a refresh token
   * @param account_id - The ID of the account
   * @returns The refresh token
   */
  async getRefreshToken(account_id: string) {
    return await refreshTokenRepository.findOne({ where: { account: { account_id: account_id } } })
  }

  /**
   * @description Delete a refresh token
   * @param account - The account
   * @returns The deleted refresh token
   */
  async deleteRefreshToken({ account }: { account: Account }) {
    return await refreshTokenRepository.delete({ account: account })
  }
}

const refreshTokenService = new RefreshTokenService()
export default refreshTokenService
