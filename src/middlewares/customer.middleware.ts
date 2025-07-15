import { checkSchema } from 'express-validator'
import { CUSTOMER_MESSAGES } from '../constants/message.js'
import { validate } from '../utils/validations.js'

export const validateTrackPeriod = validate(
  checkSchema({
    start_date: {
      isString: {
        errorMessage: CUSTOMER_MESSAGES.START_DATE_INVALID
      },
      // errorMessage: CUSTOMER_MESSAGES.START_DATE_INVALID,
      custom: {
        options: (value, { req }) => {
          const startDate = new Date(value)
          console.log(startDate)
          const endDate = new Date(req.body.end_date)
          console.log(endDate)
          if (startDate > endDate) {
            throw new Error(CUSTOMER_MESSAGES.START_DATE_GREATER_THAN_END_DATE)
          }
          return true
        }
      }
    },
    end_date: {
      isString: {
        errorMessage: CUSTOMER_MESSAGES.END_DATE_INVALID
      },
      // errorMessage: CUSTOMER_MESSAGES.END_DATE_INVALID,
      custom: {
        options: (value) => {
          const endDate = new Date(value)
          const currentDate = new Date()
          if (endDate > currentDate) {
            throw new Error(CUSTOMER_MESSAGES.END_DATE_INVALID)
          }
          return true
        }
      }
    },
    period: {
      isString: true,
      errorMessage: CUSTOMER_MESSAGES.PERIOD_INVALID,
      custom: {
        options: (value) => {
          if (value === '') {
            return true
          }
          const period = parseInt(value)
          if (period < 0 || isNaN(period)) {
            throw new Error(CUSTOMER_MESSAGES.PERIOD_INVALID)
          }
          return true
        }
      },
      notEmpty: false
    },
    note: {
      isString: true,
      errorMessage: CUSTOMER_MESSAGES.NOTE_INVALID,
      notEmpty: false
    }
  })
)

export const validateUpdateMenstrualCycle = validate(
  checkSchema({
    start_date: {
      isDate: true,
      errorMessage: CUSTOMER_MESSAGES.START_DATE_INVALID,
      notEmpty: false,
      custom: {
        options: (value, { req }) => {
          const startDate = new Date(value)
          const endDate = new Date(req.body.end_date)
          if (startDate > endDate) {
            throw new Error(CUSTOMER_MESSAGES.START_DATE_GREATER_THAN_END_DATE)
          }
          return true
        }
      }
    },
    end_date: {
      isDate: true,
      errorMessage: CUSTOMER_MESSAGES.END_DATE_INVALID,
      notEmpty: true
    },
    note: {
      isString: true,
      errorMessage: CUSTOMER_MESSAGES.NOTE_INVALID,
      notEmpty: false
    }
  })
)

export const validateCreateLaborarityAppointment = validate(
  checkSchema({
    account_id: {
      isString: true,
      isUUID: true,
      trim: true,
      notEmpty: true,
      errorMessage: CUSTOMER_MESSAGES.ACCOUNT_ID_INVALID
    },
    slot_id: {
      isString: true,
      isUUID: true,
      trim: true,
      notEmpty: true,
      errorMessage: CUSTOMER_MESSAGES.SLOT_ID_INVALID
    },
    date: {
      isString: true,
      trim: true,
      notEmpty: true,
      errorMessage: CUSTOMER_MESSAGES.DATE_INVALID
    },
    lab_id: {
      isArray: true,
      notEmpty: true,
      errorMessage: CUSTOMER_MESSAGES.LABORARITY_ID_INVALID,
      custom: {
        options: (value) => {
          if (!Array.isArray(value)) {
            throw new Error(CUSTOMER_MESSAGES.LABORARITY_ID_INVALID)
          }

          for (const id of value) {
            if (typeof id !== 'string' || id.trim() === '') {
              throw new Error(CUSTOMER_MESSAGES.LABORARITY_ID_INVALID)
            }
          }
          return true
        }
      }
    }
  })
)
