import { AppDataSource } from '../config/database.config.js'
import HTTP_STATUS from '../constants/httpStatus.js'
import { QUESTION_MESSAGES } from '../constants/message.js'
import { ErrorWithStatus } from '../models/Error.js'
import Question from '../models/Entity/question.entity.js'
import Account from '../models/Entity/account.entity.js'
import Reply from '../models/Entity/reply.entity.js'
import { Role } from '../enum/role.enum.js'

const questionRepository = AppDataSource.getRepository(Question)
const accountRepository = AppDataSource.getRepository(Account)
const replyRepository = AppDataSource.getRepository(Reply)

export class QuestionService {
  // Create a new question
  async createQuestion(data: any): Promise<Question> {
    // Validate customer (account)
    const customer = await accountRepository.findOne({ where: { account_id: data.customer_id } })
    if (!customer || customer.role !== Role.CUSTOMER) {
      throw new ErrorWithStatus({
        message: QUESTION_MESSAGES.CUSTOMER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const question = questionRepository.create({
      content: data.content,
      customer: customer,
      status: data.status ?? false
    })

    return await questionRepository.save(question)
  }

  // Get all questions
  async getAllQuestions(): Promise<Question[]> {
    return await questionRepository.find({
      relations: ['customer', 'reply']
    })
  }

  // Get a question by ID
  async getQuestionById(ques_id: string): Promise<Question> {
    const question = await questionRepository.findOne({
      where: { ques_id },
      relations: ['customer', 'reply']
    })

    if (!question) {
      throw new ErrorWithStatus({
        message: QUESTION_MESSAGES.QUESTION_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return question
  }

  // Get questions by Customer ID
  async getQuestionsByCustomerId(customer_id: string): Promise<Question[]> {
    const customer = await accountRepository.findOne({ where: { account_id: customer_id } })
    if (!customer || customer.role !== Role.CUSTOMER) {
      throw new ErrorWithStatus({
        message: QUESTION_MESSAGES.CUSTOMER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const questions = await questionRepository.find({
      where: { customer: customer },
      relations: ['customer', 'reply']
    })

    if (!questions || questions.length === 0) {
      throw new ErrorWithStatus({
        message: QUESTION_MESSAGES.QUESTION_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return questions
  }

  // Update a question
  async updateQuestion(ques_id: string, data: any): Promise<Question> {
    const question = await this.getQuestionById(ques_id)
    let customer

    // Validate customer if provided
    if (data.customer_id && data.customer_id !== question.customer.account_id) {
      customer = await accountRepository.findOne({ where: { account_id: data.customer_id } })
      if (!customer || customer.role !== Role.CUSTOMER) {
        throw new ErrorWithStatus({
          message: QUESTION_MESSAGES.CUSTOMER_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
    }

    // Validate content if provided
    if (data.content && data.content.trim() === '') {
      throw new ErrorWithStatus({
        message: QUESTION_MESSAGES.CONTENT_REQUIRED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Check if question has a reply
    if (data.status && data.status === true && question.reply) {
      throw new ErrorWithStatus({
        message: QUESTION_MESSAGES.QUESTION_ALREADY_REPLIED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    Object.assign(question, {
      content: data.content || question.content,
      customer: customer || question.customer,
      status: data.status !== undefined ? data.status : question.status
    })

    return await questionRepository.save(question)
  }

  // Delete a question
  async deleteQuestion(ques_id: string): Promise<void> {
    const question = await this.getQuestionById(ques_id)

    // Check if question has a reply
    if (question.reply) {
      throw new ErrorWithStatus({
        message: QUESTION_MESSAGES.QUESTION_CANNOT_DELETE,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    await questionRepository.remove(question)
  }
}

const questionService = new QuestionService()
export default questionService
