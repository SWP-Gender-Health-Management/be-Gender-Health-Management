import { Router } from 'express'
import passport from 'passport'
// import { accessTokenAuth } from '~/config/passport.config'
import {
  changePasswordController,
  loginController,
  registerController,
  sendEmailVerifiedController,
  updateProfileController,
  verifyEmailController
} from '~/controllers/account.controller'
import {
  validateAccessToken,
  validateChangePassword,
  validateLogin,
  validateRegister,
  validateUpdateProfile,
  validateVerifyEmail
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
accountRoute.post('/verify-email', validateAccessToken, validateVerifyEmail, wrapRequestHandler(verifyEmailController))

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
accountRoute.post('/update-profile', validateUpdateProfile, wrapRequestHandler(updateProfileController))

export default accountRoute
