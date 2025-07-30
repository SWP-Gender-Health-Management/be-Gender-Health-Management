import { Router } from 'express'
import { getNotiByIdController, readAllNotiController } from '~/controllers/notification.controller.js'
import { validateAccessToken } from '~/middlewares/account.middleware.js'
import wrapRequestHandler from '~/utils/handle.js'

const notiRoute = Router()

notiRoute.get('/get-notification', validateAccessToken, wrapRequestHandler(getNotiByIdController))

notiRoute.put('/read-all', validateAccessToken, wrapRequestHandler(readAllNotiController))

export default notiRoute
