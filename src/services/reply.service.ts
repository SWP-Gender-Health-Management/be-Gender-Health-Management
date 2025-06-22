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
  // Create a new reply
  async createReply(data: any): Promise<Reply> {
    // Validate consultant (account)
    const consultant = await accountRepository.findOne({ where: { account_id: data.consultant_id } })
    if (!consultant || consultant.role !== Role.CONSULTANT) {
      throw new ErrorWithStatus({
        message: REPLY_MESSAGES.CONSULTANT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Validate question
    const question = await questionRepository.findOne({ where: { ques_id: data.ques_id }, relations: ['reply'] })
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
    if (!data.content || data.content.trim() === '') {
      throw new ErrorWithStatus({
        message: REPLY_MESSAGES.CONTENT_REQUIRED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const reply = replyRepository.create({
      consultant: consultant,
      question: question,
      content: data.content
    })

    // Save the reply
    const savedReply = await replyRepository.save(reply)

    // Assign the reply to the question and save the question
    question.reply = savedReply
    await questionRepository.save(question)

    return savedReply
  }

  // Get all replies
  async getAllReplies(pageVar: { limit: number, page: number }): Promise<Reply[]> {
    let { limit, page } = pageVar;
    if (!limit || !page) {
      limit = LIMIT.default;
      page = 1;
    }
    const skip = (page - 1) * limit;

    return await replyRepository.find({
      skip,
      take: limit,
      relations: ['consultant', 'question']
    })
  }

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

  // Get replies by Consultant ID
  async getRepliesByConsultantId(consultant_id: string, pageVar: { limit: number, page: number }): Promise<Reply[]> {
    const consultant = await accountRepository.findOne({ where: { account_id: consultant_id } })
    if (!consultant || consultant.role !== Role.CONSULTANT) {
      throw new ErrorWithStatus({
        message: REPLY_MESSAGES.CONSULTANT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    let { limit, page } = pageVar;
    if (!limit || !page) {
      limit = LIMIT.default;
      page = 1;
    }
    const skip = (page - 1) * limit;

    const replies = await replyRepository.find({
      where: { consultant: consultant},
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
      where: { question: question },
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

  // Update a reply
  async updateReply(reply_id: string, data: any): Promise<Reply> {
    const reply = await this.getReplyById(reply_id)
    let consultant

    // Validate consultant if provided
    if (data.consultant_id && data.consultant_id !== reply.consultant.account_id) {
      consultant = await accountRepository.findOne({ where: { account_id: data.consultant_id } })
      if (!consultant || consultant.role !== Role.CONSULTANT) {
        throw new ErrorWithStatus({
          message: REPLY_MESSAGES.CONSULTANT_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
    }

    // Validate content if provided
    if (data.content && data.content.trim() === '') {
      throw new ErrorWithStatus({
        message: REPLY_MESSAGES.CONTENT_REQUIRED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    Object.assign(reply, {
      consultant: consultant || reply.consultant,
      content: data.content || reply.content
    })

    return await replyRepository.save(reply)
  }

  // Delete a reply
  async deleteReply(reply_id: string): Promise<void> {
    const reply = await this.getReplyById(reply_id)

    // Find the associated question and remove the reply reference
    const question = await questionRepository.findOne({
      where: { reply: { reply_id: reply_id } },
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
