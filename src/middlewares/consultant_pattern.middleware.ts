import { checkSchema } from 'express-validator'
import { CONSULTANT_PATTERNS_MESSAGES } from '../constants/message.js'
import { validate } from '../utils/validations.js'

// Validation middleware for creating/updating consultant pattern
export const validateConsultantPatternInput = validate(
  checkSchema({
    slot_id: {
      isUUID: {
        errorMessage: CONSULTANT_PATTERNS_MESSAGES.WORKING_SLOT_ID_INVALID
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
    },
    is_booked: {
      isBoolean: {
        errorMessage: CONSULTANT_PATTERNS_MESSAGES.IS_BOOKED_INVALID,
        bail: true
      },
      optional: true
    }
  })
)
