import { NextFunction, Request, Response } from 'express'
import adminService from '../services/admin.service.js'
import { ADMIN_MESSAGES } from '../constants/message.js'
import notificationService from '~/services/notification.service.js'
import { TypeNoti } from '~/enum/type_noti.enum.js'

export const createAdminController = async (req: Request, res: Response, next: NextFunction) => {
  const { full_name, email, password } = req.body
  const admin = await adminService.createAdmin(full_name, email, password)
  await notificationService.createNotification(
    {
      type: TypeNoti.ADMIN_CREATED_SUCCESS,
      title: 'Admin created successfully',
      message: 'Your admin has been created successfully'
    },
    admin.account_id
  )
  res.status(201).json({
    message: ADMIN_MESSAGES.ADMIN_CREATED_SUCCESS,
    data: admin
  })
}

export const getAdminsController = async (req: Request, res: Response, next: NextFunction) => {
  const { limit, page } = req.query
  const result = await adminService.getAdmins(limit as string, page as string)
  res.status(200).json({
    message: ADMIN_MESSAGES.ADMIN_CREATED_SUCCESS,
    data: result
  })
}

export const createManagerController = async (req: Request, res: Response, next: NextFunction) => {
  const { full_name, email, password } = req.body
  const manager = await adminService.createManager(full_name, email, password)
  await notificationService.createNotification(
    {
      type: TypeNoti.MANAGER_CREATED_SUCCESS,
      title: 'Manager created successfully',
      message: 'Your manager has been created successfully'
    },
    manager.account_id
  )
  res.status(201).json({
    message: ADMIN_MESSAGES.MANAGER_CREATED_SUCCESS,
    data: manager
  })
}

export const getManagersController = async (req: Request, res: Response, next: NextFunction) => {
  const { limit, page } = req.query
  const result = await adminService.getManagers(limit as string, page as string)
  res.status(200).json({
    message: ADMIN_MESSAGES.MANAGER_CREATED_SUCCESS,
    data: result
  })
}

export const createStaffController = async (req: Request, res: Response, next: NextFunction) => {
  const { full_name, email, password } = req.body
  const staff = await adminService.createStaff(full_name, email, password)
  await notificationService.createNotification(
    {
      type: TypeNoti.STAFF_CREATED_SUCCESS,
      title: 'Staff created successfully',
      message: 'Your staff has been created successfully'
    },
    staff.account_id
  )
  res.status(201).json({
    message: ADMIN_MESSAGES.STAFF_CREATED_SUCCESS,
    data: staff
  })
}

export const getStaffsController = async (req: Request, res: Response, next: NextFunction) => {
  const { limit, page } = req.query
  const result = await adminService.getStaffs(limit as string, page as string)
  res.status(200).json({
    message: ADMIN_MESSAGES.STAFF_CREATED_SUCCESS,
    data: result
  })
}

export const createConsultantController = async (req: Request, res: Response, next: NextFunction) => {
  const { full_name, email, password } = req.body
  const consultant = await adminService.createConsultant(full_name, email, password)
  await notificationService.createNotification(
    {
      type: TypeNoti.CONSULTANT_CREATED_SUCCESS,
      title: 'Consultant created successfully',
      message: 'Your consultant has been created successfully'
    },
    consultant.account_id
  )
  res.status(201).json({
    message: ADMIN_MESSAGES.CONSULTANT_CREATED_SUCCESS,
    data: consultant
  })
}

export const getConsultantsController = async (req: Request, res: Response, next: NextFunction) => {
  const { limit, page } = req.query
  const result = await adminService.getConsultants(limit as string, page as string)
  res.status(200).json({
    message: ADMIN_MESSAGES.CONSULTANT_CREATED_SUCCESS,
    data: result
  })
}

export const createCustomerController = async (req: Request, res: Response, next: NextFunction) => {
  const { full_name, email, password } = req.body
  const customer = await adminService.createCustomer(full_name, email, password)
  await notificationService.createNotification(
    {
      type: TypeNoti.CUSTOMER_CREATED_SUCCESS,
      title: 'Customer created successfully',
      message: 'Your customer has been created successfully'
    },
    customer.account_id
  )
  res.status(201).json({
    message: ADMIN_MESSAGES.CUSTOMER_CREATED_SUCCESS,
    data: customer
  })
}

export const banAccountController = async (req: Request, res: Response, next: NextFunction) => {
  const { account_id } = req.body
  await adminService.banAccount(account_id)
  res.status(200).json({
    message: ADMIN_MESSAGES.ACCOUNT_BANNED_SUCCESS
  })
}
