import express from 'express'
import {
  createConsultTransactionController,
  createLaborarityTransactionController,
  createPaymentUrlController,
  receiveHookController
} from '~/controllers/transaction.controller.js'
import { validateCreateTransaction } from '~/middlewares/transaction.middleware.js'
import wrapRequestHandler from '~/utils/handle.js'

const transactionRouter = express.Router()

transactionRouter.get(
  '/payos/create-consult-transaction',
  validateCreateTransaction,
  wrapRequestHandler(createConsultTransactionController)
)

transactionRouter.get(
  '/payos/create-laborarity-transaction',
  validateCreateTransaction,
  wrapRequestHandler(createLaborarityTransactionController)
)

transactionRouter.post('/create_payment_url', wrapRequestHandler(createPaymentUrlController))

transactionRouter.post('/receive-hook', receiveHookController)

export default transactionRouter
