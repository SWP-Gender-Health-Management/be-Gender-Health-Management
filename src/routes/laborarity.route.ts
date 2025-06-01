import { Router } from 'express'
import laboratoryController, {LaboratoryController} from '~/controllers/laborarity.controller'
import { validateAccessToken, restrictTo } from '~/middlewares/account.middleware'
import { Role } from '~/enum/role.enum'
import wrapRequestHandler from '~/utils/handle'

const router = Router()

// Create a new laboratory (admin only)
// router.post(
//   '/',
//   validateAccessToken,
//   restrictTo(Role.ADMIN),
//   LaboratoryController.validateLaboratoryInput,
//   wrapRequestHandler(laboratoryController.createLaboratory)
// )
router.post(
  '/',
  wrapRequestHandler(laboratoryController.create)
)

// Get all laboratories (admin or user)
// router.get('/', validateAccessToken, restrictTo(Role.ADMIN, Role.CUSTOMER), laboratoryController.getAllLaboratories)
router.get('/', wrapRequestHandler(laboratoryController.getAll) )

// Get a laboratory by ID (admin or user)
// router.get('/:lab_id', validateAccessToken, restrictTo(Role.ADMIN), wrapRequestHandler(laboratoryController.getLaboratoryById))
router.get('/:lab_id', wrapRequestHandler(laboratoryController.getById))

// Update a laboratory (admin only)
// router.put(
//   '/:lab_id',
//   validateAccessToken,
//   restrictTo(Role.ADMIN),
//   LaboratoryController.validateLaboratoryInput,
//   wrapRequestHandler(laboratoryController.updateLaboratory)
// )
router.put(
  '/:lab_id',
  wrapRequestHandler(laboratoryController.update)
)

// Delete a laboratory (admin only)
// router.delete('/:lab_id', validateAccessToken, restrictTo(Role.ADMIN), wrapRequestHandler(laboratoryController.deleteLaboratory))
router.delete('/:lab_id', wrapRequestHandler(laboratoryController.delete))

export default router