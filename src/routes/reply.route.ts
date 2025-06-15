import { Router } from 'express'
import {
  createReply,
  deleteReply,
  getAllReplies,
  getReplyById,
  getRepliesByConsultantId,
  getReplyByQuestionId,
  updateReply
} from '../controllers/reply.controller.js'
import { validateAccessToken, restrictTo } from '../middlewares/account.middleware.js'
import { Role } from '../enum/role.enum.js'
import wrapRequestHandler from '../utils/handle.js'

const replyRoute = Router()

replyRoute.post(
  '/create-reply',
  validateAccessToken,
  restrictTo(Role.CONSULTANT),
  wrapRequestHandler(createReply)
)

/*
  Description: Get all replies (admin, consultant, or customer)
  Method: GET
  Path: /get-all-replies
  Body: {
    
  }
*/
replyRoute.get('/get-all-replies', validateAccessToken, restrictTo(Role.ADMIN, Role.CONSULTANT, Role.CUSTOMER), wrapRequestHandler(getAllReplies))

/*
  Description: Get a reply by ID (admin, consultant, or customer)
  Method: GET
  Path: /get-reply-by-id/:reply_id
  Body: {
    
  }
*/
replyRoute.get('/get-reply-by-id/:reply_id', validateAccessToken, restrictTo(Role.ADMIN, Role.CONSULTANT, Role.CUSTOMER), wrapRequestHandler(getReplyById))

/*
  Description: Get replies by consultant ID (admin or consultant)
  Method: GET
  Path: /get-reply-by-id/consultant/:consultant_id
  Body: {
    
  }
*/
replyRoute.get('/get-reply-by-id/consultant/:consultant_id', validateAccessToken, restrictTo(Role.ADMIN, Role.CONSULTANT), wrapRequestHandler(getRepliesByConsultantId))

/*
  Description: Get replies by question ID (admin, consultant, or customer)
  Method: GET
  Path: /get-reply-by-id/question/:ques_id
  Body: {
    
  }
*/
replyRoute.get('/get-reply-by-id/question/:ques_id', validateAccessToken, restrictTo(Role.ADMIN, Role.CONSULTANT, Role.CUSTOMER), wrapRequestHandler(getReplyByQuestionId))

/*
  Description: Update a reply (consultant only)
  Method: PUT
  Path: /update-reply/:reply_id
  Body: {
    
  }
*/
replyRoute.put(
  '/update-reply/:reply_id',
  validateAccessToken,
  restrictTo(Role.CONSULTANT),
  wrapRequestHandler(updateReply)
)

/*
  Description: Delete a reply (admin or consultant)
  Method: DELETE
  Path: /delete-reply/:reply_id
  Body: {
    
  }
*/
replyRoute.delete('/delete-reply/:reply_id', validateAccessToken, restrictTo(Role.ADMIN, Role.CONSULTANT), wrapRequestHandler(deleteReply))


export default replyRoute