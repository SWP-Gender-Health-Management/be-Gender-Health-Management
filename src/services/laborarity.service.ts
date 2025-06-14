import redisClient from '~/config/redis.config.js'
import { AppDataSource } from '../config/database.config.js'
import Laborarity from '../models/Entity/laborarity.entity.js'

const laborarityRepository = AppDataSource.getRepository(Laborarity)

class LaborarityService {
  async createLaborarity(name: string, specimen: string, description: string, price: number) {
    const laborarity = await laborarityRepository.create({
      name,
      specimen,
      description,
      price
    })
    await laborarityRepository.save(laborarity)
    return laborarity
  }

  async getAllLaborarities() {
    return await laborarityRepository.find({
      where: {
        is_active: true
      }
    })
  }
}

const laborarityService = new LaborarityService()

export default laborarityService
