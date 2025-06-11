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

//Create a new laboratory (admin only)
router.post(
  '/create-laboratory',
  validateAccessToken,
  restrictTo(Role.ADMIN),
  wrapRequestHandler(createLaboratory)
)


//Get all laboratories (admin or user)
router.get('/get-all-laboratories', validateAccessToken, restrictTo(Role.ADMIN, Role.CUSTOMER), wrapRequestHandler(getAllLaboratories))


// Get a laboratory by ID (admin or user)
router.get('/get-laboratory-by-id/:lab_id', validateAccessToken, restrictTo(Role.ADMIN), wrapRequestHandler(getLaboratoryById))


// Update a laboratory (admin only)
router.put(
  '/update-laboratory/:lab_id',
  validateAccessToken,
  restrictTo(Role.ADMIN),
  wrapRequestHandler(updateLaboratory)
)


// Delete a laboratory (admin only)
router.delete('/delete-laboratory/:lab_id', validateAccessToken, restrictTo(Role.ADMIN), wrapRequestHandler(deleteLaboratory))


export default router