import { DeleteResult, Repository, UpdateResult } from 'typeorm'
import { AppDataSource } from '../config/database.config.js'
import HTTP_STATUS from '../constants/httpStatus.js'
import { FEEDBACK_MESSAGES } from '../constants/message.js'
import { ErrorWithStatus } from '../models/Error.js'
import Feedback from '../models/Entity/feedback.entity.js'
import ConsultAppointment from '../models/Entity/consult_appointment.entity.js'
import LaboratoryAppointment from '../models/Entity/laborarity_appointment.entity.js'
import { TypeAppointment } from '~/enum/type_appointment.enum.js'
import LIMIT from '~/constants/limit.js'
import Account from '~/models/Entity/account.entity.js'
import { Role } from '~/enum/role.enum.js'
import { ConsultAppointmentService } from './consult_appointment.service.js'

const feedbackRepository = AppDataSource.getRepository(Feedback)
const consultAppointmentRepository = AppDataSource.getRepository(ConsultAppointment)
const laboratoryAppointmentRepository = AppDataSource.getRepository(LaboratoryAppointment)
const accountRepository = AppDataSource.getRepository(Account)
const consultAppointmentService = new ConsultAppointmentService()

export class FeedbackService {
  /**
   * @description Create a new feedback
   * @param app_id - The ID of the appointment
   * @param lab_id - The ID of the laboratory appointment
   * @param content - The content of the feedback
   * @param rating - The rating of the feedback
   * @param type - The type of the feedback
   * @returns The created feedback
   */
  // Create a new feedback
  async createFeedback(app_id: string, content: string, rating: number, type: TypeAppointment, customer_id: string): Promise<Feedback> {
    // Validate that at least one appointment is provided, but not both
    if (!app_id) {
      throw new ErrorWithStatus({
        message: FEEDBACK_MESSAGES.APPOINTMENT_NOT_PROVIDED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const existedFeedback = await feedbackRepository.findOne({where: {app_id}});
    if(existedFeedback) {
      throw new ErrorWithStatus({
        message: FEEDBACK_MESSAGES.APPOINTMENT_ALREADY_HAVE_FEEDBACK,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    if (!customer_id) {
      throw new ErrorWithStatus({
        message: FEEDBACK_MESSAGES.CUSTOMER_NOT_PROVIDED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const customer = await accountRepository.findOne({ where: { account_id: customer_id } })
    if (!customer || customer.role !== Role.CUSTOMER) {
      throw new ErrorWithStatus({
        message: FEEDBACK_MESSAGES.CUSTOMER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Validate content
    if (!content || content.trim() === '') {
      throw new ErrorWithStatus({
        message: FEEDBACK_MESSAGES.CONTENT_REQUIRED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Validate rating if provided
    if (rating && (typeof rating !== 'number' || rating < 1 || rating > 5)) {
      throw new ErrorWithStatus({
        message: FEEDBACK_MESSAGES.RATING_INVALID,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const feedback = feedbackRepository.create({
      app_id: app_id,
      content: content,
      rating: rating,
      type: type,
      account: customer
    })

    // Save the feedback
    const savedFeedback = await feedbackRepository.save(feedback)

    return savedFeedback
  }

  /**
   * @description Get all feedbacks
   * @param filter - The filter for the feedbacks
   * @param pageVar - The page and limit for the feedbacks
   * @returns The feedbacks
   */
  // Get all feedbacks
  async getAllFeedbacks(pageVar: { limit: string, page: string }): Promise<Feedback[]> {
    let limit = parseInt(pageVar.limit) || LIMIT.default;
    let page = parseInt(pageVar.page) || 1;
    const skip = (page - 1) * limit

    return await feedbackRepository.find({
      skip,
      take: limit,
    })
  }

  /**
   * @description Get a feedback by ID
   * @param feed_id - The ID of the feedback
   * @returns The feedback
   */
  // Get a feedback by ID
  async getFeedbackById(feed_id: string): Promise<Feedback> {
    const feedback = await feedbackRepository.findOne({
      where: { feed_id },
    })

    if (!feedback) {
      throw new ErrorWithStatus({
        message: FEEDBACK_MESSAGES.FEEDBACK_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return feedback
  }

  /**
   * @description Get a feedback by Consult Appointment ID
   * @param app_id - The ID of the consult appointment
   * @returns The feedback
   */
  // Get feedback by Consult Appointment ID
  async getFeedbackByConsultAppointmentId(app_id: string): Promise<Feedback> {
    const consultAppointment = await consultAppointmentRepository.findOne({ where: { app_id } })
    if (!consultAppointment) {
      throw new ErrorWithStatus({
        message: FEEDBACK_MESSAGES.CONSULT_APPOINTMENT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const feedback = await feedbackRepository.findOne({
      where: { app_id: app_id, type: TypeAppointment.CONSULT }
    })

    if (!feedback) {
      throw new ErrorWithStatus({
        message: FEEDBACK_MESSAGES.FEEDBACK_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return feedback
  }

  // Get feedback by Laboratory Appointment ID
  async getFeedbackByLaboratoryAppointmentId(app_id: string): Promise<Feedback> {
    const laboratoryAppointment = await laboratoryAppointmentRepository.findOne({ where: { app_id: app_id } })
    if (!laboratoryAppointment) {
      throw new ErrorWithStatus({
        message: FEEDBACK_MESSAGES.LABORATORY_APPOINTMENT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const feedback = await feedbackRepository.findOne({
      where: { app_id: app_id, type: TypeAppointment.LABORATORY }
    })

    if (!feedback) {
      throw new ErrorWithStatus({
        message: FEEDBACK_MESSAGES.FEEDBACK_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return feedback
  }

  // Get feedbacks by Customer ID
  async getFeedbacksByCustomerId(customer_id: string, pageVar: { limit: string, page: string }): Promise<Feedback[]> {
    let limit = parseInt(pageVar.limit) || LIMIT.default;
    let page = parseInt(pageVar.page) || 1;
    const skip = (page - 1) * limit
    const customer = await accountRepository.findOne({ where: { account_id: customer_id } })
    if (!customer || customer.role !== Role.CUSTOMER) {
      throw new ErrorWithStatus({
        message: FEEDBACK_MESSAGES.CUSTOMER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const feedbacks = await feedbackRepository.find({
      where: { account: { account_id: customer_id } },
      skip,
      take: limit
    })

    if (!feedbacks.length) {
      throw new ErrorWithStatus({
        message: FEEDBACK_MESSAGES.CONSULT_APPOINTMENT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return feedbacks;
  }

  // Update a feedback
  async updateFeedback(
    feed_id: string,
    app_id: string,
    content: string,
    rating: number,
    type: TypeAppointment
  ): Promise<UpdateResult> {
    const feedback = await this.getFeedbackById(feed_id)

    // Ensure only one appointment type is assigned
    if (app_id && type) {
      throw new ErrorWithStatus({
        message: FEEDBACK_MESSAGES.APPOINTMENT_NOT_PROVIDED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Validate content if provided
    if (!content || content.trim() === '') {
      throw new ErrorWithStatus({
        message: FEEDBACK_MESSAGES.CONTENT_REQUIRED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Validate rating if provided
    if (rating && (typeof rating !== 'number' || rating < 1 || rating > 5)) {
      throw new ErrorWithStatus({
        message: FEEDBACK_MESSAGES.RATING_INVALID,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const updatedFeedback = await feedbackRepository.update(feed_id, {
      app_id: app_id,
      content: content,
      rating: rating || feedback.rating,
      type: type || feedback.type
    })

    return updatedFeedback
  }

  /**
   * @description Delete a feedback
   * @param feed_id - The ID of the feedback
   * @returns The deleted feedback
   */
  // Delete a feedback
  async deleteFeedback(feed_id: string): Promise<DeleteResult> {
    return await feedbackRepository.delete(feed_id)
  }

  async getAverageRatingAndTotalFeedbackOfConsultant(consultant_id: string): Promise<Object> {
    const consultant = await accountRepository.findOne({ where: { account_id: consultant_id } });
    if (!consultant || consultant.role !== Role.CONSULTANT) {
      throw new ErrorWithStatus({
        message: FEEDBACK_MESSAGES.CONSULTANT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      });
    }
    const appointmentsOfConsultant = await consultAppointmentService.getConsultAppointmentByConsultantId(consultant_id);

    if (!appointmentsOfConsultant.length) {
      return {
        totalFeedBack: 0,
        averageFeedBackRating: 0
      };
    }

    let totalFeedBack = 0;
    let totalFeedBackRating = 0;

    await Promise.all(
      appointmentsOfConsultant.map(async (app) => {
        try {
          const feedback = await this.getFeedbackByConsultAppointmentId(app.app_id);
          if (feedback) {
            totalFeedBack += 1;
            totalFeedBackRating += feedback.rating;
          }
        } catch (error) {
          // Bỏ qua lỗi cho từng feedback để không làm hỏng toàn bộ yêu cầu
          console.error(`Lỗi khi lấy feedback cho app_id ${app.app_id}:`, error);
        }
      })
    );

    return {
      totalFeedBack,
      averageFeedBackRating: totalFeedBack > 0 ? totalFeedBackRating / totalFeedBack : 0
    };
  }
}

const feedbackService = new FeedbackService()
export default feedbackService
