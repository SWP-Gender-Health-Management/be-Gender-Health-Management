import { NextFunction, Request, Response } from 'express'

import { RequestHandler } from 'express'

const wrapRequestHandler = (func: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}

export default wrapRequestHandler
