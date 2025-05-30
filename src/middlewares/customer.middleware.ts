import { checkSchema } from 'express-validator'
import { max, min } from 'lodash'
import { CUSTOMER_MESSAGES, USERS_MESSAGES } from '~/constants/message'
import { validate } from '~/utils/validations'

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
