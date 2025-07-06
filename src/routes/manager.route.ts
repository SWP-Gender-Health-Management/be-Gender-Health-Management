import { Router } from 'express'
import { Role } from '~/enum/role.enum.js'
import { restrictTo } from '~/middlewares/account.middleware.js'
import wrapRequestHandler from '~/utils/handle.js'
import {
  getAppPercentController,
  getOverallController,
  getOverallWeeklyController,
  getRecentAppController,
  getConsultantsController,
  getStaffsController,
  getConAppController,
  getLabAppController,
  getMensOverallController
} from '~/controllers/manager.controller.js'

const managerRoute = Router()

/*
  description: get-overall
  path: /manager/get-overall
  method: GET
  access: private
*/
managerRoute.get('/get-overall', restrictTo(Role.MANAGER), wrapRequestHandler(getOverallController))

/*
  description: get-overall-weekly
  path: /manager/get-overall-weekly
  method: GET
  access: private
*/
managerRoute.get('/get-overall-weekly', restrictTo(Role.MANAGER), wrapRequestHandler(getOverallWeeklyController))

/*
  description: get-app-percent
  path: /manager/get-app-percent
  method: GET
  access: private
*/
managerRoute.get('/get-app-percent', restrictTo(Role.MANAGER), wrapRequestHandler(getAppPercentController))

/*
  description: get-recent-app
  path: /manager/get-recent-app
  method: GET
  access: private
*/
managerRoute.get('/get-recent-app', restrictTo(Role.MANAGER), wrapRequestHandler(getRecentAppController))

/*
  description: get-consultants
  path: /manager/get-consultants
  method: GET
  access: private
*/
managerRoute.get('/get-consultants', restrictTo(Role.MANAGER), wrapRequestHandler(getConsultantsController))

/*
  description: get-staffs
  path: /manager/get-staffs
  method: GET
  access: private
*/
managerRoute.get('/get-staffs', restrictTo(Role.MANAGER), wrapRequestHandler(getStaffsController))

/*
  description: get-con-app
  path: /manager/get-con-app
  method: GET
  access: private
*/
managerRoute.get('/get-con-app', restrictTo(Role.MANAGER), wrapRequestHandler(getConAppController))

/*
  description: get-lab-app
  path: /manager/get-lab-app
  method: GET
  access: private
*/
managerRoute.get('/get-lab-app', restrictTo(Role.MANAGER), wrapRequestHandler(getLabAppController))

// thống kê người đăng kí quản lý chu kì kinh nguyệt
/*
  description: get-mens-overall
  path: /manager/get-mens-overall
  method: GET
  access: private
*/
managerRoute.get('/get-mens-overall', restrictTo(Role.MANAGER), wrapRequestHandler(getMensOverallController))

export default managerRoute
