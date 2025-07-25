import { NextFunction, Request, Response } from 'express'
import adminService from '../services/admin.service.js'
import { ADMIN_MESSAGES } from '../constants/message.js'
import notificationService from '~/services/notification.service.js'
import { TypeNoti } from '~/enum/type_noti.enum.js'
import HTTP_STATUS from '~/constants/httpStatus.js'
import { format } from 'date-fns'
import { emailQueue } from '~/routes/admin.route.js'

export const getOverallController = async (req: Request, res: Response, next: NextFunction) => {
  const { day } = req.query
  const result = await adminService.getOverall(parseInt(day as string))
  res.status(HTTP_STATUS.OK).json({
    message: ADMIN_MESSAGES.OVERALL_SUCCESS,
    data: result
  })
}

export const getRecentNewsController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await adminService.getRecentNews()
  res.status(HTTP_STATUS.OK).json({
    message: ADMIN_MESSAGES.RECENT_NEWS_SUCCESS,
    data: result
  })
}

export const getPercentCustomerController = async (req: Request, res: Response, next: NextFunction) => {
  const { day } = req.query
  const result = await adminService.getPercentCustomer(parseInt(day as string))
  res.status(HTTP_STATUS.OK).json({
    message: ADMIN_MESSAGES.PERCENT_CUSTOMER_SUCCESS,
    data: result
  })
}

export const createAccountController = async (req: Request, res: Response, next: NextFunction) => {
  const { full_name, email, password, role } = req.body
  const account = await adminService.createAccount(full_name, email, password, role)
  await notificationService.createNotification(
    {
      type: TypeNoti.CREATE_ACCOUNT,
      title: 'Tạo tài khoản thành công',
      message: `Tài khoản ${full_name} đã được tạo thành công`
    },
    account.account_id
  )
  res.status(201).json({
    message: ADMIN_MESSAGES.ACCOUNT_CREATED_SUCCESS,
    data: account
  })
}

export const getAccountsController = async (req: Request, res: Response, next: NextFunction) => {
  const { limit, page } = req.query
  const { role, banned } = req.query
  const result = await adminService.getAccounts(limit as string, page as string, role as string, banned as string)
  res.status(200).json({
    message: ADMIN_MESSAGES.ACCOUNT_CREATED_SUCCESS,
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

// report

export const getReportOverallController = async (req: Request, res: Response, next: NextFunction) => {
  const { day } = req.query
  const result = await adminService.getReportOverall(parseInt(day as string))
  res.status(HTTP_STATUS.OK).json({
    message: ADMIN_MESSAGES.REPORT_OVERALL_SUCCESS,
    data: result
  })
}

export const getPercentRevenueController = async (req: Request, res: Response, next: NextFunction) => {
  const { day } = req.query
  const result = await adminService.getPercentRevenue(day as string)
  res.status(HTTP_STATUS.OK).json({
    message: ADMIN_MESSAGES.PERCENT_REVENUE_SUCCESS,
    data: result
  })
}

export const getPercentAccountController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await adminService.getPercentAccount()
  res.status(HTTP_STATUS.OK).json({
    message: ADMIN_MESSAGES.PERCENT_ACCOUNT_SUCCESS,
    data: result
  })
}

export const getPercentRevenueByServiceController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await adminService.getPercentRevenueByService()
  res.status(HTTP_STATUS.OK).json({
    message: ADMIN_MESSAGES.PERCENT_REVENUE_SERVICE_SUCCESS,
    data: result
  })
}

export const getPercentFeedbackController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await adminService.getPercentFeedback()
  res.status(HTTP_STATUS.OK).json({
    message: ADMIN_MESSAGES.PERCENT_FEEDBACK_SUCCESS,
    data: result
  })
}

export const getNotificationController = async (req: Request, res: Response, next: NextFunction) => {
  const { limit, page } = req.query
  const result = await adminService.getNotification(limit as string, page as string)
  res.status(HTTP_STATUS.OK).json({
    message: ADMIN_MESSAGES.NOTIFICATION_SUCCESS,
    data: result
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
