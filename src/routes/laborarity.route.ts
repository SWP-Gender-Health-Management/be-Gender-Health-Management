import { Router } from 'express'
import {
  createLaboratory,
  deleteLaboratory,
  getAllLaboratories,
  getLaboratoryById,
  updateLaboratory
} from '../controllers/laborarity.controller.js'
import { validateAccessToken, restrictTo } from '../middlewares/account.middleware.js'
import { Role } from '../enum/role.enum.js'
import wrapRequestHandler from '../utils/handle.js'

const laborarityRoute = Router()

//Create a new laboratory (admin only)
laborarityRoute.post(
  '/create-laboratory',
  validateAccessToken,
  restrictTo(Role.ADMIN),
  wrapRequestHandler(createLaboratory)
)

//Get all laboratories (admin or user)
laborarityRoute.get(
  '/get-all-laboratories',
  // validateAccessToken,
  restrictTo(Role.ADMIN, Role.CUSTOMER),
  wrapRequestHandler(getAllLaboratories)
)

// Get a laboratory by ID (admin or user)
laborarityRoute.get(
  '/get-laboratory-by-id/:lab_id',
  // validateAccessToken,
  restrictTo(Role.ADMIN),
  wrapRequestHandler(getLaboratoryById)
)

// Update a laboratory (admin only)
laborarityRoute.put(
  '/update-laboratory/:lab_id',
  // validateAccessToken,
  restrictTo(Role.ADMIN),
  wrapRequestHandler(updateLaboratory)
)

// Delete a laboratory (admin only)
laborarityRoute.delete(
  '/delete-laboratory/:lab_id',
  // validateAccessToken,
  restrictTo(Role.ADMIN),
  wrapRequestHandler(deleteLaboratory)
)

export default laborarityRoute
