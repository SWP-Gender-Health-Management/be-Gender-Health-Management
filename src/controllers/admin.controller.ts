import { NextFunction, Request, Response } from 'express'
import adminService from '../services/admin.service.js'
import { ADMIN_MESSAGES } from '../constants/message.js'

export const createAdminController = async (req: Request, res: Response, next: NextFunction) => {
  const { full_name, email, password } = req.body
  const admin = await adminService.createAdmin({ full_name, email, password })
  res.status(201).json({
    message: ADMIN_MESSAGES.ADMIN_CREATED_SUCCESS,
    data: admin
  })
}

export const createManagerController = async (req: Request, res: Response, next: NextFunction) => {
  const { full_name, email, password } = req.body
  const manager = await adminService.createManager({ full_name, email, password })
  res.status(201).json({
    message: ADMIN_MESSAGES.MANAGER_CREATED_SUCCESS,
    data: manager
  })
}

export const createStaffController = async (req: Request, res: Response, next: NextFunction) => {
  const { full_name, email, password } = req.body
  const staff = await adminService.createStaff({ full_name, email, password })
  res.status(201).json({
    message: ADMIN_MESSAGES.STAFF_CREATED_SUCCESS,
    data: staff
  })
}

export const getAllStaffController = async (req: Request, res: Response, next: NextFunction) => {
  const staff = await adminService.getAllStaff()
  res.status(200).json({
    message: ADMIN_MESSAGES.STAFF_CREATED_SUCCESS,
    data: staff
  })
}
export const createConsultantController = async (req: Request, res: Response, next: NextFunction) => {
  const { full_name, email, password } = req.body
  const consultant = await adminService.createConsultant({ full_name, email, password })
  res.status(201).json({
    message: ADMIN_MESSAGES.CONSULTANT_CREATED_SUCCESS,
    data: consultant
  })
}

export const createCustomerController = async (req: Request, res: Response, next: NextFunction) => {
  const { full_name, email, password } = req.body
  const customer = await adminService.createCustomer({ full_name, email, password })
  res.status(201).json({
    message: ADMIN_MESSAGES.CUSTOMER_CREATED_SUCCESS,
    data: customer
  })
}
