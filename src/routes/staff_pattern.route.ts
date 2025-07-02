import { Router } from 'express'
import {
  addStaffPatternController,
  deleteStaffPatternController,
  getAllStaffPatternController,
  getStaffPatternController,
  updateStaffPatternController
} from '../controllers/staff_pattern.controller.js'
import { validateAddStaffPattern, validateUpdateStaffPattern } from '../middlewares/staff_pattern.middleware.js'
import wrapRequestHandler from '../utils/handle.js'
import { Role } from '~/enum/role.enum.js'
import { restrictTo } from '~/middlewares/account.middleware.js'

const staffPatternRoute = Router()

/*
  description: add new staff pattern
  method: POST
  path: /staff-pattern
  body: {
    name: string
    description: string
  }
*/
staffPatternRoute.post(
  '/add-staff-pattern',
  restrictTo(Role.ADMIN),
  validateAddStaffPattern,
  wrapRequestHandler(addStaffPatternController)
)

/*
  description: get staff pattern
  method: GET
  path: /staff-pattern
  body: {
    date: string
  }
*/
staffPatternRoute.get('/get-staff-pattern', restrictTo(Role.ADMIN), wrapRequestHandler(getStaffPatternController))

/*
  description: get all staff pattern
  method: GET
  path: /staff-pattern/all
  body: {}
*/
staffPatternRoute.get(
  '/get-all-staff-pattern',
  restrictTo(Role.ADMIN),
  wrapRequestHandler(getAllStaffPatternController)
)

/*
  description: update staff pattern
  method: PUT
  path: /staff-pattern
  body: {
    date?: string
    account_id?: string
    working_slot_id?: string
  }
*/
staffPatternRoute.put(
  '/update-staff-pattern',
  restrictTo(Role.ADMIN),
  validateUpdateStaffPattern,
  wrapRequestHandler(updateStaffPatternController)
)

/*
  description: delete staff pattern
  method: DELETE
  path: /staff-pattern
  body: {
    date: string
  }
*/
staffPatternRoute.delete(
  '/delete-staff-pattern',
  restrictTo(Role.ADMIN),
  wrapRequestHandler(deleteStaffPatternController)
)

export default staffPatternRoute
