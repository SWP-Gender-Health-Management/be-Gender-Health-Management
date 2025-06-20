import { Router } from 'express'
import {
  createConsultantPattern,
  deleteConsultantPattern,
  getAllConsultantPatterns,
  getConsultantPatternById,
  getConsultantPatternByConsultantId, // Thêm import
  getConsultantPatternBySlotId, // Thêm import
  updateConsultantPattern
} from '../controllers/consultant_pattern.controller.js'
import { validateAccessToken, restrictTo } from '../middlewares/account.middleware.js'
import { Role } from '../enum/role.enum.js'
import wrapRequestHandler from '../utils/handle.js'

const consultantPatternRoute = Router()

/*
  Description: Create a new consultant pattern (admin only)
  Method: POST
  Path: /create-consultant-pattern
  Body: {
    
  }
*/
consultantPatternRoute.post(
  '/create-onsultant-attern',
  validateAccessToken,
  restrictTo(Role.ADMIN),
  wrapRequestHandler(createConsultantPattern)
)

/*
  Description: Get all consultant patterns (admin only)
  Method: GET
  Path: /get-all-consultant-patterns
  Body: {
    
  }
*/
consultantPatternRoute.get(
  '/get-all-consultant-patterns',
  validateAccessToken,
  restrictTo(Role.ADMIN, Role.CUSTOMER),
  wrapRequestHandler(getAllConsultantPatterns)
)

/*
  Description: Get a consultant pattern by ID (admin only)
  Method: GET
  Path: /get-consultant-pattern-by-id/:pattern_id
  Body: {
    
  }
*/
consultantPatternRoute.get(
  '/get-consultant-pattern-by-id/:pattern_id',
  validateAccessToken,
  restrictTo(Role.ADMIN, Role.CUSTOMER),
  wrapRequestHandler(getConsultantPatternById)
)

/*
  Description: Get a consultant pattern by consultant ID (admin only)
  Method: GET
  Path: /get-consultant-pattern-by-id/consultant/:consultant_id
  Body: {
    
  }
*/
consultantPatternRoute.get(
  '/get-consultant-pattern-by-id/consultant/:consultant_id',
  validateAccessToken,
  restrictTo(Role.ADMIN, Role.CUSTOMER),
  wrapRequestHandler(getConsultantPatternByConsultantId)
)

/*
  Description: Get a consultant pattern by slot ID (admin only)
  Method: GET
  Path: /get-consultant-pattern-by-id/slot/:slot_id
  Body: {
    
  }
*/
consultantPatternRoute.get(
  '/get-consultant-pattern-by-id/slot/:slot_id',
  validateAccessToken,
  restrictTo(Role.ADMIN, Role.CUSTOMER),
  wrapRequestHandler(getConsultantPatternBySlotId)
)

/*
  Description: Update a consultant pattern (admin only)
  Method: PUT
  Path: /update-consultant-pattern/:pattern_id
  Body: {
    
  }
*/
consultantPatternRoute.put(
  '/update-consultant-pattern/:pattern_id',
  validateAccessToken,
  restrictTo(Role.ADMIN),
  wrapRequestHandler(updateConsultantPattern)
)

/*
  Description: Delete a consultant pattern (admin only)
  Method: DELETE
  Path: /delete-consultant-pattern/:pattern_id
  Body: {
    
  }
*/
consultantPatternRoute.delete(
  '/delete-consultant-pattern/:pattern_id',
  validateAccessToken,
  restrictTo(Role.ADMIN),
  wrapRequestHandler(deleteConsultantPattern)
)

export default consultantPatternRoute
