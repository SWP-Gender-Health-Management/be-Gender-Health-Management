import { Router } from 'express'
import { getNotiByIdController } from '~/controllers/notification.controller.js'
import { restrictTo } from '~/middlewares/account.middleware.js'
import wrapRequestHandler from '~/utils/handle.js'
import { Role } from '~/enum/role.enum.js'

const notiRoute = Router()

notiRoute.get('/get-notification', restrictTo(Role.CUSTOMER), wrapRequestHandler(getNotiByIdController))

export default notiRoute
