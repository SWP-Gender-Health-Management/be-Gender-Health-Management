import { checkSchema } from 'express-validator'
import redisClient from '../config/redis.config.js'
import HTTP_STATUS from '../constants/httpStatus.js'
import { USERS_MESSAGES } from '../constants/message.js'
import { Role } from '../enum/role.enum.js'
import { ErrorWithStatus } from '../models/Error.js'
import accountService from '../services/account.service.js'
import { verifyToken } from '../utils/jwt.js'
import { validate } from '../utils/validations.js'

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
          console.log('Email:', user)
          console.log('Password:', isPasswordValid)
          if (!user || !isPasswordValid) {
            throw new ErrorWithStatus({
              message: USERS_MESSAGES.EMAIL_OR_PASSWORD_INVALID,
              status: HTTP_STATUS.BAD_REQUEST
            })
          }
          await redisClient.set(`account:${user.account_id}`, JSON.stringify(user), 'EX', 60 * 60)
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

          // req.body.email = decoded.email
          // req.body.account_id = decoded.account_id

          req.body = {
            ...req.body,
            email: decoded.email,
            account_id: decoded.account_id
          }

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
            throw new ErrorWithStatus({
              message: USERS_MESSAGES.PASSWORD_INVALID_OLD,
              status: HTTP_STATUS.BAD_REQUEST
            })
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

export const validateEmail = validate(
  checkSchema({
    email: {
      isString: true,
      trim: true,
      notEmpty: true,
      errorMessage: USERS_MESSAGES.EMAIL_NOT_EXIST,
      custom: {
        options: async (value, { req }) => {
          const account = await accountService.checkEmailExist(value)
          if (!account) {
            throw new ErrorWithStatus({
              message: USERS_MESSAGES.EMAIL_NOT_EXIST,
              status: HTTP_STATUS.BAD_REQUEST
            })
          }
          req.body.account = account
          return true
        }
      }
    }
  })
)

export const validatePassCode = validate(
  checkSchema({
    email: {
      isString: true,
      trim: true,
      notEmpty: true,
      errorMessage: USERS_MESSAGES.EMAIL_NOT_EXIST,
      custom: {
        options: async (value, { req }) => {
          const user = await accountService.checkEmailExist(value)
          if (!user) {
            throw new ErrorWithStatus({
              message: USERS_MESSAGES.EMAIL_NOT_EXIST,
              status: HTTP_STATUS.BAD_REQUEST
            })
          }
          req.body.account = user
          return true
        }
      }
    },
    passcode: {
      isString: true,
      trim: true,
      isLength: {
        options: { min: 6, max: 6 },
        errorMessage: USERS_MESSAGES.SECRET_PASSCODE_MUST_BE_6_CHARACTERS
      }
    }
  })
)

export const validateResetPassword = validate(
  checkSchema({
    email: {
      isString: true,
      trim: true,
      notEmpty: true,
      errorMessage: USERS_MESSAGES.EMAIL_NOT_EXIST,
      custom: {
        options: async (value, { req }) => {
          const user = await accountService.checkEmailExist(value)
          if (!user) {
            throw new ErrorWithStatus({
              message: USERS_MESSAGES.EMAIL_NOT_EXIST,
              status: HTTP_STATUS.BAD_REQUEST
            })
          }
          req.body.account = user
          return true
        }
      }
    },
    newPassword: {
      isLength: {
        options: { min: 6 },
        errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_AT_LEAST_6_CHARACTERS
      },
      isString: true,
      trim: true,
      custom: {
        options: async (value, { req }) => {
          console.log('value:', value)
          console.log('req.body.confirmPassword:', req.body.confirmPassword)
          if (value !== req.body.confirmPassword) {
            throw new Error(USERS_MESSAGES.NEW_PASSWORD_MUST_BE_DIFFERENT)
          }
          return true
        }
      }
    },
    confirmPassword: {
      isString: true,
      trim: true,
      notEmpty: true,
      errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_MATCH
    }
  })
)

export const validateUpdateAccount = validate(
  checkSchema({
    full_name: {
      notEmpty: false,
      isString: true,
      trim: true,
      isLength: {
        options: { min: 6, max: 100 },
        errorMessage: USERS_MESSAGES.FULL_NAME_INVALID
      }
    },
    phone: {
      notEmpty: false,
      isString: true,
      trim: true,
      isLength: {
        options: { min: 10, max: 10 },
        errorMessage: USERS_MESSAGES.PHONE_INVALID
      }
    },
    dob: {
      notEmpty: false,
      isString: true,
      errorMessage: USERS_MESSAGES.DOB_INVALID,
      custom: {
        options: (value) => {
          const dob = new Date(value)
          const currentDate = new Date()
          if (dob > currentDate) {
            throw new Error(USERS_MESSAGES.DOB_INVALID)
          }
          value = dob
          return true
        }
      }
    },
    gender: {
      notEmpty: false,
      isString: true,
      trim: true,
      errorMessage: USERS_MESSAGES.GENDER_INVALID
    },
    address: {
      notEmpty: false,
      isString: true,
      trim: true,
      errorMessage: USERS_MESSAGES.ADDRESS_INVALID
    },
    description: {
      notEmpty: false,
      isString: true,
      trim: true,
      errorMessage: USERS_MESSAGES.DESCRIPTION_INVALID
    }
  })
)

export const restrictTo = (...allowedRoles: Role[]) => {
  return validate(
    checkSchema({
      Authorization: {
        isString: true,
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            // Extract token from Authorization header
            const token = value.split(' ')[1]
            console.log('Token:', token)
            if (!token) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.ACCESS_TOKEN_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }

            // Verify token and decode payload
            const decoded = await verifyToken({ token, secretKey: process.env.JWT_SECRET_ACCESS_TOKEN as string })
            console.log(decoded)

            // Store user info in request body
            // req.body.email = decoded.email
            // req.body.account_id = decoded.account_id
            req.body = {
              ...req.body,
              email: decoded.email,
              account_id: decoded.account_id
            }

            // Check if user exists and get their role
            const user = await accountService.getAccountById(decoded.account_id)
            if (!user) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.USER_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }

            // Check if user's role is in allowed roles
            if (!allowedRoles.includes(user.role)) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.PERMISSION_DENIED,
                status: HTTP_STATUS.FORBIDDEN
              })
            }

            // Store user role in request for further use
            // req.body.role = user.role
            // req.body = {
            //   ...req.body,
            //   role: user.role
            // }
            return true
          }
        }
      }
    })
  )
}
