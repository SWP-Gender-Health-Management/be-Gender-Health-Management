import { checkSchema } from 'express-validator'
import { TRANSACTION_MESSAGES } from '~/constants/message.js'
import { validate } from '~/utils/validations.js'

export const validateCreateTransaction = validate(
  checkSchema({
    app_id: {
      isUUID: true,
      notEmpty: true,
      errorMessage: TRANSACTION_MESSAGES.APP_ID_INVALID
    },
    amount: {
      isString: true,
      notEmpty: true,
      errorMessage: TRANSACTION_MESSAGES.AMOUNT_INVALID
    },
    description: {
      notEmpty: false,
      errorMessage: TRANSACTION_MESSAGES.DESCRIPTION_INVALID
    },
    date: {
      isDate: true,
      notEmpty: true,
      errorMessage: TRANSACTION_MESSAGES.DATE_INVALID
    }
  })
)
