import { NextFunction, Request, Response } from 'express'
import HTTP_STATUS from '../constants/httpStatus.js'
import { TRANSACTION_MESSAGES } from '../constants/message.js'
import transactionService from '../services/transaction.service.js'

/**
 * @swagger
 * /api/transaction/create-consult-transaction:
 *   post:
 *     summary: Create a consult transaction
 *     description: Creates a transaction for a consult appointment. Requires customer or admin role.
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: amount
 *         required: true
 *         schema:
 *           type: number
 *         description: The transaction amount
 *       - in: query
 *         name: description
 *         required: true
 *         schema:
 *           type: string
 *         description: Description of the transaction
 *       - in: query
 *         name: app_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The consult appointment ID (UUID)
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 data:
 *                   $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Bad request (invalid input data)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       401:
 *         description: Unauthorized (invalid token or insufficient role)
 */
// Create consult transaction
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

/**
 * @swagger
 * /api/transaction/create-laborarity-transaction:
 *   post:
 *     summary: Create a laboratory transaction
 *     description: Creates a transaction for a laboratory appointment. Requires customer or admin role.
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: The transaction amount
 *               description:
 *                 type: string
 *                 description: Description of the transaction
 *               app_id:
 *                 type: string
 *                 description: The laboratory appointment ID (UUID)
 *               orderCode:
 *                 type: number
 *                 description: Unique order code for the transaction
 *             required: [amount, app_id, orderCode]
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 data:
 *                   $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Bad request (invalid input data)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       401:
 *         description: Unauthorized (invalid token or insufficient role)
 *       404:
 *         description: Not found (appointment not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
// Create laboratory transaction
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

/**
 * @swagger
 * /api/transaction/create_payment_url:
 *   post:
 *     summary: Create a payment URL
 *     description: Generates a PayOS payment URL for a transaction based on the provided order code.
 *     tags: [Transaction]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderCode:
 *                 type: number
 *                 description: Unique order code for the transaction
 *             required: [orderCode]
 *     responses:
 *       200:
 *         description: Payment URL created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 data:
 *                   type: object
 *                   description: Payment link object from PayOS
 *       400:
 *         description: Bad request (missing order code)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       404:
 *         description: Not found (transaction not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
// Create payment URL
export const createPaymentUrlController = async (req: Request, res: Response) => {
  try {
    const { orderCode } = req.body
    const paymentLink = await transactionService.createPaymentUrlService(orderCode)
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

/**
 * @swagger
 * /api/transaction/receive-hook:
 *   post:
 *     summary: Receive PayOS webhook
 *     description: Handles webhook notifications from PayOS for transaction status updates. Public endpoint.
 *     tags: [Transaction]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Webhook data from PayOS
 *     responses:
 *       200:
 *         description: Webhook received successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *       400:
 *         description: Bad request (invalid webhook data)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       404:
 *         description: Not found (transaction or appointment not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
// Receive PayOS webhook
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
