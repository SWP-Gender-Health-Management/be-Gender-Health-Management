import { checkSchema } from 'express-validator'
import { CONSULTANT_PATTERNS_MESSAGES } from '../constants/message.js'
import { validate } from '../utils/validations.js'
import { validate as uuidValidate } from 'uuid'

// Validation middleware for creating/updating consultant pattern
export const validateAddConsultantPattern = validate(
  checkSchema({
    slot_id: {
      isArray: true,
      notEmpty: true,
      errorMessage: CONSULTANT_PATTERNS_MESSAGES.WORKING_SLOT_ID_INVALID,
      custom: {
        options: async (value) => {
          for (const slotId of value) {
            if (typeof slotId !== 'string' || !uuidValidate(slotId)) {
              throw new Error(CONSULTANT_PATTERNS_MESSAGES.WORKING_SLOT_ID_INVALID)
            }
          }
          return true
        }
      }
    },
    consultant_id: {
      isUUID: {
        errorMessage: CONSULTANT_PATTERNS_MESSAGES.CONSULTANT_ID_INVALID
      }
    },
    date: {
      isDate: {
        errorMessage: CONSULTANT_PATTERNS_MESSAGES.DATE_INVALID
      }
    }
  })
)
