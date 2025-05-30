import { NextFunction, Request, Response } from 'express'
import { ValidationChain, validationResult } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema'
import HTTP_STATUS from '~/constants/httpStatus'
import { EntityError, ErrorWithStatus } from '~/models/Error'

export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await validation.run(req)
    const errorObject = validationResult(req)
    if (errorObject.isEmpty()) {
      return next()
    }

    const error = errorObject.mapped()
    console.log('Validation errors:', error)

    // Transform errors to only include messages
    const formattedErrors = Object.keys(error).reduce(
      (acc, key) => {
        acc[key] = error[key].msg
        return acc
      },
      {} as Record<string, string>
    )

    // Create EntityError with formatted errors
    const entityError = new EntityError({
      error: formattedErrors
    })
    return next(entityError)
  }
}
