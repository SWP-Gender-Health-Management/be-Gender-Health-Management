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
      isInt: true,
      notEmpty: true,
      errorMessage: TRANSACTION_MESSAGES.AMOUNT_INVALID
    },
    method: {
      isString: true,
      notEmpty: true,
      errorMessage: TRANSACTION_MESSAGES.METHOD_INVALID
    },
    date: {
      isString: true,
      notEmpty: true,
      errorMessage: TRANSACTION_MESSAGES.DATE_INVALID
    },
    description: {
      isString: true,
      notEmpty: true,
      errorMessage: TRANSACTION_MESSAGES.DESCRIPTION_INVALID
    },
    account_id: {
      isUUID: true,
      notEmpty: true,
      errorMessage: TRANSACTION_MESSAGES.ACCOUNT_ID_INVALID
    }
  })
)
