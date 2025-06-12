import { Router } from 'express'
// import { accessTokenAuth } from '~/config/passport.config'
import {
  changePasswordController,
  checkEmailVerifiedController,
  loginController,
  logoutController,
  registerController,
  sendEmailVerifiedController,
  updateAccountController,
  verifyEmailController,
  viewAccountController,
  getAccountFromRedis
} from '~/controllers/account.controller'
import {
  validateAccessToken,
  validateChangePassword,
  validateLogin,
  validatePassCode,
  validateRegister,
  validateUpdateAccount
} from '~/middlewares/account.middleware'
import wrapRequestHandler from '~/utils/handle'

const accountRoute = Router()

/*
  Description: register a new account
  Path: /register
  Method: POST
  Body: {
    email: string
    password: string
    confirmPassword: string
  }
*/
accountRoute.post('/register', validateRegister, wrapRequestHandler(registerController))

/*
  Description: login to the account
  Path: /login
  Method: POST
  Body: {
    email: string
    password: string
  }
*/
accountRoute.post('/login', validateLogin, wrapRequestHandler(loginController))

/*
  Description: change password
  Path: /change-password
  Method: POST
  Body: {
    email: string
    password: string 
    new_password: string
  }
*/
accountRoute.post(
  '/change-password',
  validateAccessToken,
  validateChangePassword,
  wrapRequestHandler(changePasswordController)
)

/*
  Description: verify email
  Path: /verify-email
  Method: POST
  Body: {
    email: string
    secretPasscode: string
  }
*/
accountRoute.post('/verify-email', validateAccessToken, validatePassCode, wrapRequestHandler(verifyEmailController))

/*
  Description: send email verified
  Path: /send-email-verified
  Method: POST
  Body: {
    account_id: string
  }
*/
accountRoute.post('/send-email-verified', validateAccessToken, wrapRequestHandler(sendEmailVerifiedController))

/*
  Description: update-profile
  Path: /update-profile
  Method: POST
  Body: {
  full_name: string
  phone: string
  dob: Date
  gender: string
  }
*/
accountRoute.post(
  '/update-profile',
  validateAccessToken,
  validateUpdateAccount,
  wrapRequestHandler(updateAccountController)
)

/*
  check email verified
  Path: /check-email-verified
  Method: POST
  Body: {
    email: string
  }
*/
accountRoute.post('/check-email-verified', validateAccessToken, wrapRequestHandler(checkEmailVerifiedController))

/*
  view account
  Path: /view-account
  Method: POST
  Body: {
    account_id: string
  }
*/
accountRoute.post('/view-account', validateAccessToken, wrapRequestHandler(viewAccountController))

/*
  Description: logout
  Path: /logout
  Method: POST
*/
accountRoute.post('/logout', validateAccessToken, wrapRequestHandler(logoutController))

accountRoute.get('/get-account-from-redis',validateAccessToken, wrapRequestHandler(getAccountFromRedis))

export default accountRoute
