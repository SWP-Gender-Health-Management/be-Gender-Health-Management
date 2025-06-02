import { Router } from 'express'
import {
  createConsultantPattern,
  deleteConsultantPattern,
  getAllConsultantPatterns,
  getByIdConsultantPattern,
  updateConsultantPattern
}  from '~/controllers/consultant_pattern.controller'
import { validateAccessToken, restrictTo } from '~/middlewares/account.middleware'
import { Role } from '~/enum/role.enum'
import wrapRequestHandler from '~/utils/handle'

const router = Router()

// router.post(
//   '/',
//   validateAccessToken,
//   restrictTo(Role.ADMIN),
//   ConsultantPatternController.validateConsultantPatternInput,
//   consultantPatternController.create
// )
router.post(
  '/',
  wrapRequestHandler(createConsultantPattern)
)

// router.get('/', validateAccessToken, restrictTo(Role.ADMIN, Role.CUSTOMER), consultantPatternController.getAll)
router.get('/', wrapRequestHandler(getAllConsultantPatterns))

// router.get('/:pattern_id', validateAccessToken, restrictTo(Role.ADMIN, Role.CUSTOMER), consultantPatternController.getById)
router.get('/:pattern_id', wrapRequestHandler(getByIdConsultantPattern))

// router.put(
//   '/:pattern_id',
//   validateAccessToken,
//   restrictTo(Role.ADMIN),
//   ConsultantPatternController.validateConsultantPatternInput,
//   consultantPatternController.update
// )
router.put(
  '/:pattern_id',
  updateConsultantPattern
)

// router.delete('/:pattern_id', validateAccessToken, restrictTo(Role.ADMIN), consultantPatternController.delete)
router.delete('/:pattern_id', wrapRequestHandler(deleteConsultantPattern))

export default router