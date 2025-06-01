import { Router } from 'express'
import consultantPatternController, {ConsultantPatternController}  from '~/controllers/consultant_pattern.controller'
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
  consultantPatternController.create
)

// router.get('/', validateAccessToken, restrictTo(Role.ADMIN, Role.CUSTOMER), consultantPatternController.getAll)
router.get('/', consultantPatternController.getAll)

// router.get('/:pattern_id', validateAccessToken, restrictTo(Role.ADMIN, Role.CUSTOMER), consultantPatternController.getById)
router.get('/:pattern_id', consultantPatternController.getById)

// router.put(
//   '/:pattern_id',
//   validateAccessToken,
//   restrictTo(Role.ADMIN),
//   ConsultantPatternController.validateConsultantPatternInput,
//   consultantPatternController.update
// )
router.put(
  '/:pattern_id',
  consultantPatternController.update
)

// router.delete('/:pattern_id', validateAccessToken, restrictTo(Role.ADMIN), consultantPatternController.delete)
router.delete('/:pattern_id', consultantPatternController.delete)

export default router