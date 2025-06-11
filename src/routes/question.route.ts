import { Router } from 'express'
import {
  createQuestion,
  deleteQuestion,
  getAllQuestions,
  getQuestionById,
  getQuestionsByCustomerId,
  updateQuestion
} from '~/controllers/question.controller'
import { validateAccessToken, restrictTo } from '~/middlewares/account.middleware'
import { Role } from '~/enum/role.enum'
import wrapRequestHandler from '~/utils/handle'

const router = Router()

router.post(
  '/create-question',
  validateAccessToken,
  restrictTo(Role.CUSTOMER),
  wrapRequestHandler(createQuestion)
)

router.get('/get-all-questions', validateAccessToken, restrictTo(Role.ADMIN, Role.CUSTOMER), wrapRequestHandler(getAllQuestions))


router.get('/get-question-by-id/:ques_id', validateAccessToken, restrictTo(Role.ADMIN, Role.CUSTOMER), wrapRequestHandler(getQuestionById))


router.get('/get-question-by-id/customer/:customer_id', validateAccessToken, restrictTo(Role.ADMIN, Role.CUSTOMER), wrapRequestHandler(getQuestionsByCustomerId))

router.put(
  '/update-question/:ques_id',
  validateAccessToken,
  restrictTo(Role.CUSTOMER),
  wrapRequestHandler(updateQuestion)
)

router.delete('/delete-question/:ques_id', validateAccessToken, restrictTo(Role.ADMIN, Role.CUSTOMER), wrapRequestHandler(deleteQuestion))


export default router