import { checkSchema } from 'express-validator'

export const validateId = checkSchema({
  id: {
    isUUID: true,
    errorMessage: 'Invalid ID'
  }
})
