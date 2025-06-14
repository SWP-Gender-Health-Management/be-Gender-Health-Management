import { Router } from 'express'
// import { accessTokenAuth } from '~/config/passport.config'
import {
  changePasswordController,
  checkEmailVerifiedController,
  loginController,
  logoutController,
  registerController,
  sendEmailVerifiedController,
  sendPasscodeResetPasswordController,
  updateAccountController,
  verifyEmailController,
  viewAccountController
} from '~/controllers/account.controller.js'
import {
  validateAccessToken,
  validateChangePassword,
  validateEmail,
  validateLogin,
  validatePassCode,
  validateRegister,
  validateUpdateAccount
} from '../middlewares/account.middleware.js'
import wrapRequestHandler from '~/utils/handle.js'

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
  Description: send passcode to email to reset password
  Path: /send-passcode-reset-password
  Method: POST
  Body: {
    email: string
  }
*/
accountRoute.post(
  '/send-passcode-reset-password',
  validateEmail,
  wrapRequestHandler(sendPasscodeResetPasswordController)
)

/*
  Description: verify passcode to reset password
  Path: /verify-passcode-reset-password
  Method: POST
  Body: {
    secretPasscode: string
  }
*/
// accountRoute.post('/verify-passcode-reset-password', wrapRequestHandler(verifyPasscodeResetPasswordController))

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

export default accountRoute
