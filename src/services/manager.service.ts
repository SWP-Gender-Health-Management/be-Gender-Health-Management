import { Between, In, LessThanOrEqual, Like, MoreThanOrEqual } from 'typeorm'
import { AppDataSource } from '~/config/database.config.js'
import { StatusAppointment, stringToStatus } from '~/enum/statusAppointment.enum.js'
import ConsultAppointment from '~/models/Entity/consult_appointment.entity.js'
import LaboratoryAppointment from '~/models/Entity/laborarity_appointment.entity.js'
import Feedback from '~/models/Entity/feedback.entity.js'
import { addDays, endOfMonth, endOfWeek, startOfMonth, startOfWeek, subDays } from 'date-fns'
import { TypeAppointment } from '~/enum/type_appointment.enum.js'
import Account from '~/models/Entity/account.entity.js'
import { Role } from '~/enum/role.enum.js'
import MenstrualCycle from '~/models/Entity/menstrual_cycle.entity.js'
import StaffPattern from '~/models/Entity/staff_pattern.entity.js'
import ConsultantPattern from '~/models/Entity/consultant_pattern.entity.js'
import Transaction from '~/models/Entity/transaction.entity.js'
import { TransactionStatus } from '~/enum/transaction.enum.js'
import Blog from '~/models/Entity/blog.entity.js'
import Question from '~/models/Entity/question.entity.js'
import Refund from '~/models/Entity/refund.entity.js'
import { ErrorWithStatus } from '~/models/Error.js'
import { MANAGER_MESSAGES } from '~/constants/message.js'
import HTTP_STATUS from '~/constants/httpStatus.js'
import WorkingSlot from '~/models/Entity/working_slot.entity.js'

const accountRepo = AppDataSource.getRepository(Account)
const conAppRepo = AppDataSource.getRepository(ConsultAppointment)
const labAppRepo = AppDataSource.getRepository(LaboratoryAppointment)
const feedbackRepo = AppDataSource.getRepository(Feedback)
const mensRepo = AppDataSource.getRepository(MenstrualCycle)
const staffPatternRepo = AppDataSource.getRepository(StaffPattern)
const conPatternRepo = AppDataSource.getRepository(ConsultantPattern)
const transactionRepo = AppDataSource.getRepository(Transaction)
const blogRepo = AppDataSource.getRepository(Blog)
const questionRepo = AppDataSource.getRepository(Question)
const transactionRepository = AppDataSource.getRepository(Transaction)
const refundRepository = AppDataSource.getRepository(Refund)
const workingSlotRepo = AppDataSource.getRepository(WorkingSlot)

class ManagerService {
  async getOverall() {
    const today = new Date()
    const [labApp, conApp, totalLabRevenue, totalConRevenue, totalMenstrual] = await Promise.all([
      labAppRepo.count({
        where: {
          date: today
        }
      }),
      conAppRepo.count({
        where: {
          consultant_pattern: {
            date: today
          }
        }
      }),
      transactionRepo
        .createQueryBuilder('transaction')
        .select('SUM(transaction.amount)', 'totalRevenue')
        .where('transaction.date = :date', { date: today })
        .andWhere('transaction.app_id LIKE :app_id', { app_id: 'Lab_%' })
        .getRawOne()
        .then((result) => result.totalRevenue),
      transactionRepo
        .createQueryBuilder('transaction')
        .select('SUM(transaction.amount)', 'totalRevenue')
        .where('transaction.date = :date', { date: today })
        .andWhere('transaction.app_id LIKE :app_id', { app_id: 'Con_%' })
        .getRawOne()
        .then((result) => result.totalRevenue),
      mensRepo
        .createQueryBuilder('MenstrualCycle')
        .select('COUNT(mens.id)', 'totalMenstrual')
        .where("date_trunc('week', MenstrualCycle.created_at) = date_trunc('week', NOW())")
        .getRawOne()
        .then((result) => result.totalMenstrual)
    ])
    return {
      totalApp: labApp + conApp,
      totalLabRevenue,
      totalConRevenue,
      totalMenstrual
    }
  }

  async getOverallWeekly() {
    const today = new Date()
    const startOfWeekDate = startOfWeek(today)
    const endOfWeekDate = endOfWeek(today)
    const [
      pendingLabApp,
      pendingConApp,
      completedLabApp,
      completedConApp,
      totalLabApp,
      totalConApp,
      goodFeedback,
      totalFeedback
    ] = await Promise.all([
      labAppRepo.count({
        where: {
          date: Between(startOfWeekDate, endOfWeekDate),
          status: StatusAppointment.PENDING
        }
      }),
      conAppRepo.count({
        where: {
          consultant_pattern: {
            date: Between(startOfWeekDate, endOfWeekDate)
          },
          status: StatusAppointment.PENDING
        }
      }),
      labAppRepo.count({
        where: {
          date: Between(startOfWeekDate, endOfWeekDate),
          status: StatusAppointment.COMPLETED
        }
      }),
      conAppRepo.count({
        where: {
          consultant_pattern: {
            date: Between(startOfWeekDate, endOfWeekDate)
          },
          status: StatusAppointment.COMPLETED
        }
      }),
      labAppRepo.count({
        where: {
          date: Between(startOfWeekDate, endOfWeekDate)
        }
      }),
      conAppRepo.count({
        where: {
          consultant_pattern: {
            date: Between(startOfWeekDate, endOfWeekDate)
          }
        }
      }),
      feedbackRepo
        .createQueryBuilder('feedback')
        .select('SUM(feedback.rating)', 'totalRating')
        .where('feedback.date BETWEEN :startOfWeek AND :endOfWeek', {
          startOfWeek: startOfWeekDate,
          endOfWeek: endOfWeekDate
        })
        .getRawOne()
        .then((result) => result.totalRating),
      feedbackRepo.count({
        where: {
          date: Between(startOfWeekDate, endOfWeekDate)
        }
      })
    ])
    return {
      totalPendingApp: pendingLabApp + pendingConApp,
      totalCompletedApp: completedLabApp + completedConApp,
      completedPercent: ((completedLabApp + completedConApp) / (totalLabApp + totalConApp)) * 100,
      goodFeedPercent: goodFeedback / totalFeedback
    }
  }

  async getAppPercent() {
    const today = new Date()
    const startOfWeekDate = subDays(today, 7)
    const endOfWeekDate = addDays(today, 1)
    const [totalLabApp, totalConApp] = await Promise.all([
      labAppRepo.count({
        where: {
          date: Between(startOfWeekDate, endOfWeekDate)
        }
      }),
      conAppRepo.count({
        where: {
          consultant_pattern: {
            date: Between(startOfWeekDate, endOfWeekDate)
          }
        }
      })
    ])
    return {
      totalLabApp,
      totalConApp
    }
  }

  async getRecentApp() {
    const [labApp, conApp] = await Promise.all([
      labAppRepo.find({
        order: {
          date: 'DESC'
        },
        take: 5
      }),
      conAppRepo.find({
        order: {
          consultant_pattern: {
            date: 'DESC'
          }
        },
        take: 5,
        relations: {
          consultant_pattern: true
        }
      })
    ])
    const app = [...labApp, ...conApp]
    const appSort = app.sort((a, b) => {
      const aDate = new Date(a.created_at.toString()).getTime()
      const bDate = new Date(b.created_at.toString()).getTime()
      return bDate - aDate
    })
    return {
      appSort: appSort.slice(0, 5)
    }
  }

  async getConsultants(page: string, limit: string, isBan: boolean | undefined, full_name: string) {
    const pageNumber = parseInt(page) || 1
    const limitNumber = parseInt(limit) || 10
    const skip = (pageNumber - 1) * limitNumber
    const [consultants, total] = await accountRepo.findAndCount({
      where: {
        role: Role.CONSULTANT,
        ...(isBan !== undefined && { is_banned: isBan }),
        ...(full_name && { full_name: Like(`%${full_name}%`) })
      },
      skip,
      take: limitNumber
    })
    return {
      consultants,
      totalPage: Math.ceil(total / limitNumber)
    }
  }

  async getStaffs(page: string, limit: string, isBan: boolean | undefined, full_name: string) {
    const pageNumber = parseInt(page) || 1
    const limitNumber = parseInt(limit) || 10
    const skip = (pageNumber - 1) * limitNumber
    const [staffs, total] = await accountRepo.findAndCount({
      where: {
        role: Role.STAFF,
        ...(isBan !== undefined && { is_banned: isBan }),
        ...(full_name && { full_name: Like(`%${full_name}%`) })
      },
      skip,
      take: limitNumber
    })
    return {
      staffs,
      totalPage: Math.ceil(total / limitNumber)
    }
  }

  async getConApp(
    pageVar: { limit: number; page: number },
    filter: { fullname: string; status: number; date: string }
  ) {
    const { limit, page } = pageVar
    const { fullname, status, date } = filter
    const skip = (page - 1) * limit
    const conApp = await conAppRepo.findAndCount({
      where: {
        customer: {
          full_name: fullname ? Like(`%${fullname}%`) : undefined
        },
        status: status ? stringToStatus(status) : undefined,
        consultant_pattern: {
          date: date ? new Date(date) : undefined
        }
      },
      skip,
      take: limit,
      relations: {
        customer: true,
        consultant_pattern: true
      }
    })
    return conApp
  }

  async getLabApp(
    pageVar: { limit: number; page: number },
    filter: { fullname: string; status: string; date: string }
  ) {
    const { limit, page } = pageVar
    const skip = (page - 1) * limit

    const { fullname, status, date } = filter
    const dateFilter = !date || date === '' ? null : new Date(date)
    const searchFilter = !fullname || fullname === '' ? null : `%${fullname}%`
    const statusFilter = status === 'all' ? null : status
    const [appointments, total] = await labAppRepo.findAndCount({
      where: {
        ...(searchFilter && {
          customer: {
            full_name: Like(searchFilter)
          }
        }),
        ...(statusFilter &&
          (statusFilter === 'cancelled'
            ? {
              status: In([StatusAppointment.PENDING_CANCELLED, StatusAppointment.CONFIRMED_CANCELLED])
            }
            : {
              status: statusFilter as StatusAppointment
            })),
        ...(dateFilter && {
          date: dateFilter
        })
      },
      skip,
      take: limit,
      relations: ['laborarity', 'working_slot', 'result', 'customer']
    })

    const app: any[] = []
    for (const appointment of appointments) {
      let isRequestedRefund = false
      let isRefunded = false
      let amount = 0
      if (appointment.status === StatusAppointment.CONFIRMED_CANCELLED) {
        const transaction = await transactionRepository.findOne({
          where: { app_id: 'Lab_' + appointment.app_id },
          relations: ['refund']
        })
        if (transaction && transaction.refund) {
          isRequestedRefund = true
          if (transaction.refund.is_refunded) {
            isRefunded = true
          }
        }
      }
      appointment.laborarity.forEach((lab) => {
        amount += lab.price
      })
      const appData = {
        date: appointment.date,
        time: appointment.working_slot.start_at.slice(0, 5) + ' - ' + appointment.working_slot.end_at.slice(0, 5),
        lab: appointment.laborarity,
        description: appointment.description,
        result: appointment.result,
        status: appointment.status,
        app_id: appointment.app_id,
        feed_id: appointment.feed_id,
        isRequestedRefund,
        isRefunded,
        customer: appointment.customer,
        created_at: appointment.created_at,
        amount
      }
      app.push(appData)
    }
    console.log(app)
    return {
      labApp: app,
      pages: Math.ceil(total / limit)
    }
  }

  async getMensOverall() {
    const today = new Date()
    const startOfMonthDate = startOfMonth(today)
    const endOfMonthDate = endOfMonth(today)
    const [totalMens, totalMensMonth, totalPeriod, totalMensDate] = await Promise.all([
      mensRepo.count(),
      mensRepo.count({
        where: {
          created_at: Between(startOfMonthDate, endOfMonthDate)
        }
      }),
      mensRepo.sum('period'),
      mensRepo
        .createQueryBuilder('MenstrualCycle')
        // EXTRACT(EPOCH FROM ...) sẽ lấy ra tổng số giây giữa 2 mốc thời gian
        .select(
          'SUM(EXTRACT(EPOCH FROM ("MenstrualCycle"."end_date" - "MenstrualCycle"."start_date")))',
          'totalSeconds'
        )
        .getRawOne()
    ])
    // kết quả trả về là tổng số giây, ví dụ: { totalSeconds: '2592000' }
    const totalSeconds = parseFloat(totalMensDate.totalSeconds) || 0

    // Chuyển đổi từ giây sang ngày
    const totalDays = totalSeconds / (60 * 60 * 24)
    return {
      totalMens,
      totalMensMonth,
      averagePeriod: (totalPeriod as number) / totalMens,
      averageDays: totalDays / totalMens
    }
  }

  async getMensAgePercent() {
    const result = await accountRepo
      .createQueryBuilder('account')
      .select(
        `
      CASE
          WHEN TIMESTAMPDIFF(YEAR, account.dob, CURDATE()) BETWEEN 15 AND 19 THEN '15-19 tuổi'
          WHEN TIMESTAMPDIFF(YEAR, account.dob, CURDATE()) BETWEEN 20 AND 24 THEN '20-24 tuổi'
          WHEN TIMESTAMPDIFF(YEAR, account.dob, CURDATE()) BETWEEN 25 AND 29 THEN '25-29 tuổi'
          WHEN TIMESTAMPDIFF(YEAR, account.dob, CURDATE()) BETWEEN 30 AND 34 THEN '30-34 tuổi'
          WHEN TIMESTAMPDIFF(YEAR, account.dob, CURDATE()) BETWEEN 35 AND 39 THEN '35-39 tuổi'
          WHEN TIMESTAMPDIFF(YEAR, account.dob, CURDATE()) > 40 THEN '>40 tuổi'
          ELSE 'Nhóm khác'
      END`,
        'ageGroup'
      ) // Đặt tên cho cột kết quả là "ageGroup"
      .addSelect('COUNT(account.account_id)', 'userCount') // Đếm số lượng user trong mỗi nhóm
      .where('account.role = :role', { role: Role.CUSTOMER })
      .andWhere('account.is_banned = :isBanned', { isBanned: false })
      .andWhere('account.menstrual_cycle IS NOT NULL')
      .groupBy('ageGroup') // Nhóm kết quả lại theo các nhóm tuổi
      .getRawMany() // Lấy kết quả thô
    return { ...result }
  }

  async getMensPeriodPercent() {
    const result = await mensRepo
      .createQueryBuilder('menstrual_cycle')
      .select(
        `
      CASE
          WHEN menstrual_cycle.period BETWEEN 21 AND 24 THEN '21-24 ngày'
          WHEN menstrual_cycle.period BETWEEN 25 AND 27 THEN '25-27 ngày'
          WHEN menstrual_cycle.period BETWEEN 28 AND 30 THEN '28-30 ngày'
          WHEN menstrual_cycle.period > 30 THEN '>30 ngày'
          ELSE 'Nhóm khác'
      END`,
        'periodGroup'
      ) // Đặt tên cho cột kết quả là "ageGroup"
      .addSelect('COUNT(menstrual_cycle.cycle_id)', 'mensCount') // Đếm số lượng user trong mỗi nhóm
      .groupBy('periodGroup') // Nhóm kết quả lại theo các nhóm tuổi
      .getRawMany() // Lấy kết quả thô
    return { ...result }
  }

  async getBlogs(
    pageVar: { limit: number; page: number },
    filter: { title: string; content: string; author: string; status: string }
  ) {
    const { limit, page } = pageVar
    const skip = (page - 1) * limit
    const { title, content, author, status } = filter
    const [result, total] = await blogRepo.findAndCount({
      order: {
        created_at: 'DESC'
      },
      skip,
      take: limit,
      where: {
        title: title ? Like(`%${title}%`) : undefined,
        content: content ? Like(`%${content}%`) : undefined,
        account: {
          full_name: author ? Like(`%${author}%`) : undefined
        },
        ...(status && status !== 'all' && {
          status: status === 'true' ? true : false
        })
      },
      relations: {
        account: true
      }
    })
    const resultNew: any[] = []
    result.forEach((element: Blog) => {
      const blog = {
        title: element.title,
        content: element.content,
        author: element.account.full_name,
        image: element.images,
        status: element.status,
        created_at: element.created_at,
        blog_id: element.blog_id,
        major: element.major
      }
      resultNew.push(blog)
    })
    return {
      result: resultNew,
      totalPage: Math.ceil(total / limit)
    }
  }

  async setBlogStatus(blog_id: string, status: string) {
    const blog = await blogRepo.findOne({
      where: { blog_id }
    })
    if (!blog) {
      throw new ErrorWithStatus({
        message: MANAGER_MESSAGES.BLOG_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    blog.status = status === 'true' ? true : false
    await blogRepo.save(blog)
    return {
      message: MANAGER_MESSAGES.BLOG_STATUS_UPDATED,
      status: HTTP_STATUS.OK
    }
  }

  async getQuestions(pageVar: { limit: number; page: number }, status: string | undefined, isReplied: string | undefined) {
    const { limit, page } = pageVar
    const skip = (page - 1) * limit
    console.log("status", status, "isReplied", isReplied)
    const [result, total] = await questionRepo.findAndCount({
      order: {
        created_at: 'DESC'
      },
      where: {
        ...(status && { status: status === 'true' ? true : false }),
        ...(isReplied && { is_replied: isReplied === 'true' ? true : false })
      },
      skip,
      take: limit,
      relations: {
        reply: {
          consultant: true
        },
        customer: true,
      }
    })
    const resultNew: any[] = []
    result.forEach((element: Question) => {
      const question = {
        ques_id: element.ques_id,
        customer_name: element.customer.full_name,
        customer_email: element.customer.email,
        content: element.content,
        status: element.status,
        created_at: element.created_at,
        is_replied: element.is_replied,
        reply: element.reply
          ? {
            content: element.reply.content,
            created_at: element.reply.created_at,
            created_by: element.reply.consultant.full_name
          }
          : {
            content: null,
            created_at: null,
            created_by: null
          }
      }
      resultNew.push(question)
    })
    return {
      questions: resultNew,
      totalPage: Math.ceil(total / limit)
    }
  }

  async getRefundInfoByAppId(app_id: string): Promise<Refund | null> {
    const labApp = await labAppRepo.findOne({
      where: { app_id }
    })

    if (!labApp) {
      throw new ErrorWithStatus({
        message: MANAGER_MESSAGES.LAB_APP_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const transaction = await transactionRepository.findOne({
      where: { app_id: 'Lab_' + labApp.app_id },
      relations: ['refund']
    })

    if (transaction && transaction.refund) {
      return transaction.refund
    }

    return null
  }

  async refundLabAppointment(app_id: string): Promise<void> {
    const labApp = await labAppRepo.findOne({
      where: { app_id }
    })

    if (!labApp) {
      throw new ErrorWithStatus({
        message: MANAGER_MESSAGES.LAB_APP_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const transaction = await transactionRepository.findOne({
      where: { app_id: 'Lab_' + labApp.app_id },
      relations: ['refund']
    })

    if (!transaction || !transaction.refund || transaction.refund.is_refunded) {
      throw new ErrorWithStatus({
        message: MANAGER_MESSAGES.REFUND_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    transaction.refund.is_refunded = true
    await refundRepository.save(transaction.refund)
  }

  async setQuestionStatus(ques_id: string, status: string) {
    const question = await questionRepo.findOne({
      where: { ques_id }
    })
    if (!question) {
      throw new ErrorWithStatus({
        message: MANAGER_MESSAGES.QUESTION_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    question.status = status === 'true' ? true : false
    const result = await questionRepo.save(question)
    return result;

  }

  async getConsultantPatternByWeek(consultant_id: string, start_date: string) {
    const startDate = new Date(start_date) //start from Monday
    const endDate = addDays(startDate, 7)
    const patterns = await conPatternRepo.find({
      where: {
        account_id: consultant_id,
        date: Between(startDate, endDate)
      },
      relations: {
        working_slot: true
      }
    })

    let result: any = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: []
    }

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']//start from Monday
    for (const pattern of patterns) {
      const day = days[new Date(pattern.date).getDay()]
      result[day].push(pattern.working_slot.name.split('-')[0].trim());
    }
    return result;
  }

  async createConsultantPattern(consultant_id: string, date: string, working_slot_ids: string[]) {
    const consultant = await accountRepo.findOne({
      where: {
        account_id: consultant_id
      }
    })
    if (!consultant) {
      throw new ErrorWithStatus({
        message: MANAGER_MESSAGES.CONSULTANT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    let result: any = []
    await Promise.all(working_slot_ids.map(async (working_slot_id) => {
      console.log("working_slot_id", working_slot_id);
      const working_slot = await workingSlotRepo.findOne({
        where: {
          slot_id: working_slot_id
        }
      })
      if (!working_slot) {
        console.log("working_slot not found");
        return;
      }
      const existingPattern = await conPatternRepo.findOne({
        where: {
          account_id: consultant_id,
          date: new Date(date),
          working_slot: {
            slot_id: working_slot_id
          }
        },
        relations: {
          working_slot: true
        }
      })
      if (existingPattern) {
        console.log("pattern already exists");
        return;
      }
      const newPattern = new ConsultantPattern()
      newPattern.account_id = consultant_id
      newPattern.date = new Date(date)
      newPattern.working_slot = working_slot
      const resultPattern = await conPatternRepo.save(newPattern)
      result.push(resultPattern)
    }))
    return result;
  }

  async getStaffPatternByWeek(staff_id: string, start_date: string) {
    const startDate = new Date(start_date) //start from Monday
    const endDate = addDays(startDate, 7)
    const patterns = await staffPatternRepo.find({
      where: {
        account_id: staff_id,
        date: Between(startDate, endDate)
      },
      relations: {
        working_slot: true
      }
    })
    let result: any = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: []
    }
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']//start from Monday
    for (const pattern of patterns) {
      const day = days[new Date(pattern.date).getDay()]
      result[day].push(pattern.working_slot.name.split('-')[0].trim());
    }
    return result;
  }


  async createStaffPattern(staff_id: string, date: string, working_slot_id: string) {
    const staff = await accountRepo.findOne({
      where: {
        account_id: staff_id
      }
    })
    if (!staff) {
      throw new ErrorWithStatus({
        message: MANAGER_MESSAGES.STAFF_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const working_slot = await workingSlotRepo.findOne({
      where: {
        slot_id: working_slot_id
      }
    })
    if (!working_slot) {
      throw new ErrorWithStatus({
        message: MANAGER_MESSAGES.WORKING_SLOT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const existingPattern = await staffPatternRepo.findOne({
      where: {
        account_id: staff_id,
        date: new Date(date),
        working_slot: {
          slot_id: working_slot_id
        }
      }
    })
    if (existingPattern) {
      throw new ErrorWithStatus({
        message: MANAGER_MESSAGES.PATTERN_ALREADY_EXISTS,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
    const newPattern = new StaffPattern()
    newPattern.account_id = staff_id
    newPattern.date = new Date(date)
    newPattern.working_slot = working_slot
    const resultPattern = await staffPatternRepo.save(newPattern)
    return resultPattern;
  }

}
const managerService = new ManagerService()
export default managerService
