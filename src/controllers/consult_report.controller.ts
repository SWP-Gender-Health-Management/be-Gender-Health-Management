import { Request, Response, NextFunction } from 'express'
import HTTP_STATUS from '~/constants/httpStatus.js'
import { CONSULT_REPORT_MESSAGES } from '~/constants/message.js'
import consultReportService from '~/services/consult_report.service.js'

/**
 * @swagger
 * /consult_report/create-consult-report:
 *   post:
 *     summary: Create a new consult report
 *     description: Creates a new consult report for a consult appointment. Requires consultant role.
 *     tags: [ConsultReports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               app_id:
 *                 type: string
 *                 description: The consult appointment ID (UUID)
 *               name:
 *                 type: string
 *                 description: Name of the report
 *               description:
 *                 type: string
 *                 description: Description of the report
 *             required: [app_id, name, description]
 *     responses:
 *       201:
 *         description: Consult report created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 result:
 *                   $ref: '#/components/schemas/ConsultReport'
 *       400:
 *         description: Bad request (e.g., report already exists, name or description missing)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       401:
 *         description: Unauthorized (invalid token or insufficient role)
 *       404:
 *         description: Not found (consult appointment not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
// Create a new consult report
export const createConsultReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await consultReportService.createConsultReport(req.body)
    res.status(HTTP_STATUS.CREATED).json({
      message: CONSULT_REPORT_MESSAGES.REPORT_CREATED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /consult_report/get-all-consult-reports:
 *   get:
 *     summary: Get all consult reports
 *     description: Retrieves a list of all consult reports with their relation to consult_appointment. Requires admin, consultant, or customer role.
 *     tags: [ConsultReports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Consult reports retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 result:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ConsultReport'
 *       401:
 *         description: Unauthorized (invalid token or insufficient role)
 */
// Get all consult reports
export const getAllConsultReports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {email, account_id, ...filter} = req.body;
    const result = await consultReportService.getAllConsultReports(filter, req.query)
    res.status(HTTP_STATUS.OK).json({
      message: CONSULT_REPORT_MESSAGES.REPORTS_RETRIEVED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /consult_report/get-consult-report-by-id/{report_id}:
 *   get:
 *     summary: Get a consult report by ID
 *     description: Retrieves a consult report by its ID with its relation to consult_appointment. Requires admin, consultant, or customer role.
 *     tags: [ConsultReports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: report_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The consult report ID (UUID)
 *     responses:
 *       200:
 *         description: Consult report retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 result:
 *                   $ref: '#/components/schemas/ConsultReport'
 *       401:
 *         description: Unauthorized (invalid token or insufficient role)
 *       404:
 *         description: Not found (consult report not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
// Get a consult report by ID
export const getConsultReportById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await consultReportService.getConsultReportById(req.params.report_id)
    res.status(HTTP_STATUS.OK).json({
      message: CONSULT_REPORT_MESSAGES.REPORT_RETRIEVED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /consult_report/get-consult-report-by-id/appointment/{app_id}:
 *   get:
 *     summary: Get consult report by consult appointment ID
 *     description: Retrieves a consult report associated with a consult appointment ID with its relation to consult_appointment. Requires admin, consultant, or customer role.
 *     tags: [ConsultReports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: app_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The consult appointment ID (UUID)
 *     responses:
 *       200:
 *         description: Consult report retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 result:
 *                   $ref: '#/components/schemas/ConsultReport'
 *       401:
 *         description: Unauthorized (invalid token or insufficient role)
 *       404:
 *         description: Not found (consult appointment or report not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
// Get consult report by Consult Appointment ID
export const getConsultReportByAppointmentId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await consultReportService.getConsultReportByAppointmentId(req.params.app_id)
    res.status(HTTP_STATUS.OK).json({
      message: CONSULT_REPORT_MESSAGES.REPORT_RETRIEVED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /consult_report/update-consult-report/{report_id}:
 *   put:
 *     summary: Update a consult report
 *     description: Updates an existing consult report. Requires consultant role.
 *     tags: [ConsultReports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: report_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The consult report ID (UUID)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               app_id:
 *                 type: string
 *                 description: The consult appointment ID (UUID)
 *               name:
 *                 type: string
 *                 description: Name of the report
 *               description:
 *                 type: string
 *                 description: Description of the report
 *             required: []
 *     responses:
 *       200:
 *         description: Consult report updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 result:
 *                   $ref: '#/components/schemas/ConsultReport'
 *       400:
 *         description: Bad request (e.g., report already exists for new appointment, name or description missing)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       401:
 *         description: Unauthorized (invalid token or insufficient role)
 *       404:
 *         description: Not found (consult report or appointment not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
// Update a consult report
export const updateConsultReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await consultReportService.updateConsultReport(req.params.report_id, req.body)
    res.status(HTTP_STATUS.OK).json({
      message: CONSULT_REPORT_MESSAGES.REPORT_UPDATED_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /consult_report/delete-consult-report/{report_id}:
 *   delete:
 *     summary: Delete a consult report
 *     description: Deletes a consult report by its ID. Requires admin or consultant role.
 *     tags: [ConsultReports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: report_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The consult report ID (UUID)
 *     responses:
 *       200:
 *         description: Consult report deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *       401:
 *         description: Unauthorized (invalid token or insufficient role)
 *       404:
 *         description: Not found (consult report not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
// Delete a consult report
export const deleteConsultReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await consultReportService.deleteConsultReport(req.params.report_id)
    res.status(HTTP_STATUS.OK).json({
      message: CONSULT_REPORT_MESSAGES.REPORT_DELETED_SUCCESS
    })
  } catch (error) {
    next(error)
  }
}
