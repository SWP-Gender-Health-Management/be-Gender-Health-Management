import { NextFunction, Request, Response } from 'express'
import HTTP_STATUS from '../constants/httpStatus.js'
import { TRANSACTION_MESSAGES } from '../constants/message.js'
import transactionService from '../services/transaction.service.js'

export const createConsultTransactionController = async (req: Request, res: Response, next: NextFunction) => {
  const { amount, description, app_id } = req.query
  const transaction = await transactionService.createConsultTransaction(
    app_id as string,
    Number(amount),
    description as string
  )
  res.status(HTTP_STATUS.OK).json({
    message: TRANSACTION_MESSAGES.TRANSACTION_CREATED_SUCCESS,
    data: transaction
  })
}

export const createLaborarityTransactionController = async (req: Request, res: Response, next: NextFunction) => {
  const { amount, description, app_id, orderCode } = req.body
  const transaction = await transactionService.createLaborarityTransaction(
    app_id as string,
    Number(orderCode),
    Number(amount),
    description as string
  )
  res.status(HTTP_STATUS.OK).json({
    message: TRANSACTION_MESSAGES.TRANSACTION_CREATED_SUCCESS,
    data: transaction
  })
}

export const createPaymentUrlController = async (req: Request, res: Response) => {
  try {
    const paymentLink = await transactionService.createPaymentUrlService(req.body)
    // Trả về link thanh toán cho client
    res.status(HTTP_STATUS.OK).json({
      message: TRANSACTION_MESSAGES.PAYMENT_LINK_CREATED_SUCCESS,
      data: paymentLink
    })
  } catch (error) {
    console.error('Error creating payment link:', error)
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to create payment link' })
  }
}

export const receiveHookController = async (req: Request, res: Response) => {
  const webhookData = req.body
  console.log('Webhook received:', JSON.stringify(webhookData, null, 2))

  try {
    // Luôn trả về 200 OK cho PayOS webhook
    res.status(HTTP_STATUS.OK).json({
      message: 'Webhook received successfully'
    })

    // Xử lý webhook data bất đồng bộ
    transactionService
      .receiveHookService(webhookData)
      .then((result) => {
        console.log('Webhook processed successfully:', result)
      })
      .catch((error) => {
        console.error('Error processing webhook:', error)
      })
  } catch (error) {
    console.error('Error in webhook handler:', error)
  }
}
