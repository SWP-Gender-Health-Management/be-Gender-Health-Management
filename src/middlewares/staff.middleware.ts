import { checkSchema } from 'express-validator'
import { LABORARITY_MESSAGES, RESULT_MESSAGES, USERS_MESSAGES } from '../constants/message.js'
import { verifyToken } from '../utils/jwt.js'
import { config } from 'dotenv'
config()

export const validateStaff = checkSchema({
  authorization: {
    in: 'headers',
    isString: true,
    notEmpty: true,
    custom: {
      options: async (value, { req }) => {
        const token = value.split(' ')[1]
        const decoded = await verifyToken(token)
        if (!decoded) {
          return false
        }
        if (decoded.role !== 'staff') {
          return false
        }
        req.body.staff_id = decoded.id
        req.body.staff_email = decoded.email
        return true
      }
    },
    errorMessage: USERS_MESSAGES.AUTHORIZATION_INVALID
  }
})

export const validateUpdateResult = checkSchema({
  app_id: {
    in: 'body',
    isUUID: true,
    notEmpty: true,
    errorMessage: RESULT_MESSAGES.APP_ID_INVALID
  },
  result: {
    in: 'body',
    isArray: true,
    notEmpty: true,
    custom: {
      options: (value) => {
        for (const item of value) {
          if (item.result < 0 || item.result > 100) {
            return false
          }
        }
        return true
      }
    },
    errorMessage: RESULT_MESSAGES.RESULT_INVALID
  }
})

export const validateUpdateAppointmentStatus = checkSchema({
  app_id: {
    in: 'body',
    isUUID: true,
    notEmpty: true,
    errorMessage: LABORARITY_MESSAGES.APPOINTMENT_ID_INVALID
  },
  status: {
    in: 'body',
    // isInt: true,
    isString: true,
    notEmpty: true,
    custom: {
      options: (value) => {
        if (value < 0 || value > 5) {
          return false
        }
        return true
      }
    },
    errorMessage: LABORARITY_MESSAGES.STATUS_INVALID
  }
})
