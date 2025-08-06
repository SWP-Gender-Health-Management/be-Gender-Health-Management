import { Request, Response, NextFunction } from 'express'
import HTTP_STATUS from '../constants/httpStatus.js'
import { BLOG_MESSAGES } from '../constants/message.js'
import blogService from '../services/blog.service.js'
import notificationService from '~/services/notification.service.js'
import { TypeNoti } from '~/enum/type_noti.enum.js'
import  NhanVienService  from '~/services/nhanvien.service.js'


export const createNV = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {name, salary} = req.body
    const result = await NhanVienService.createNV(name, salary)
    
    res.status(200).json({

      result
    })
  } catch (error) {
    next(error)
  }
}

export const getAllNV = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {name, salary} = req.body
    const result = await NhanVienService.getAllN()
    
    res.status(200).json({
      result
    })
  } catch (error) {
    next(error)
  }
}

export const getByID = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {id} = req.params;
    const result = await NhanVienService.getByID(id)
    
    res.status(200).json({
      result
    })
  } catch (error) {
    next(error)
  }
}

export const deleteNV = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {id} = req.params

    const result = await NhanVienService.deleteNV(id)
    
    res.status(200).json({
      result
    })
  } catch (error) {
    next(error)
  }
}


export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {id} = req.params
    const {name, salary} = req.body;
    const result = await NhanVienService.updateNV(id, name, salary)
    
    res.status(200).json({
      result
    })
  } catch (error) {
    next(error)
  }
}

