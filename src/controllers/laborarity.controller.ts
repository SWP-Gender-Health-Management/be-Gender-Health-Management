import { Request, Response } from 'express'
import { LABORARITY_MESSAGES } from '~/constants/message'
import HttpStatus from '~/constants/httpStatus'
import laborarityService from '~/services/laborarity.service'

export const addLaborarityController = async (req: Request, res: Response) => {
  const { name, specimen, description, price } = req.body
  const laborarity = await laborarityService.createLaborarity(name, specimen, description, price)
  return res.status(HttpStatus.CREATED).json({
    message: LABORARITY_MESSAGES.LABORARITY_CREATED_SUCCESS,
    data: laborarity
  })
}

export const getAllLaboraritiesController = async (req: Request, res: Response) => {
  const laborarities = await laborarityService.getAllLaborarities()
  return res.status(HttpStatus.OK).json({
    message: LABORARITY_MESSAGES.LABORARITY_CREATED_SUCCESS,
    data: laborarities
  })
}
