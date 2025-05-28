import { checkSchema } from 'express-validator'
import redisClient from '~/config/redis.config'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/message'
import { ErrorWithStatus } from '~/models/Error'
import accountService from '~/services/account.service'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validations'

export const validateRegister = validate(
  checkSchema({
    email: {
      isEmail: {
        errorMessage: 'Email must be a valid email address'
      },
      custom: {
        options: async (value, { req }) => {
          const user = await accountService.checkEmailExist(value)
          if (user) {
            throw new ErrorWithStatus({
              message: USERS_MESSAGES.EMAIL_ALREADY_EXIST,
              status: HTTP_STATUS.BAD_REQUEST
            })
          }
          return true
        }
      }
    },
    password: {
      isLength: {
        options: { min: 6 },
        errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_AT_LEAST_6_CHARACTERS
      },
      isString: true,
      trim: true,
      isStrongPassword: {
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        },
        errorMessage: USERS_MESSAGES.PASSWORD_INVALID
      }
    },
    confirmPassword: {
      custom: {
        options: (value, { req }) => {
          if (value !== req.body.password) {
            throw new ErrorWithStatus({
              message: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_MATCH,
              status: HTTP_STATUS.BAD_REQUEST
            })
          }
          return true
        }
      }
    }
  })
)

export const validateLogin = validate(
  checkSchema({
    email: {
      isEmail: {
        errorMessage: 'Email must be a valid email address'
      },
      custom: {
        options: async (value, { req }) => {
          const [user, isPasswordValid] = await Promise.all([
            accountService.checkEmailExist(value),
            accountService.checkPassword(value, req.body.password)
          ])
          if (!user || !isPasswordValid) {
            throw new ErrorWithStatus({
              message: USERS_MESSAGES.EMAIL_OR_PASSWORD_INVALID,
              status: HTTP_STATUS.BAD_REQUEST
            })
          }
          await redisClient.set(user.account_id, JSON.stringify(user), 'EX', 60 * 60)
          req.body.account_id = user.account_id
          return true
        }
      }
    },
    password: {
      isLength: {
        options: { min: 6 },
        errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_AT_LEAST_6_CHARACTERS
      }
    }
  })
)

export const validateAccessToken = validate(
  checkSchema({
    Authorization: {
      isString: true,
      trim: true,
      custom: {
        options: async (value, { req }) => {
          const token = value.split(' ')[1]
          if (!token) {
            throw new ErrorWithStatus({
              message: USERS_MESSAGES.ACCESS_TOKEN_REQUIRED,
              status: HTTP_STATUS.UNAUTHORIZED
            })
          }
          const decoded = await verifyToken({ token, secretKey: process.env.JWT_SECRET_ACCESS_TOKEN as string })
          console.log(decoded)
          req.body.email = decoded.email
          req.body.account_id = decoded.account_id
          return true
        }
      }
    }
  })
)

export const validateChangePassword = validate(
  checkSchema({
    password: {
      isLength: {
        options: { min: 6 },
        errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_AT_LEAST_6_CHARACTERS
      },
      custom: {
        options: async (value, { req }) => {
          const isPasswordValid = await accountService.checkPassword(req.body.email, value)
          if (!isPasswordValid) {
            throw new Error(USERS_MESSAGES.PASSWORD_INVALID)
          }
          return true
        }
      }
    },
    new_password: {
      isLength: {
        options: { min: 6 },
        errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_AT_LEAST_6_CHARACTERS
      },
      isString: true,
      trim: true,
      custom: {
        options: async (value, { req }) => {
          if (value === req.body.password) {
            throw new Error(USERS_MESSAGES.NEW_PASSWORD_MUST_BE_DIFFERENT)
          }
          return true
        }
      }
    },
    confirm_new_password: {
      custom: {
        options: (value, { req }) => {
          if (value !== req.body.new_password) {
            throw new Error(USERS_MESSAGES.CONFIRM_PASSWORD_MUST_MATCH)
          }
          return true
        }
      }
    }
  })
)

export const validatePassCode = validate(
  checkSchema({
    secretPasscode: {
      isString: true,
      trim: true,
      isLength: {
        options: { min: 6, max: 6 },
        errorMessage: USERS_MESSAGES.SECRET_PASSCODE_MUST_BE_6_CHARACTERS
      }
    }
  })
)

export const validateUpdateAccount = validate(
  checkSchema({
    full_name: {
      isString: true,
      trim: true,
      isLength: {
        options: { min: 6, max: 100 },
        errorMessage: USERS_MESSAGES.FULL_NAME_INVALID
      }
    },
    phone: {
      isString: true,
      trim: true,
      isLength: {
        options: { min: 10, max: 10 },
        errorMessage: USERS_MESSAGES.PHONE_INVALID
      }
    },
    dob: {
      isDate: true,
      errorMessage: USERS_MESSAGES.DOB_INVALID
    },
    gender: {
      isString: true,
      trim: true,
      isLength: {
        options: { min: 1, max: 1 },
        errorMessage: USERS_MESSAGES.GENDER_INVALID
      }
    }
  })
)
