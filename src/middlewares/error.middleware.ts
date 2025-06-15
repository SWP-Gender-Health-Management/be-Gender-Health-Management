import { NextFunction, Request, Response } from 'express'
import HTTP_STATUS from '../constants/httpStatus.js'
import { EntityError, ErrorWithStatus } from '../models/Error.js'
import { omit } from 'lodash'

const defaultErrorHandle = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof EntityError) {
    return res.status(err.status).json({
      message: err.message,
      errors: err.error
    })
  }

  if (err instanceof ErrorWithStatus) {
    return res.status(err.status).json(omit(err, ['status']))
  }

  Object.getOwnPropertyNames(err).forEach((key) => {
    Object.defineProperty(err, key, { enumerable: true })
  })

  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    message: err.message,
    errorInfo: omit(err, ['stack'])
  })
}

export default defaultErrorHandle
