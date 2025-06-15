import payos from '../config/payosClient.config.js'
import { AppDataSource } from '../config/database.config.js'
import Transaction from '../models/Entity/transaction.entity.js'
import { ErrorWithStatus } from '../models/Error.js'
import { TransactionStatus } from '../enum/transaction.enum.js'
import { TRANSACTION_MESSAGES } from '../constants/message.js'
import HTTP_STATUS from '../constants/httpStatus.js'
import { sendMail } from './email.service.js'
import { WebhookDataType, WebhookType } from '@payos/node/lib/type.js'
import LaboratoryAppointment from '../models/Entity/laborarity_appointment.entity.js'

const transactionRepository = AppDataSource.getRepository(Transaction)
const labAppointmentRepository = AppDataSource.getRepository(LaboratoryAppointment)

export class createTransactionService {
  async createConsultTransaction(app_id: string, amount: number, description: string) {
    const appointment = await labAppointmentRepository.findOne({
      where: {
        app_id: app_id
      }
    })
    const transaction = transactionRepository.create({
      app_id: 'Con_'.concat(app_id),
      amount: amount,
      customer: {
        account_id: appointment?.customer.account_id
      },
      description
    })
    await transactionRepository.save(transaction)
    return transaction
  }

  async createLaborarityTransaction(app_id: string, orderCode: number, amount: number, description: string) {
    const appointment: LaboratoryAppointment | null = await labAppointmentRepository.findOne({
      where: {
        app_id: app_id
      },
      relations: ['customer']
    })
    // console.log(appointment)
    if (!appointment) {
      throw new ErrorWithStatus({
        message: TRANSACTION_MESSAGES.TRANSACTION_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const account_id = appointment.customer.account_id
    const transaction = transactionRepository.create({
      app_id: 'Lab_' + app_id,
      order_code: orderCode,
      amount: amount,
      description: description || 'Pay for lab appointment',
      customer: {
        account_id: account_id
      }
    })
    await transactionRepository.save(transaction)
    return transaction
  }

  async createPaymentUrlService(payload: any) {
    const { orderCode } = payload
    if (!orderCode) {
      throw new ErrorWithStatus({
        message: 'Passcode is required',
        status: 400
      })
    }
    const transaction = await transactionRepository.findOne({
      where: {
        order_code: orderCode
      }
    })
    if (!transaction) {
      throw new ErrorWithStatus({
        message: 'Transaction not found',
        status: 404
      })
    }
    const paymentData = {
      orderCode: parseInt(orderCode), // orderCode phải là số nguyên
      amount: transaction.amount,
      description: transaction.description,
      currency: 'VND',
      expireTime: 1000 * 60 * 5,
      returnUrl: process.env.FRONTEND_RETURN_URL!,
      cancelUrl: process.env.FRONTEND_CANCEL_URL!
    }
    console.log('Creating payment link with data:', paymentData)

    // Gọi SDK để tạo link thanh toán
    const paymentLink = await payos.createPaymentLink(paymentData)
    console.log('Payment link created:', paymentLink)
    return paymentLink
  }

  async getLinkPaymentService(orderCode: string) {
    const linkPayment = await payos.getPaymentLinkInformation(orderCode)
    if (!linkPayment) {
      throw new ErrorWithStatus({
        message: TRANSACTION_MESSAGES.TRANSACTION_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return linkPayment
  }

  async cancelPaymentService(orderCode: string) {
    const cancelPayment = await payos.cancelPaymentLink(orderCode)
    if (!cancelPayment) {
      throw new ErrorWithStatus({ message: TRANSACTION_MESSAGES.TRANSACTION_NOT_FOUND, status: HTTP_STATUS.NOT_FOUND })
    }
    return cancelPayment
  }

  async confirmWebhookService(webhookData: WebhookType) {
    const verifiedData: WebhookDataType = payos.verifyPaymentWebhookData(webhookData)
    console.log('Webhook data verified successfully:', verifiedData)
    return verifiedData
  }

  async receiveHookService(webhookData: WebhookType) {
    // Sử dụng SDK để xác thực dữ liệu webhook
    // Thao tác này sẽ kiểm tra chữ ký (signature) để đảm bảo dữ liệu là từ PayOS
    const verifiedData: WebhookDataType = payos.verifyPaymentWebhookData(webhookData)
    console.log('Webhook data verified successfully:', verifiedData)
    const transaction = await transactionRepository.findOne({
      where: { order_code: verifiedData.orderCode }
    })
    const labAppointment = await labAppointmentRepository.findOne({
      where: { app_id: transaction?.app_id.split('_')[1] }
    })
    // Xử lý logic dựa trên trạng thái thanh toán
    if (verifiedData.code === '00') {
      console.log(`Payment for order ${verifiedData.orderCode} was successful.`)

      // TODO: Xử lý logic nghiệp vụ của bạn ở đây
      // 1. Kiểm tra xem `orderCode` có tồn tại trong DB của bạn không.
      if (!labAppointment) {
        throw new ErrorWithStatus({
          message: TRANSACTION_MESSAGES.TRANSACTION_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
      if (!transaction) {
        throw new ErrorWithStatus({
          message: TRANSACTION_MESSAGES.TRANSACTION_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
      // 2. Kiểm tra xem đơn hàng này đã được xử lý thanh toán trước đó chưa (để tránh xử lý trùng lặp).
      if (transaction.status === TransactionStatus.PAID) {
        throw new ErrorWithStatus({
          message: TRANSACTION_MESSAGES.TRANSACTION_ALREADY_PAID,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
      // 3. Kiểm tra xem số tiền `verifiedData.data.amount` có khớp với số tiền của đơn hàng không.
      if (transaction.amount === verifiedData.amount) {
        // 4. Cập nhật trạng thái đơn hàng thành "ĐÃ THANH TOÁN".
        transaction.status = TransactionStatus.PAID
        await transactionRepository.save(transaction)
      }
      // 5. Gửi email xác nhận, bắt đầu quá trình giao hàng, v.v. --> gửi trong controller
      return {
        message: TRANSACTION_MESSAGES.TRANSACTION_PAID_SUCCESS,
        data: verifiedData
      }
    } else {
      console.log(`Payment for order ${verifiedData.orderCode} failed or is pending.`)
      // TODO: Xử lý các trường hợp thanh toán thất bại hoặc các trạng thái khác
      transaction!.status = TransactionStatus.FAILED
      await transactionRepository.save(transaction!)
      return {
        message: TRANSACTION_MESSAGES.TRANSACTION_FAILED,
        data: verifiedData
      }
    }
  }
}

const transactionService = new createTransactionService()
export default transactionService
