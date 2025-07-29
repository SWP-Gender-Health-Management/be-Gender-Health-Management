import { NextFunction, Request, Response } from 'express'
import notificationService from '~/services/notification.service.js'

export const getNotiByIdController = async (req: Request, res: Response, next: NextFunction) => {
  const { account_id } = req.body
  const notification = await notificationService.getNotification(account_id)
  res.json(notification)
}
