import { Router } from 'express'
import {
  createQuestion,
  deleteQuestion,
  getAllQuestions,
  getQuestionById,
  getQuestionsByCustomerId,
  updateQuestion,
  getRepliedQuestionsByConsultantId,
  getUnrepliedQuestions
} from '../controllers/question.controller.js'
import { validateAccessToken, restrictTo } from '../middlewares/account.middleware.js'
import { Role } from '../enum/role.enum.js'
import wrapRequestHandler from '../utils/handle.js'

const questionRoute = Router()

questionRoute.post(
  '/create-question',
  validateAccessToken,
  // restrictTo(Role.CUSTOMER),
  wrapRequestHandler(createQuestion)
)

questionRoute.get(
  '/get-question-by-id/consultant/:consultant_id',
  validateAccessToken,
  // restrictTo(Role.ADMIN, Role.CUSTOMER),
  wrapRequestHandler(getRepliedQuestionsByConsultantId)
)

questionRoute.get(
  '/get-unreplied-questions',
  validateAccessToken,
  // restrictTo(Role.ADMIN, Role.CUSTOMER),
  wrapRequestHandler(getUnrepliedQuestions)
)

questionRoute.get(
  '/get-all-questions',
  validateAccessToken,
  // restrictTo(Role.ADMIN, Role.CUSTOMER),
  wrapRequestHandler(getAllQuestions)
)

questionRoute.get(
  '/get-question-by-id/:ques_id',
  validateAccessToken,
  restrictTo(Role.ADMIN, Role.CUSTOMER),
  wrapRequestHandler(getQuestionById)
)

questionRoute.get(
  '/get-question-by-id/customer/:customer_id',
  validateAccessToken,
  restrictTo(Role.ADMIN, Role.CUSTOMER),
  wrapRequestHandler(getQuestionsByCustomerId)
)

questionRoute.put(
  '/update-question/:ques_id',
  validateAccessToken,
  restrictTo(Role.CUSTOMER),
  wrapRequestHandler(updateQuestion)
)

questionRoute.delete(
  '/delete-question/:ques_id',
  validateAccessToken,
  restrictTo(Role.ADMIN, Role.CUSTOMER),
  wrapRequestHandler(deleteQuestion)
)

export default questionRoute
