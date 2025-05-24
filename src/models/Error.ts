import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/message'

type ErrorType = Record<string, string>

export class ErrorWithStatus {
  message: string
  status: number
  constructor({ message, status }: { message: string; status: number }) {
    this.message = message
    this.status = status
  }
}

export class EntityError extends ErrorWithStatus {
  error: ErrorType
  constructor({ message = USERS_MESSAGES.VALIDATION_ERROR, error }: { message?: string; error: ErrorType }) {
    super({ message, status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
    this.error = error
  }
}
