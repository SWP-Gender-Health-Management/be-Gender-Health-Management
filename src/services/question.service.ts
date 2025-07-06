import { AppDataSource } from '../config/database.config.js'
import HTTP_STATUS from '../constants/httpStatus.js'
import { QUESTION_MESSAGES } from '../constants/message.js'
import { ErrorWithStatus } from '../models/Error.js'
import Question from '../models/Entity/question.entity.js'
import Account from '../models/Entity/account.entity.js'
import Reply from '../models/Entity/reply.entity.js'
import { Role } from '../enum/role.enum.js'
import { DeleteResult, IsNull } from 'typeorm'
import LIMIT from '~/constants/limit.js'
import { isNull } from 'lodash'

const questionRepository = AppDataSource.getRepository(Question)
const accountRepository = AppDataSource.getRepository(Account)
const replyRepository = AppDataSource.getRepository(Reply)

export class QuestionService {
  /**
   * @description Create a new question
   * @param customer_id - The ID of the customer
   * @param content - The content of the question
   * @param status - The status of the question
   * @returns The created question
   */
  // Create a new question
  async createQuestion(customer_id: string, content: string, status: boolean): Promise<Question> {
    // Validate customer (account)
    const customer = await accountRepository.findOne({ where: { account_id: customer_id } })
    if (!customer || customer.role !== Role.CUSTOMER) {
      throw new ErrorWithStatus({
        message: QUESTION_MESSAGES.CUSTOMER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const question = questionRepository.create({
      content: content,
      customer: customer,
      status: status
    })

    return await questionRepository.save(question)
  }

  /**
   * @description Get all questions
   * @param filter - The filter for the questions
   * @param pageVar - The page and limit for the questions
   * @returns The questions
   */
  // Get all questions
  async getAllQuestions(pageVar: { limit: string, page: string }): Promise<Question[]> {
    let limit = parseInt(pageVar.limit) || LIMIT.default;
    let page = parseInt(pageVar.page) || 1;
    const skip = (page - 1) * limit

    return await questionRepository.find({
      skip,
      take: limit,
      relations: ['customer', 'reply', 'reply.consultant']
    })
  }

  /**
   * @description Get a question by ID
   * @param ques_id - The ID of the question
   * @returns The question
   */
  // Get a question by ID
  async getQuestionById(ques_id: string): Promise<Question> {
    const question = await questionRepository.findOne({
      where: { ques_id },
      relations: ['customer', 'reply', 'reply.consultant']
    })

    if (!question) {
      throw new ErrorWithStatus({
        message: QUESTION_MESSAGES.QUESTION_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return question
  }

  // Get Unreplied questions
  async getUnrepliedQuestions(pageVar: { limit: string, page: string }): Promise<Question[]> {
    let limit = parseInt(pageVar.limit) || LIMIT.default;
    let page = parseInt(pageVar.page) || 1;
    const skip = (page - 1) * limit

    return await questionRepository.find({
      where: { reply: IsNull() },
      skip,
      take: limit,
      relations: ['customer', 'reply', 'reply.consultant']
    })
  }

  // Get replied questions by Consultant ID
  async getRepliedQuestionsByConsultantId(consultant_id: string, pageVar: { limit: string, page: string }): Promise<Question[]> {
    let limit = parseInt(pageVar.limit) || LIMIT.default;
    let page = parseInt(pageVar.page) || 1;
    const skip = (page - 1) * limit

    return await questionRepository.find({
      where: { reply: { consultant: { account_id: consultant_id } } },
      skip,
      take: limit,
      relations: ['customer', 'reply', 'reply.consultant']
    })
  }

  /**
   * @description Get questions by Customer ID
   * @param customer_id - The ID of the customer
   * @param filter - The filter for the questions
   * @param pageVar - The page and limit for the questions
   * @returns The questions
   */
  // Get questions by Customer ID
  async getQuestionsByCustomerId(customer_id: string, pageVar: { limit: string, page: string }): Promise<Question[]> {
    const customer = await accountRepository.findOne({ where: { account_id: customer_id } })
    if (!customer || customer.role !== Role.CUSTOMER) {
      throw new ErrorWithStatus({
        message: QUESTION_MESSAGES.CUSTOMER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    let limit = parseInt(pageVar.limit) || LIMIT.default;
    let page = parseInt(pageVar.page) || 1;
    const skip = (page - 1) * limit

    const questions = await questionRepository.find({
      where: { customer: {account_id: customer.account_id}},
      skip,
      take: limit,
      relations: ['customer', 'reply', 'reply.consultant']
    })

    if (!questions || questions.length === 0) {
      throw new ErrorWithStatus({
        message: QUESTION_MESSAGES.QUESTION_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return questions
  }

  /**
   * @description Update a question
   * @param ques_id - The ID of the question
   * @param content - The content of the question
   * @param status - The status of the question
   * @returns The updated question
   */
  // Update a question
  async updateQuestion(ques_id: string, customer_id: string, content: string, status: boolean): Promise<Question> {
    const question = await this.getQuestionById(ques_id)

    // Validate customer if provided
    if (customer_id && customer_id !== question.customer.account_id) {
      const customer = await accountRepository.findOne({ where: { account_id: customer_id } })
      if (!customer || customer.role !== Role.CUSTOMER) {
        throw new ErrorWithStatus({
          message: QUESTION_MESSAGES.CUSTOMER_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
    }

    // Validate content if provided
    if (content && content.trim() === '') {
      throw new ErrorWithStatus({
        message: QUESTION_MESSAGES.CONTENT_REQUIRED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Check if question has a reply
    if (status && status === true && question.reply) {
      throw new ErrorWithStatus({
        message: QUESTION_MESSAGES.QUESTION_ALREADY_REPLIED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    Object.assign(question, {
      content: content || question.content,
      customer: customer_id || question.customer.account_id,
      status: status !== undefined ? status : question.status
    })

    return await questionRepository.save(question)
  }

  /**
   * @description Delete a question
   * @param ques_id - The ID of the question
   * @returns The deleted question
   */
  // Delete a question
  async deleteQuestion(ques_id: string): Promise<DeleteResult> {
    const question = await this.getQuestionById(ques_id)

    // Check if question has a reply
    if (question.reply) {
      await replyRepository.delete(question.reply.reply_id)
    }

    return await questionRepository.delete(ques_id)
  }
}

const questionService = new QuestionService()
export default questionService
