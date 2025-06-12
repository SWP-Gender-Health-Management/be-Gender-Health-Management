import { Router } from 'express'
import { validateAddLaborarity } from '~/middlewares/laborarity.middleware'
import wrapRequestHandler from '~/utils/handle'
import { addLaborarityController, getAllLaboraritiesController } from '~/controllers/laborarity.controller'

const laborarityRoute = Router()

/*
  description: Add a new laborarity
  path: /laborarity/add-laborarity
  method: POST
  body: {
    name: string
    description: string
    price: number
  }
*/
laborarityRoute.post('/add-laborarity', validateAddLaborarity, wrapRequestHandler(addLaborarityController))

/*
  description: Get all laborarities
  path: /laborarity/get-all-laborarities
  method: GET
*/
laborarityRoute.get('/get-all-laborarities', wrapRequestHandler(getAllLaboraritiesController))

export default laborarityRoute
