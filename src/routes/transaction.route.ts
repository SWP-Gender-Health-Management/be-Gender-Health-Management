import express from 'express'
import {
  createConsultTransactionController,
  createLaborarityTransactionController,
  createPaymentUrlController,
  receiveHookController
} from '../controllers/transaction.controller.js'
import { validateCreateTransaction } from '../middlewares/transaction.middleware.js'
import wrapRequestHandler from '../utils/handle.js'
import { validateAccessToken } from '~/middlewares/account.middleware.js'

const transactionRoute = express.Router()

transactionRoute.post(
  '/create-consult-transaction',
  validateCreateTransaction,
  wrapRequestHandler(createConsultTransactionController)
)

transactionRoute.post(
  '/create-laborarity-transaction',
  validateCreateTransaction,
  wrapRequestHandler(createLaborarityTransactionController)
)

transactionRoute.post('/create_payment_url', validateAccessToken, wrapRequestHandler(createPaymentUrlController))

transactionRoute.post('/receive-hook', receiveHookController)

export default transactionRoute
