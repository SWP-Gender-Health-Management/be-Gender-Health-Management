import { Router } from 'express'
import { refreshTokenController } from '~/controllers/refresh_token.controller.js'

const refreshTokenRoute = Router()

refreshTokenRoute.post('/refresh-token', refreshTokenController)

export default refreshTokenRoute
