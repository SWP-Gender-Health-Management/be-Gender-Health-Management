import { AppDataSource } from '../config/database.config.js'
import HTTP_STATUS from '../constants/httpStatus.js'
import { BLOG_MESSAGES } from '../constants/message.js'
import { ErrorWithStatus } from '../models/Error.js'
import Blog from '../models/Entity/blog.entity.js'
import Account from '../models/Entity/account.entity.js'
import { Role } from '../enum/role.enum.js'
import fs from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import LIMIT from '~/constants/limit.js'
import { Major } from '~/enum/major.enum.js'
import NhanVien from '~/models/Entity/nhanvien.entity.js'

const nhanvienRepo = AppDataSource.getRepository(NhanVien)
const accountRepository = AppDataSource.getRepository(Account)

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

export class NhanVienService {
  async createNV(name: string, salary: number): Promise<NhanVien> {
    const nhanvien = await nhanvienRepo.create({
      name,
      salary
    })

    const savedNhanVine = await nhanvienRepo.save(nhanvien)
    return savedNhanVine
  }

  async deleteNV(NhanVienID: string) {
    await nhanvienRepo.delete(NhanVienID)

  }

  async getAllN() {
    return await nhanvienRepo.find();
  }

  async getByID(id: string) {
    return await nhanvienRepo.findOne({
        where: {
            nhanvien_id: id
        }
    })
  }

  async updateNV(id: string, name: string, salary: number) {
    return await nhanvienRepo.update(id, {
        name,
        salary
    })
  }
}

const sv = new NhanVienService();
export default sv;
