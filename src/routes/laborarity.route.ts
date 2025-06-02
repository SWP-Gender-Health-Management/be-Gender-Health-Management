import { Router } from 'express'
import {
  createLaboratory,
  deleteLaboratory,
  getAllLaboratories,
  getLaboratoryById,
  updateLaboratory
} from '~/controllers/laborarity.controller'
import { validateAccessToken, restrictTo } from '~/middlewares/account.middleware'
import { Role } from '~/enum/role.enum'
import wrapRequestHandler from '~/utils/handle'

const router = Router()

// Create a new laboratory (admin only)
// router.post(
//   '/',
//   validateAccessToken,
//   restrictTo(Role.ADMIN),
//   wrapRequestHandler(createLaboratory)
// )
router.post(
  '/',
  wrapRequestHandler(createLaboratory)
)

// Get all laboratories (admin or user)
// router.get('/', validateAccessToken, restrictTo(Role.ADMIN, Role.CUSTOMER), getAllLaboratories)
router.get('/', wrapRequestHandler(getAllLaboratories) )

// Get a laboratory by ID (admin or user)
// router.get('/:lab_id', validateAccessToken, restrictTo(Role.ADMIN), wrapRequestHandler(getLaboratoryById))
router.get('/:lab_id', wrapRequestHandler(getLaboratoryById))

// Update a laboratory (admin only)
// router.put(
//   '/:lab_id',
//   validateAccessToken,
//   restrictTo(Role.ADMIN),
//   wrapRequestHandler(updateLaboratory)
// )
router.put(
  '/:lab_id',
  wrapRequestHandler(updateLaboratory)
)

// Delete a laboratory (admin only)
// router.delete('/:lab_id', validateAccessToken, restrictTo(Role.ADMIN), wrapRequestHandler(deleteLaboratory))
router.delete('/:lab_id', wrapRequestHandler(deleteLaboratory))

export default router