import { Router } from 'express'
import {
  addSlotController,
  deleteSlotController,
  getLabWorkingSlotController,
  getSlotByTypeController,
  getSlotByTypeParamController,
  getSlotController,
  updateSlotController
} from '../controllers/working_slot.controller.js'
import {
  validateDate,
  validateGetSlotByType,
  validateSlot,
  validateUpdateSlot
} from '../middlewares/working_slot.middleware.js'
import wrapRequestHandler from '../utils/handle.js'

const workingSlotRoute = Router()

/*
Description: add a working slot
Method: POST
Path: /working-slots
Request Body:{
  name: string,
  start_at: string,
  end_at: string
  type: enum
}
*/
workingSlotRoute.post('/add-slot', validateSlot, wrapRequestHandler(addSlotController))

/*
Description: get a working slot by type
Method: GET
Path: /working-slots/type
Request Body:{
  type: enum
}
*/
workingSlotRoute.get('/get-slot-by-type', validateGetSlotByType, wrapRequestHandler(getSlotByTypeController))

workingSlotRoute.get('/get-slot-by-type/:type', validateGetSlotByType, wrapRequestHandler(getSlotByTypeParamController))

/*
Description: get a laborarity working slot by id
Method: GET
Path: /lab-working-slots
Request Body:{
  date: string
}
*/
workingSlotRoute.post('/lab-working-slots', validateDate, wrapRequestHandler(getLabWorkingSlotController))

/*
Description: get all working slots
Method: GET
Path: /working-slots
*/
workingSlotRoute.get('/get-all-slot', wrapRequestHandler(getSlotController))

/*
Description: update a working slot
Method: PUT
Path: /working-slots
Request Body:{
  id: string,
  name: string,
  start_at: string,
  end_at: string,
  type: enum
}
*/
workingSlotRoute.put('/update-slot', validateUpdateSlot, wrapRequestHandler(updateSlotController))

/*
Description: delete a working slot
Method: DELETE
Path: /working-slots
Request Body:{
  id: string
}
*/
workingSlotRoute.delete('/delete-slot', wrapRequestHandler(deleteSlotController))

export default workingSlotRoute
