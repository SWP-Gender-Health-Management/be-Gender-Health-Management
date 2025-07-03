import { AppDataSource } from '../config/database.config.js'
import HTTP_STATUS from '../constants/httpStatus.js'
import { REPLY_MESSAGES } from '../constants/message.js'
import { ErrorWithStatus } from '../models/Error.js'
import Reply from '../models/Entity/reply.entity.js'
import Account from '../models/Entity/account.entity.js'
import Question from '../models/Entity/question.entity.js'
import { Role } from '../enum/role.enum.js'
import LIMIT from '~/constants/limit.js'

const replyRepository = AppDataSource.getRepository(Reply)
const accountRepository = AppDataSource.getRepository(Account)
const questionRepository = AppDataSource.getRepository(Question)

export class ReplyService {
  /**
   * @description Create a new reply
   * @param consultant_id - The ID of the consultant
   * @param ques_id - The ID of the question
   * @param content - The content of the reply
   * @returns The created reply
   */
  // Create a new reply
  async createReply(consultant_id: string, ques_id: string, content: string): Promise<Reply> {
    // Validate consultant (account)
    const consultant = await accountRepository.findOne({ where: { account_id: consultant_id } })
    if (!consultant || consultant.role !== Role.CONSULTANT) {
      throw new ErrorWithStatus({
        message: REPLY_MESSAGES.CONSULTANT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Validate question
    const question = await questionRepository.findOne({ where: { ques_id: ques_id }, relations: ['reply'] })
    if (!question) {
      throw new ErrorWithStatus({
        message: REPLY_MESSAGES.QUESTION_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Check if question already has a reply
    if (question.reply) {
      throw new ErrorWithStatus({
        message: REPLY_MESSAGES.REPLY_ALREADY_EXISTS,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Validate content
    if (!content || content.trim() === '') {
      throw new ErrorWithStatus({
        message: REPLY_MESSAGES.CONTENT_REQUIRED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const reply = replyRepository.create({
      consultant: consultant,
      question: question,
      content: content
    })

    // Save the reply
    const savedReply = await replyRepository.save(reply)

    // Assign the reply to the question and save the question
    await questionRepository.update(ques_id, {reply: savedReply})

    return savedReply
  }

  /**
   * @description Get all replies
   * @param filter - The filter for the replies
   * @param pageVar - The page and limit for the replies
   * @returns The replies
   */
  // Get all replies
  async getAllReplies(pageVar: { limit: string, page: string }): Promise<Reply[]> {
    let limit = parseInt(pageVar.limit) || LIMIT.all;
    let page = parseInt(pageVar.page) || 1;
    const skip = (page - 1) * limit

    return await replyRepository.find({
      skip,
      take: limit,
      relations: ['consultant', 'question']
    })
  }

  /**
   * @description Get a reply by ID
   * @param reply_id - The ID of the reply
   * @returns The reply
   */
  // Get a reply by ID
  async getReplyById(reply_id: string): Promise<Reply> {
    const reply = await replyRepository.findOne({
      where: { reply_id },
      relations: ['consultant', 'question']
    })

    if (!reply) {
      throw new ErrorWithStatus({
        message: REPLY_MESSAGES.REPLY_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return reply
  }

  /**
   * @description Get replies by Consultant ID
   * @param consultant_id - The ID of the consultant
   * @param filter - The filter for the replies
   * @param pageVar - The page and limit for the replies
   * @returns The replies
   */
  // Get replies by Consultant ID
  async getRepliesByConsultantId(consultant_id: string, pageVar: { limit: string, page: string }): Promise<Reply[]> {
    const consultant = await accountRepository.findOne({ where: { account_id: consultant_id } })
    if (!consultant || consultant.role !== Role.CONSULTANT) {
      throw new ErrorWithStatus({
        message: REPLY_MESSAGES.CONSULTANT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    let limit = parseInt(pageVar.limit) || LIMIT.all;
    let page = parseInt(pageVar.page) || 1;
    const skip = (page - 1) * limit

    const replies = await replyRepository.find({
      where: { consultant: {account_id: consultant.account_id}},
      skip,
      take: limit,
      relations: ['consultant', 'question']
    })

    if (!replies || replies.length === 0) {
      throw new ErrorWithStatus({
        message: REPLY_MESSAGES.REPLY_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return replies
  }

  /**
   * @description Get a reply by Question ID
   * @param ques_id - The ID of the question
   * @returns The reply
   */
  // Get reply by Question ID
  async getReplyByQuestionId(ques_id: string): Promise<Reply> {
    const question = await questionRepository.findOne({ where: { ques_id } })
    if (!question) {
      throw new ErrorWithStatus({
        message: REPLY_MESSAGES.QUESTION_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const reply = await replyRepository.findOne({
      where: { question: {ques_id: question.ques_id} },
      relations: ['consultant', 'question']
    })

    if (!reply) {
      throw new ErrorWithStatus({
        message: REPLY_MESSAGES.REPLY_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return reply
  }

  /**
   * @description Update a reply
   * @param reply_id - The ID of the reply
   * @param consultant_id - The ID of the consultant
   * @param content - The content of the reply
   * @returns The updated reply
   */
  // Update a reply
  async updateReply(reply_id: string, consultant_id: string, content: string): Promise<Reply> {
    const reply = await this.getReplyById(reply_id)
    let consultant

    // Validate consultant if provided
    if (consultant_id && consultant_id !== reply.consultant.account_id) {
      consultant = await accountRepository.findOne({ where: { account_id: consultant_id } })
      if (!consultant || consultant.role !== Role.CONSULTANT) {
        throw new ErrorWithStatus({
          message: REPLY_MESSAGES.CONSULTANT_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
    }

    // Validate content if provided
    if (content && content.trim() === '') {
      throw new ErrorWithStatus({
        message: REPLY_MESSAGES.CONTENT_REQUIRED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    Object.assign(reply, {
      consultant: consultant || reply.consultant,
      content: content || reply.content
    })

    return await replyRepository.save(reply)
  }

  /**
   * @description Delete a reply
   * @param reply_id - The ID of the reply
   * @returns The deleted reply
   */
  // Delete a reply
  async deleteReply(reply_id: string): Promise<void> {
    const reply = await this.getReplyById(reply_id)

    // Find the associated question and remove the reply reference
    const question = await questionRepository.findOne({
      where: { reply: { reply_id } },
      relations: ['reply']
    })

    if (question) {
      question.reply = null
      await questionRepository.save(question)
    }

    // Delete the reply
    await replyRepository.remove(reply)
  }
}

const replyService = new ReplyService()
export default replyService
