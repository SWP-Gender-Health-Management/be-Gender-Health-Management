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

router.post(
  '/create-reply',
  validateAccessToken,
  restrictTo(Role.CONSULTANT),
  wrapRequestHandler(createReply)
)


router.get('/get-all-replies', validateAccessToken, restrictTo(Role.ADMIN, Role.CONSULTANT, Role.CUSTOMER), wrapRequestHandler(getAllReplies))


router.get('/get-reply-by-id/:reply_id', validateAccessToken, restrictTo(Role.ADMIN, Role.CONSULTANT, Role.CUSTOMER), wrapRequestHandler(getReplyById))


router.get('/get-reply-by-id/consultant/:consultant_id', validateAccessToken, restrictTo(Role.ADMIN, Role.CONSULTANT), wrapRequestHandler(getRepliesByConsultantId))


router.get('/get-reply-by-id/question/:ques_id', validateAccessToken, restrictTo(Role.ADMIN, Role.CONSULTANT, Role.CUSTOMER), wrapRequestHandler(getReplyByQuestionId))


router.put(
  '/update-reply/:reply_id',
  validateAccessToken,
  restrictTo(Role.CONSULTANT),
  wrapRequestHandler(updateReply)
)


router.delete('/delete-reply/:reply_id', validateAccessToken, restrictTo(Role.ADMIN, Role.CONSULTANT), wrapRequestHandler(deleteReply))


export default router