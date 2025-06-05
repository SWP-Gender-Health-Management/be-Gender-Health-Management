import { Repository } from 'typeorm'
import { AppDataSource } from '~/config/database.config'
import HTTP_STATUS from '~/constants/httpStatus'
import { REPLY_MESSAGES } from '~/constants/message'
import { ErrorWithStatus } from '~/models/Error'
import Reply, { ReplyType } from '~/models/Entity/reply.entity'
import Account from '~/models/Entity/account.entity'
import Question from '~/models/Entity/question.entity'
import { Role } from '~/enum/role.enum'
import questionService from './question.service'

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
  async getAllReplies(): Promise<Reply[]> {
    return await replyRepository.find({
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
  async getRepliesByConsultantId(consultant_id: string): Promise<Reply[]> {
    const consultant = await accountRepository.findOne({ where: { account_id: consultant_id } })
    if (!consultant || consultant.role !== Role.CONSULTANT) {
      throw new ErrorWithStatus({
        message: REPLY_MESSAGES.CONSULTANT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const replies = await replyRepository.find({
      where: { consultant: consultant },
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
    await replyRepository.remove(reply)
  }
}

const replyService = new ReplyService()
export default replyService