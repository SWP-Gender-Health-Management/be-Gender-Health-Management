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

// router.post(
//   '/',
//   validateAccessToken,
//   restrictTo(Role.CUSTOMER),
//   QuestionController.validateQuestionInput,
//   questionController.create
// )
router.post(
  '/',
  wrapRequestHandler(createQuestion)
)

// router.get('/', validateAccessToken, restrictTo(Role.ADMIN, Role.CUSTOMER), questionController.getAll)
router.get('/', wrapRequestHandler(getAllQuestions))

// router.get('/:ques_id', validateAccessToken, restrictTo(Role.ADMIN, Role.CUSTOMER), questionController.getById)
router.get('/:ques_id', wrapRequestHandler(getQuestionById))

// router.get('/customer/:customer_id', validateAccessToken, restrictTo(Role.ADMIN, Role.CUSTOMER), questionController.getByCustomerId)
router.get('/customer/:customer_id', wrapRequestHandler(getQuestionsByCustomerId))

// router.put(
//   '/:ques_id',
//   validateAccessToken,
//   restrictTo(Role.CUSTOMER),
//   QuestionController.validateQuestionInput,
//   questionController.update
// )
router.put(
  '/:ques_id',
  wrapRequestHandler(updateQuestion)
)

// router.delete('/:ques_id', validateAccessToken, restrictTo(Role.ADMIN, Role.CUSTOMER), questionController.delete)
router.delete('/:ques_id', wrapRequestHandler(deleteQuestion))

export default router