import { Router } from 'express'
import {
  createReply,
  deleteReply,
  getAllReplies,
  getReplyById,
  getRepliesByConsultantId,
  getReplyByQuestionId,
  updateReply
} from '~/controllers/reply.controller'
import { validateAccessToken, restrictTo } from '~/middlewares/account.middleware'
import { Role } from '~/enum/role.enum'
import wrapRequestHandler from '~/utils/handle'

const router = Router()

// router.post(
//   '/',
//   validateAccessToken,
//   restrictTo(Role.CONSULTANT),
//   ReplyController.validateReplyInput,
//   replyController.create
// )
router.post(
  '/',
  wrapRequestHandler(createReply)
)

// router.get('/', validateAccessToken, restrictTo(Role.ADMIN, Role.CONSULTANT, Role.CUSTOMER), replyController.getAll)
router.get('/', wrapRequestHandler(getAllReplies))

// router.get('/:reply_id', validateAccessToken, restrictTo(Role.ADMIN, Role.CONSULTANT, Role.CUSTOMER), replyController.getById)
router.get('/:reply_id', wrapRequestHandler(getReplyById))

// router.get('/consultant/:consultant_id', validateAccessToken, restrictTo(Role.ADMIN, Role.CONSULTANT), replyController.getByConsultantId)
router.get('/consultant/:consultant_id', wrapRequestHandler(getRepliesByConsultantId))

// router.get('/question/:ques_id', validateAccessToken, restrictTo(Role.ADMIN, Role.CONSULTANT, Role.CUSTOMER), replyController.getByQuestionId)
router.get('/question/:ques_id', wrapRequestHandler(getReplyByQuestionId))

// router.put(
//   '/:reply_id',
//   validateAccessToken,
//   restrictTo(Role.CONSULTANT),
//   ReplyController.validateReplyInput,
//   replyController.update
// )
router.put(
  '/:reply_id',
  wrapRequestHandler(updateReply)
)

// router.delete('/:reply_id', validateAccessToken, restrictTo(Role.ADMIN, Role.CONSULTANT), replyController.delete)
router.delete('/:reply_id', wrapRequestHandler(deleteReply))

export default router