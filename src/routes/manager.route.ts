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
  getMensOverallController,
  getMensAgePercentController,
  getMensPeriodPercentController,
  getBlogsController,
  getQuestionsController,
  getRefundInfoByAppId,
  refundLabAppointment,
  setBlogStatusController,
  setQuestionStatusController,
  getConsultantPatternByWeekController,
  createConsultantPatternController,
  getStaffPatternByWeekController,
  createStaffPatternController
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
managerRoute.get(
  '/get-lab-app', 
  restrictTo(Role.MANAGER), 
  wrapRequestHandler(getLabAppController)
)

// thống kê người đăng kí quản lý chu kì kinh nguyệt
/*
  description: get-mens-overall
  path: /manager/get-mens-overall
  method: GET
  access: private
*/
managerRoute.get('/get-mens-overall', restrictTo(Role.MANAGER), wrapRequestHandler(getMensOverallController))

/*
  description: get-mens-age-percent
  path: /manager/get-mens-age-percent
  method: GET
  access: private
*/
managerRoute.get('/get-mens-age-percent', restrictTo(Role.MANAGER), wrapRequestHandler(getMensAgePercentController))

/*
  description: get-mens-period-percent
  path: /manager/get-mens-period-percent
  method: GET
  access: private
*/
managerRoute.get(
  '/get-mens-period-percent',
  restrictTo(Role.MANAGER),
  wrapRequestHandler(getMensPeriodPercentController)
)

/*
  description: get-blogs
  path: /manager/get-blogs
  method: GET
  access: private
*/
managerRoute.get('/get-blogs', restrictTo(Role.MANAGER), wrapRequestHandler(getBlogsController))

/*
  description: get-questions
  path: /manager/get-questions
  method: GET
  access: private
*/
managerRoute.get('/get-questions', restrictTo(Role.MANAGER), wrapRequestHandler(getQuestionsController))

managerRoute.get(
  '/get-refund-info/:app_id',
  restrictTo(Role.CUSTOMER, Role.ADMIN, Role.MANAGER),
  wrapRequestHandler(getRefundInfoByAppId)
)

managerRoute.put(
  '/refund/:app_id',
  restrictTo(Role.CUSTOMER, Role.ADMIN, Role.MANAGER),
  wrapRequestHandler(refundLabAppointment)
)

managerRoute.put('/set-blog-status', restrictTo(Role.MANAGER), wrapRequestHandler(setBlogStatusController))

managerRoute.put('/set-question-status', restrictTo(Role.MANAGER), wrapRequestHandler(setQuestionStatusController))

managerRoute.get('/get-consultant-pattern-by-week', restrictTo(Role.MANAGER), wrapRequestHandler(getConsultantPatternByWeekController))

managerRoute.post('/create-consultant-pattern', restrictTo(Role.MANAGER), wrapRequestHandler(createConsultantPatternController))

managerRoute.get('/get-staff-pattern-by-week', restrictTo(Role.MANAGER), wrapRequestHandler(getStaffPatternByWeekController))

managerRoute.post('/create-staff-pattern', restrictTo(Role.MANAGER), wrapRequestHandler(createStaffPatternController))

export default managerRoute
