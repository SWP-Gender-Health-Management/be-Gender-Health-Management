import { Router } from 'express'
import {
  createLaborarityAppointmentController,
  createNotificationController,
  getCustomerController,
  predictPeriodController,
  trackPeriodController,
  updateMenstrualCycleController
} from '../controllers/customer.controller.js'
import { validateAccessToken } from '../middlewares/account.middleware.js'
import {
  validateCreateLaborarityAppointment,
  validateTrackPeriod,
  validateUpdateMenstrualCycle
} from '../middlewares/customer.middleware.js'
import wrapRequestHandler from '../utils/handle.js'

const customerRoute = Router()
//customer
customerRoute.get('/get-customer', wrapRequestHandler(getCustomerController))
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

/*
  description: đăng kí lịch xét nghiệm
  Path: /customer/register-laborarity-appointment
  Method: POST
  Body: {
    access_token: string
    laborarity_id: string
    slot_id: string
    date: string
  }
*/

// xét nghiệm
/*
  description: tạo lịch xét nghiệm
  Path: /customer/create-laborarity-appointment
  Method: POST
  Header: {
    access_token: string
  }
  Body: {
    laborarity_id: string
    slot_id: string
    date: string
  }
*/

customerRoute.post(
  '/create-laborarity-appointment',
  validateAccessToken,
  validateCreateLaborarityAppointment,
  wrapRequestHandler(createLaborarityAppointmentController)
)
export default customerRoute
