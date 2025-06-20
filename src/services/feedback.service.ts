import { DeleteResult, Repository, UpdateResult } from 'typeorm'
import { AppDataSource } from '../config/database.config.js'
import HTTP_STATUS from '../constants/httpStatus.js'
import { FEEDBACK_MESSAGES } from '../constants/message.js'
import { ErrorWithStatus } from '../models/Error.js'
import Feedback from '../models/Entity/feedback.entity.js'
import ConsultAppointment from '../models/Entity/consult_appointment.entity.js'
import LaboratoryAppointment from '../models/Entity/laborarity_appointment.entity.js'
import { TypeAppointment } from '~/enum/type_appointment.enum.js'

const feedbackRepository = AppDataSource.getRepository(Feedback)
const consultAppointmentRepository = AppDataSource.getRepository(ConsultAppointment)
const laboratoryAppointmentRepository = AppDataSource.getRepository(LaboratoryAppointment)

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
  async createFeedback(app_id: string, content: string, rating: number, type: TypeAppointment): Promise<Feedback> {
    // Validate that at least one appointment is provided, but not both
    if (!app_id) {
      throw new ErrorWithStatus({
        message: FEEDBACK_MESSAGES.APPOINTMENT_NOT_PROVIDED,
        status: HTTP_STATUS.BAD_REQUEST
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
      type: type
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
  async getAllFeedbacks(filter: any, pageVar: any): Promise<Feedback[]> {
    let { limit, page } = pageVar
    if (!limit || !page) {
      limit = 0
      page = 1
    }
    const skip = (page - 1) * limit

    return await feedbackRepository.find({
      where: { ...filter },
      skip,
      take: limit,
      relations: ['consult_appointment', 'laboratoryAppointment']
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
      relations: ['consult_appointment', 'laboratoryAppointment']
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
}

const feedbackService = new FeedbackService()
export default feedbackService
