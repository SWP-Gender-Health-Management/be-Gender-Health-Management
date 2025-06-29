import { checkSchema } from 'express-validator'
import { STAFF_PATTERN_MESSAGES } from '../constants/message.js'
import { validate } from '../utils/validations.js'
import { validate as uuidValidate } from 'uuid'

export const validateAddStaffPattern = validate(
  checkSchema({
    account_id: {
      isUUID: {
        errorMessage: STAFF_PATTERN_MESSAGES.ACCOUNT_ID_INVALID
      },
      errorMessage: STAFF_PATTERN_MESSAGES.ACCOUNT_ID_INVALID
    },
    slot_id: {
      isArray: true,
      notEmpty: true,
      errorMessage: STAFF_PATTERN_MESSAGES.WORKING_SLOT_ID_INVALID,
      custom: {
        options: async (value) => {
          for (const slotId of value) {
            if (typeof slotId !== 'string' || !uuidValidate(slotId)) {
              throw new Error(STAFF_PATTERN_MESSAGES.WORKING_SLOT_ID_INVALID)
            }
          }
          return true
        }
      }
    },
    date: {
      isString: true,
      errorMessage: STAFF_PATTERN_MESSAGES.DATE_INVALID,
      custom: {
        options: async (value) => {
          const date = new Date(value)
          const currentDate = new Date()
          if (date <= currentDate) {
            throw new Error(STAFF_PATTERN_MESSAGES.DATE_INVALID)
          }
        }
      }
    }
  })
)

export const validateUpdateStaffPattern = validate(
  checkSchema({
    date: {
      isString: true,
      notEmpty: true,
      trim: true,
      errorMessage: STAFF_PATTERN_MESSAGES.DATE_INVALID
    },
    account_id: {
      isString: true,
      notEmpty: true,
      trim: true,
      errorMessage: STAFF_PATTERN_MESSAGES.ACCOUNT_ID_INVALID
    },
    slot_id: {
      // isString: true,
      // notEmpty: true,
      // trim: true,
      // errorMessage: STAFF_PATTERN_MESSAGES.WORKING_SLOT_ID_INVALID,
      custom: {
        options: async (value) => {
          console.log(value)
          return true
        }
      }
    }
  })
)
