import { checkSchema } from 'express-validator'
import { ADMIN_MESSAGES } from '../constants/message.js'
import accountService from '../services/account.service.js'
import { validate } from '../utils/validations.js'

export const validateCreateAccount = validate(
  checkSchema({
    full_name: {
      isString: true,
      trim: true,
      notEmpty: true,
      isLength: {
        options: { min: 1, max: 100 }
      },
      errorMessage: ADMIN_MESSAGES.FULL_NAME_REQUIRED
    },
    email: {
      isEmail: true,
      trim: true,
      notEmpty: true,
      isLength: {
        options: { min: 1, max: 100 }
      },
      custom: {
        options: async (email) => {
          const account = await accountService.checkEmailExist(email)
          if (account) {
            throw new Error(ADMIN_MESSAGES.EMAIL_ALREADY_EXISTS)
          }
        }
      },
      errorMessage: ADMIN_MESSAGES.EMAIL_REQUIRED
    },
    password: {
      isString: true,
      trim: true,
      notEmpty: true,
      isLength: {
        options: { min: 1, max: 100 }
      },
      isStrongPassword: {
        options: {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        }
      },
      errorMessage: ADMIN_MESSAGES.PASSWORD_REQUIRED
    }
  })
)
