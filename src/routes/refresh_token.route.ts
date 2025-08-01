import { Router } from 'express'
import { refreshTokenController } from '~/controllers/refresh_token.controller.js'
import wrapRequestHandler from '~/utils/handle.js'

const refreshTokenRoute = Router()

refreshTokenRoute.post('/create-access-token', wrapRequestHandler(refreshTokenController))

export default refreshTokenRoute
