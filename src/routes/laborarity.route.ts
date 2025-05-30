import { Router } from 'express'
import laboratoryController from '~/controllers/laborarity.controller'
import {LaboratoryController} from '~/controllers/laborarity.controller'
import { validateAccessToken, restrictTo } from '~/middlewares/account.middleware'
import { Role } from '~/enum/role.enum'

const router = Router()

// Create a new laboratory (admin only)
router.post(
  '/',
  validateAccessToken,
  restrictTo(Role.ADMIN),
  LaboratoryController.validateLaboratoryInput,
  laboratoryController.createLaboratory
)

// Get all laboratories (admin or user)
router.get('/', validateAccessToken, restrictTo(Role.ADMIN, Role.CUSTOMER), laboratoryController.getAllLaboratories)

// Get a laboratory by ID (admin or user)
router.get('/:lab_id', validateAccessToken, restrictTo(Role.ADMIN), laboratoryController.getLaboratoryById)

// Update a laboratory (admin only)
router.put(
  '/:lab_id',
  validateAccessToken,
  restrictTo(Role.ADMIN),
  LaboratoryController.validateLaboratoryInput,
  laboratoryController.updateLaboratory
)

// Delete a laboratory (admin only)
router.delete('/:lab_id', validateAccessToken, restrictTo(Role.ADMIN), laboratoryController.deleteLaboratory)

export default router