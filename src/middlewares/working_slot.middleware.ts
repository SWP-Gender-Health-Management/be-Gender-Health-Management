import { Request, Response, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import { WORKING_SLOT_MESSAGES } from '~/constants/message.js'
import { validate } from '~/utils/validations.js'

export const validateSlot = validate(
  checkSchema({
    name: {
      isString: true,
      trim: true,
      notEmpty: true,
      isLength: {
        options: { min: 1, max: 255 },
        errorMessage: WORKING_SLOT_MESSAGES.NAME_INVALID
      }
    },
    start_at: {
      isString: true,
      trim: true,
      notEmpty: true,
      errorMessage: WORKING_SLOT_MESSAGES.START_AT_INVALID
    },
    end_at: {
      isString: true,
      trim: true,
      notEmpty: true,
      errorMessage: WORKING_SLOT_MESSAGES.END_AT_INVALID
    },
    type: {
      isString: true,
      notEmpty: true,
      errorMessage: WORKING_SLOT_MESSAGES.TYPE_INVALID
    }
  })
)

export const validateGetSlotByType = validate(
  checkSchema({
    type: {
      isString: true,
      notEmpty: true,
      errorMessage: WORKING_SLOT_MESSAGES.TYPE_INVALID
    }
  })
)
export const validateUpdateSlot = validate(
  checkSchema({
    name: {
      isString: true,
      trim: true,
      notEmpty: false,
      errorMessage: WORKING_SLOT_MESSAGES.NAME_INVALID
    },
    start_at: {
      isString: true,
      trim: true,
      notEmpty: false,
      errorMessage: WORKING_SLOT_MESSAGES.START_AT_INVALID
    },
    end_at: {
      isString: true,
      trim: true,
      notEmpty: false,
      errorMessage: WORKING_SLOT_MESSAGES.END_AT_INVALID
    },
    type: {
      isString: true,
      notEmpty: false,
      errorMessage: WORKING_SLOT_MESSAGES.TYPE_INVALID
    }
  })
)
