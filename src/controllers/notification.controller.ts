import { NextFunction, Request, Response } from 'express'
import notificationService from '~/services/notification.service.js'

export const getNotiByIdController = async (req: Request, res: Response, next: NextFunction) => {
  const { account_id } = req.body
  const { skip, limit } = req.query
  const { noti, total } = await notificationService.getNotification(account_id, skip as string, limit as string)
  res.json({ noti, total })
}

export const readAllNotiController = async (req: Request, res: Response, next: NextFunction) => {
  const { account_id } = req.body
  const notification = await notificationService.readAllNoti(account_id)
  res.json(notification)
}
