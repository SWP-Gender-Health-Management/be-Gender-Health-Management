import { Repository } from 'typeorm'
import { AppDataSource } from '../config/database.config.js'
import HTTP_STATUS from '../constants/httpStatus.js'
import { FEEDBACK_MESSAGES } from '../constants/message.js'
import { ErrorWithStatus } from '../models/Error.js'
import Feedback, { FeedbackType } from '../models/Entity/feedback.entity.js'
import ConsultAppointment from '../models/Entity/consult_appointment.entity.js'
import LaboratoryAppointment from '../models/Entity/laborarity_appointment.entity.js'
import LIMIT from '~/constants/limit.js'

const feedbackRepository = AppDataSource.getRepository(Feedback)
const consultAppointmentRepository = AppDataSource.getRepository(ConsultAppointment)
const laboratoryAppointmentRepository = AppDataSource.getRepository(LaboratoryAppointment)

export class FeedbackService {
  // Create a new feedback
  async createFeedback(data: any): Promise<Feedback> {
    // Validate that at least one appointment is provided, but not both
    if (!data.app_id && !data.lab_id) {
      throw new ErrorWithStatus({
        message: FEEDBACK_MESSAGES.APPOINTMENT_NOT_PROVIDED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
    if (data.app_id && data.lab_id) {
      throw new ErrorWithStatus({
        message: FEEDBACK_MESSAGES.APPOINTMENT_NOT_PROVIDED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Validate consult appointment if provided
    let consultAppointment
    if (data.app_id) {
      consultAppointment = await consultAppointmentRepository.findOne({
        where: { app_id: data.app_id },
        relations: ['feedback']
      })
      if (!consultAppointment) {
        throw new ErrorWithStatus({
          message: FEEDBACK_MESSAGES.CONSULT_APPOINTMENT_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
      // Check if consult appointment already has a feedback
      if (consultAppointment.feedback) {
        throw new ErrorWithStatus({
          message: FEEDBACK_MESSAGES.FEEDBACK_ALREADY_EXISTS,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
    }

    // Validate laboratory appointment if provided
    let laboratoryAppointment
    if (data.lab_id) {
      laboratoryAppointment = await laboratoryAppointmentRepository.findOne({
        where: { app_id: data.lab_id },
        relations: ['feedback']
      })
      if (!laboratoryAppointment) {
        throw new ErrorWithStatus({
          message: FEEDBACK_MESSAGES.LABORATORY_APPOINTMENT_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
      // Check if laboratory appointment already has a feedback
      if (laboratoryAppointment.feedback) {
        throw new ErrorWithStatus({
          message: FEEDBACK_MESSAGES.FEEDBACK_ALREADY_EXISTS,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
    }

    // Validate content
    if (!data.content || data.content.trim() === '') {
      throw new ErrorWithStatus({
        message: FEEDBACK_MESSAGES.CONTENT_REQUIRED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Validate rating if provided
    if (data.rating && (typeof data.rating !== 'number' || data.rating < 1 || data.rating > 5)) {
      throw new ErrorWithStatus({
        message: FEEDBACK_MESSAGES.RATING_INVALID,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const feedback = feedbackRepository.create({
      consult_appointment: consultAppointment,
      laboratoryAppointment: laboratoryAppointment,
      content: data.content,
      rating: data.rating || null
    })

    // Save the feedback
    const savedFeedback = await feedbackRepository.save(feedback)

    // Assign the feedback to the corresponding appointment
    if (consultAppointment) {
      consultAppointment.feedback = savedFeedback
      await consultAppointmentRepository.save(consultAppointment)
    } else if (laboratoryAppointment) {
      laboratoryAppointment.feedback = savedFeedback
      await laboratoryAppointmentRepository.save(laboratoryAppointment)
    }

    return savedFeedback
  }

  // Get all feedbacks
  async getAllFeedbacks(pageVar: { limit: number, page: number }): Promise<Feedback[]> {
    let { limit, page } = pageVar;
    if (!limit || !page) {
      limit = LIMIT.default;
      page = 1;
    }
    const skip = (page - 1) * limit;

    return await feedbackRepository.find({
      skip,
      take: limit,
      relations: ['consult_appointment', 'laboratoryAppointment']
    })
  }

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
      where: { consult_appointment: consultAppointment },
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

  // Get feedback by Laboratory Appointment ID
  async getFeedbackByLaboratoryAppointmentId(lab_id: string): Promise<Feedback> {
    const laboratoryAppointment = await laboratoryAppointmentRepository.findOne({ where: { app_id: lab_id } })
    if (!laboratoryAppointment) {
      throw new ErrorWithStatus({
        message: FEEDBACK_MESSAGES.LABORATORY_APPOINTMENT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const feedback = await feedbackRepository.findOne({
      where: { laboratoryAppointment: laboratoryAppointment },
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

  // Update a feedback
  async updateFeedback(feed_id: string, data: any): Promise<Feedback> {
    const feedback = await this.getFeedbackById(feed_id)
    let consultAppointment
    let laboratoryAppointment

    // Validate consult appointment if provided
    if (data.app_id && data.app_id !== (feedback.consult_appointment?.app_id || null)) {
      consultAppointment = await consultAppointmentRepository.findOne({
        where: { app_id: data.app_id },
        relations: ['feedback']
      })
      if (!consultAppointment) {
        throw new ErrorWithStatus({
          message: FEEDBACK_MESSAGES.CONSULT_APPOINTMENT_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
      if (consultAppointment.feedback && consultAppointment.feedback.feed_id !== feed_id) {
        throw new ErrorWithStatus({
          message: FEEDBACK_MESSAGES.FEEDBACK_ALREADY_EXISTS,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
    }

    // Validate laboratory appointment if provided
    if (data.lab_id && data.lab_id !== (feedback.laboratoryAppointment?.app_id || null)) {
      laboratoryAppointment = await laboratoryAppointmentRepository.findOne({
        where: { app_id: data.lab_id },
        relations: ['feedback']
      })
      if (!laboratoryAppointment) {
        throw new ErrorWithStatus({
          message: FEEDBACK_MESSAGES.LABORATORY_APPOINTMENT_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
      if (laboratoryAppointment.feedback && laboratoryAppointment.feedback.feed_id !== feed_id) {
        throw new ErrorWithStatus({
          message: FEEDBACK_MESSAGES.FEEDBACK_ALREADY_EXISTS,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
    }

    // Ensure only one appointment type is assigned
    if (data.app_id && data.lab_id) {
      throw new ErrorWithStatus({
        message: FEEDBACK_MESSAGES.APPOINTMENT_NOT_PROVIDED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Validate content if provided
    if (data.content && data.content.trim() === '') {
      throw new ErrorWithStatus({
        message: FEEDBACK_MESSAGES.CONTENT_REQUIRED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Validate rating if provided
    if (data.rating && (typeof data.rating !== 'number' || data.rating < 1 || data.rating > 5)) {
      throw new ErrorWithStatus({
        message: FEEDBACK_MESSAGES.RATING_INVALID,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    Object.assign(feedback, {
      consult_appointment: consultAppointment || feedback.consult_appointment || null,
      laboratoryAppointment: laboratoryAppointment || feedback.laboratoryAppointment || null,
      content: data.content || feedback.content,
      rating: data.rating !== undefined ? data.rating : feedback.rating
    })

    // Save the updated feedback
    const updatedFeedback = await feedbackRepository.save(feedback)

    // Update the appointment relations
    if (consultAppointment || laboratoryAppointment) {
      // Remove feedback from old appointment
      const oldConsultAppointment = await consultAppointmentRepository.findOne({
        where: { feedback: { feed_id: feed_id } }
      })
      if (oldConsultAppointment && oldConsultAppointment.app_id !== consultAppointment?.app_id) {
        oldConsultAppointment.feedback = null
        await consultAppointmentRepository.save(oldConsultAppointment)
      }

      const oldLaboratoryAppointment = await laboratoryAppointmentRepository.findOne({
        where: { feedback: { feed_id: feed_id } }
      })
      if (oldLaboratoryAppointment && oldLaboratoryAppointment.app_id !== laboratoryAppointment?.app_id) {
        oldLaboratoryAppointment.feedback = null
        await laboratoryAppointmentRepository.save(oldLaboratoryAppointment)
      }

      // Assign feedback to new appointment
      if (consultAppointment) {
        consultAppointment.feedback = updatedFeedback
        await consultAppointmentRepository.save(consultAppointment)
      } else if (laboratoryAppointment) {
        laboratoryAppointment.feedback = updatedFeedback
        await laboratoryAppointmentRepository.save(laboratoryAppointment)
      }
    }

    return updatedFeedback
  }

  // Delete a feedback
  async deleteFeedback(feed_id: string): Promise<void> {
    const feedback = await this.getFeedbackById(feed_id)

    // Remove the feedback reference from the associated appointment
    if (feedback.consult_appointment) {
      const consultAppointment = await consultAppointmentRepository.findOne({
        where: { feedback: { feed_id: feed_id } },
        relations: ['feedback']
      })
      if (consultAppointment) {
        consultAppointment.feedback = null
        await consultAppointmentRepository.save(consultAppointment)
      }
    } else if (feedback.laboratoryAppointment) {
      const laboratoryAppointment = await laboratoryAppointmentRepository.findOne({
        where: { feedback: { feed_id: feed_id } },
        relations: ['feedback']
      })
      if (laboratoryAppointment) {
        laboratoryAppointment.feedback = null
        await laboratoryAppointmentRepository.save(laboratoryAppointment)
      }
    }

    // Delete the feedback
    await feedbackRepository.remove(feedback)
  }
}

const feedbackService = new FeedbackService()
export default feedbackService