import { checkSchema } from 'express-validator'
import { LABORARITY_MESSAGES } from '../constants/message.js'
import { validate } from '../utils/validations.js'

// Validation middleware for creating/updating laboratory
export const validateLaboratoryInput = validate(
  checkSchema({
    name: {
      isString: true,
      trim: true,
      isLength: {
        options: { min: 1, max: 1000 },
        errorMessage: LABORARITY_MESSAGES.LABORATORY_NAME_INVALID
      }
    },
    description: {
      isString: true,
      trim: true,
      notEmpty: {
        errorMessage: LABORARITY_MESSAGES.LABORATORY_DESCRIPTION_REQUIRED
      }
    },
    price: {
      isFloat: {
        options: { min: 0 },
        errorMessage: LABORARITY_MESSAGES.LABORATORY_PRICE_INVALID
      }
    }
  })
)
