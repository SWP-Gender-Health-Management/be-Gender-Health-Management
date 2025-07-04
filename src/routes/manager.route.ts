import { Router } from 'express'
import { Role } from '~/enum/role.enum.js'
import { restrictTo } from '~/middlewares/account.middleware.js'
import wrapRequestHandler from '~/utils/handle.js'
import { getOverallController, getOverallWeeklyController } from '~/controllers/manager.controller.js'

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

export default managerRoute
