import { ErrorWithStatus } from '~/models/Error'
import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validations'
import { LABORATORIES_MESSAGES } from "~/constants/message";

// Validation middleware for creating/updating laboratory
  export const validateLaboratoryInput = validate(
    checkSchema({
      name: {
        isString: true,
        trim: true,
        isLength: {
          options: { min: 1, max: 1000 },
          errorMessage: LABORATORIES_MESSAGES.LABORATORY_NAME_INVALID
        }
      },
      description: {
        isString: true,
        trim: true,
        notEmpty: {
          errorMessage: LABORATORIES_MESSAGES.LABORATORY_DESCRIPTION_REQUIRED
        }
      },
      price: {
        isFloat: {
          options: { min: 0 },
          errorMessage: LABORATORIES_MESSAGES.LABORATORY_PRICE_INVALID
        }
      }
    })
  )