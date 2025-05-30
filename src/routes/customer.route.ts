import { Router } from 'express'
import {
  createNotificationController,
  predictPeriodController,
  trackPeriodController,
  updateMenstrualCycleController
} from '~/controllers/customer.controller'
import { validateAccessToken } from '~/middlewares/account.middleware'
import { validateTrackPeriod, validateUpdateMenstrualCycle } from '~/middlewares/customer.middleware'
import wrapRequestHandler from '~/utils/handle'

const customerRoute = Router()

// theo dõi chu kì kinh nguyệt
/*
  Description: nhập thông tin chu kì kinh nguyệt
  Path: /customer/track-period
  Method: POST
  Body: {
    period: number
    start_date: string
    end_date: string
  }
*/
customerRoute.post('/track-period', validateAccessToken, validateTrackPeriod, wrapRequestHandler(trackPeriodController))

/*
  Description: xem dự đoán chu kì kinh nguyệt
  Path: /customer/predict-period
  Method: GET
  Query: {
    account_id: string
  }
*/
customerRoute.get('/predict-period', validateAccessToken, wrapRequestHandler(predictPeriodController))

/*
  Description: cập nhật thông tin chu kì kinh nguyệt
  Path: /customer/update-menstrual-cycle
  Method: PUT
  Body: {
    start_date: string
    end_date: string
    note: string
    period: number
  }
*/
customerRoute.put(
  '/update-menstrual-cycle',
  validateAccessToken,
  validateUpdateMenstrualCycle,
  wrapRequestHandler(updateMenstrualCycleController)
)

/*
  Description: tạo thông báo
  Path: /customer/create-notification
  Method: POST
  Body: {
    access_token: string
  }
*/
customerRoute.post('/create-notification', validateAccessToken, wrapRequestHandler(createNotificationController))

export default customerRoute
