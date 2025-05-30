import { Request, Response, NextFunction } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import laboratoryService from '~/services/laborarity.service'
import { validate } from '~/utils/validations'
import { checkSchema } from 'express-validator'
import { LABORATORIES_MESSAGES } from '~/constants/message'
import { ErrorWithStatus } from '~/models/Error'

export class LaboratoryController {
    // Validation middleware for creating/updating laboratory
    static validateLaboratoryInput = validate(
        checkSchema({
            name: {
                isString: true,
                trim: true,
                isLength: {
                    options: { min: 1, max: 1000 },
                    errorMessage: LABORATORIES_MESSAGES.LABORATORY_NAME_INVALID
                }
            },
            description: {
                isString: true,
                trim: true,
                notEmpty: {
                    errorMessage: LABORATORIES_MESSAGES.LABORATORY_DESCRIPTION_REQUIRED
                }
            },
            price: {
                isFloat: {
                    options: { min: 0 },
                    errorMessage: LABORATORIES_MESSAGES.LABORATORY_PRICE_INVALID
                }
            }
        })
    )

    // Create a new laboratory
    async createLaboratory(req: Request, res: Response, next: NextFunction) {
        try {
            const laboratory = await laboratoryService.createLaboratory(req.body)
            res.status(HTTP_STATUS.CREATED).json({
                message: LABORATORIES_MESSAGES.LABORATORY_CREATED_SUCCESS,
                data: laboratory
            });
            return;
        } catch (error) {
            next(error)
        }
    }

    // Get all laboratories
    async getAllLaboratories(req: Request, res: Response, next: NextFunction) {
        try {
            const laboratories = await laboratoryService.getAllLaboratories()
            res.status(HTTP_STATUS.OK).json({
                message: LABORATORIES_MESSAGES.LABORATORIES_RETRIEVED_SUCCESS,
                data: laboratories
            });
            return;
        } catch (error) {
            next(error)
        }
    }

    // Get a laboratory by ID
    async getLaboratoryById(req: Request, res: Response, next: NextFunction) {
        try {
            const laboratory = await laboratoryService.getLaboratoryById(req.params.lab_id)
            res.status(HTTP_STATUS.OK).json({
                message: LABORATORIES_MESSAGES.LABORATORY_RETRIEVED_SUCCESS,
                data: laboratory
            });
            return;
        } catch (error) {
            next(error)
        }
    }

    // Update a laboratory
    async updateLaboratory(req: Request, res: Response, next: NextFunction) {
        try {
            const laboratory = await laboratoryService.updateLaboratory(req.params.lab_id, req.body)
            res.status(HTTP_STATUS.OK).json({
                message: LABORATORIES_MESSAGES.LABORATORY_UPDATED_SUCCESS,
                data: laboratory
            });
            return;
        } catch (error) {
            next(error)
        }
    }

    // Delete a laboratory
    async deleteLaboratory(req: Request, res: Response, next: NextFunction) {
        try {
            await laboratoryService.deleteLaboratory(req.params.lab_id)
            res.status(HTTP_STATUS.OK).json({
                message: LABORATORIES_MESSAGES.LABORATORY_DELETED_SUCCESS
            });
            return;
        } catch (error) {
            next(error)
        }
    }
}

const laboratoryController = new LaboratoryController();
export default laboratoryController;