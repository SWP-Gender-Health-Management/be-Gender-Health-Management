import { validate } from '~/utils/validations'
import { checkSchema } from 'express-validator'
import { LABORARITY_MESSAGES } from '~/constants/message'
export const validateAddLaborarity = validate(
  checkSchema({
    name: {
      isString: true,
      trim: true,
      notEmpty: true,
      errorMessage: LABORARITY_MESSAGES.NAME_REQUIRED
    },
    specimen: {
      isString: true,
      trim: true,
      notEmpty: true,
      errorMessage: LABORARITY_MESSAGES.SPECIMEN_REQUIRED
    },
    description: {
      isString: true,
      trim: true,
      notEmpty: true,
      errorMessage: LABORARITY_MESSAGES.DESCRIPTION_REQUIRED
    },
    price: {
      isFloat: true,
      notEmpty: true,
      errorMessage: LABORARITY_MESSAGES.PRICE_REQUIRED
    }
  })
)
