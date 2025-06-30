import { NextFunction, Request, Response } from 'express'
import adminService from '../services/admin.service.js'
import { ADMIN_MESSAGES } from '../constants/message.js'
import notificationService from '~/services/notification.service.js'
import { TypeNoti } from '~/enum/type_noti.enum.js'
import HTTP_STATUS from '~/constants/httpStatus.js'
import { format } from 'date-fns'
import { emailQueue } from '~/routes/admin.route.js'

export const getOverallController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await adminService.getOverall()
  res.status(HTTP_STATUS.OK).json({
    message: ADMIN_MESSAGES.OVERALL_SUCCESS,
    data: result
  })
}

export const getRecentNewsController = async (req: Request, res: Response, next: NextFunction) => {
  const { limit, page } = req.query
  const result = await adminService.getRecentNews(limit as string, page as string)
  res.status(HTTP_STATUS.OK).json({
    message: ADMIN_MESSAGES.RECENT_NEWS_SUCCESS,
    data: result
  })
}

export const getSummaryController = async (req: Request, res: Response, next: NextFunction) => {
  let { date } = req.query
  if (!date) {
    date = format(new Date(), 'yyyy-MM-dd')
  }
  const result = await adminService.getSummary(date as string)
  res.status(HTTP_STATUS.OK).json({
    message: ADMIN_MESSAGES.SUMMARY_SUCCESS,
    data: result
  })
}

export const getPerformanceController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await adminService.getPerformance()
  res.status(HTTP_STATUS.OK).json({
    message: ADMIN_MESSAGES.PERFORMANCE_SUCCESS,
    data: result
  })
}

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

export const getCustomersController = async (req: Request, res: Response, next: NextFunction) => {
  const { limit, page } = req.query
  const result = await adminService.getCustomers(limit as string, page as string)
  res.status(200).json({
    message: ADMIN_MESSAGES.GET_CUSTOMERS_SUCCESS,
    data: result
  })
}

export const banAccountController = async (req: Request, res: Response, next: NextFunction) => {
  const { account_id } = req.body
  await adminService.banAccount(account_id)
  res.status(200).json({
    message: ADMIN_MESSAGES.ACCOUNT_BANNED_SUCCESS
  })
}

export const unbanAccountController = async (req: Request, res: Response, next: NextFunction) => {
  const { account_id } = req.body
  await adminService.unbanAccount(account_id)
  res.status(200).json({
    message: ADMIN_MESSAGES.ACCOUNT_UNBANNED_SUCCESS
  })
}

export const sendBulkEmailController = async (req: Request, res: Response, next: NextFunction) => {
  // Lấy thông tin từ request của admin
  const { targetGroup, subject, body } = req.body

  // TODO: Validate dữ liệu đầu vào

  try {
    // Thêm một job mới vào queue
    // 'send-campaign' là tên của job
    // { targetGroup, subject, body } là dữ liệu của job
    await emailQueue.add('send-campaign', { targetGroup, subject, body })

    // Phản hồi ngay lập tức cho admin
    // HTTP 202 Accepted nghĩa là "Yêu cầu đã được chấp nhận để xử lý"
    res.status(202).json({ message: 'Chiến dịch email đã được đưa vào hàng đợi và sẽ sớm bắt đầu.' })
  } catch (error) {
    console.error('Lỗi khi thêm job vào queue:', error)
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' })
  }
}
