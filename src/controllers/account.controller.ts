import { NextFunction, Request, Response } from 'express';
import redisClient from '~/config/redis.config';
import HTTP_STATUS from '~/constants/httpStatus';
import { USERS_MESSAGES } from '~/constants/message';
import { ErrorWithStatus } from '~/models/Error';
import accountService from '~/services/account.service';
import refreshTokenService from '~/services/refresh_token.service';

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Account:
 *       type: object
 *       properties:
 *         account_id:
 *           type: string
 *           description: The unique ID of the account
 *         full_name:
 *           type: string
 *           nullable: true
 *           description: The full name of the user
 *         email:
 *           type: string
 *           description: The email address of the user
 *         phone:
 *           type: string
 *           nullable: true
 *           description: The phone number of the user
 *         dob:
 *           type: string
 *           format: date
 *           nullable: true
 *           description: The date of birth of the user
 *         gender:
 *           type: string
 *           nullable: true
 *           description: The gender of the user
 *         avatar:
 *           type: string
 *           nullable: true
 *           description: The URL of the user's avatar
 *         role:
 *           type: string
 *           enum: [CUSTOMER, CONSULTANT, ADMIN]
 *           description: The role of the user
 *         is_verified:
 *           type: boolean
 *           description: Whether the user's email is verified
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The creation timestamp of the account
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The last update timestamp of the account
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         status:
 *           type: integer
 *     TokenResponse:
 *       type: object
 *       properties:
 *         account_id:
 *           type: string
 *         accessToken:
 *           type: string
 *         refreshToken:
 *           type: string
 *         emailVerifiedToken:
 *           type: string
 *           nullable: true
 */

/**
 * @swagger
 * /account/register:
 *   post:
 *     summary: Register a new account
 *     tags: [Account]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email address
 *               password:
 *                 type: string
 *                 description: The user's password
 *               confirmPassword:
 *                 type: string
 *                 description: Confirmation of the password
 *             required:
 *               - email
 *               - password
 *               - confirmPassword
 *     responses:
 *       201:
 *         description: Account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 result:
 *                   $ref: '#/components/schemas/TokenResponse'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const registerController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await accountService.createAccount(req.body);
  const { account_id, refreshToken } = result;
  const account = JSON.parse((await redisClient.get(account_id)) as string);
  await refreshTokenService.createRefreshToken({ account, token: refreshToken });

  res.status(HTTP_STATUS.CREATED).json({
    message: USERS_MESSAGES.USER_CREATED_SUCCESS,
    result,
  });
};

/**
 * @swagger
 * /account/login:
 *   post:
 *     summary: Login to an account
 *     tags: [Account]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email address
 *               password:
 *                 type: string
 *                 description: The user's password
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 result:
 *                   $ref: '#/components/schemas/TokenResponse'
 *       400:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await accountService.login(req.body);
  const { refreshToken } = result;
  const account = JSON.parse((await redisClient.get(req.body.account_id)) as string);
  await refreshTokenService.updateRefreshToken({ account, token: refreshToken });

  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.USER_LOGGED_IN_SUCCESS,
    result,
  });
};

/**
 * @swagger
 * /account/change-password:
 *   post:
 *     summary: Change the account password
 *     tags: [Account]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email address
 *               password:
 *                 type: string
 *                 description: The current password
 *               new_password:
 *                 type: string
 *                 description: The new password
 *             required:
 *               - email
 *               - password
 *               - new_password
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 result:
 *                   $ref: '#/components/schemas/TokenResponse'
 *       400:
 *         description: Failed to change password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const changePasswordController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await accountService.changePassword(req.body);
  if (!result) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.CHANGE_PASSWORD_FAILED,
      status: 400,
    });
  }
  const account = JSON.parse((await redisClient.get(req.body.account_id)) as string);
  await refreshTokenService.updateRefreshToken({ account, token: result.refreshToken });

  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.PASSWORD_CHANGED_SUCCESS,
    result,
  });
};

/**
 * @swagger
 * /account/verify-email:
 *   post:
 *     summary: Verify email with passcode
 *     tags: [Account]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email address
 *               secretPasscode:
 *                 type: string
 *                 description: The verification passcode sent to the user's email
 *             required:
 *               - email
 *               - secretPasscode
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid or expired passcode
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const verifyEmailController = async (req: Request, res: Response, next: NextFunction) => {
  await accountService.verifyEmail(req.body);
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.EMAIL_VERIFIED_SUCCESS,
  });
};

/**
 * @swagger
 * /account/send-email-verified:
 *   post:
 *     summary: Send email verification code
 *     tags: [Account]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               account_id:
 *                 type: string
 *                 description: The unique ID of the account
 *             required:
 *               - account_id
 *     responses:
 *       200:
 *         description: Email verification code sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Failed to send verification email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const sendEmailVerifiedController = async (req: Request, res: Response, next: NextFunction) => {
  await accountService.sendEmailVerified(req.body.account_id);
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.SEND_EMAIL_VERIFIED_SUCCESS,
  });
};

/**
 * @swagger
 * /account/view-account:
 *   post:
 *     summary: View account details
 *     tags: [Account]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               account_id:
 *                 type: string
 *                 description: The unique ID of the account
 *             required:
 *               - account_id
 *     responses:
 *       200:
 *         description: Account details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 result:
 *                   $ref: '#/components/schemas/Account'
 *       400:
 *         description: Account not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const viewAccountController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await accountService.viewAccount(req.body.account_id);
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.USER_VIEWED_SUCCESS,
    result,
  });
};

/**
 * @swagger
 * /account/update-profile:
 *   post:
 *     summary: Update account profile
 *     tags: [Account]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               account_id:
 *                 type: string
 *                 description: The unique ID of the account
 *               full_name:
 *                 type: string
 *                 nullable: true
 *                 description: The full name of the user
 *               phone:
 *                 type: string
 *                 nullable: true
 *                 description: The phone number of the user
 *               dob:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 description: The date of birth of the user
 *               gender:
 *                 type: string
 *                 nullable: true
 *                 description: The gender of the user
 *             required:
 *               - account_id
 *     responses:
 *       200:
 *         description: Account updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 result:
 *                   $ref: '#/components/schemas/Account'
 *       400:
 *         description: Failed to update account
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const updateAccountController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await accountService.updateProfile(req.body);
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.USER_UPDATED_SUCCESS,
    result,
  });
};

/**
 * @swagger
 * /account/check-email-verified:
 *   post:
 *     summary: Check if email is verified
 *     tags: [Account]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email address
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: Email verification status checked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 result:
 *                   $ref: '#/components/schemas/Account'
 *       400:
 *         description: Email not verified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const checkEmailVerifiedController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await accountService.checkEmailVerified(req.body);
  if (!result) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.EMAIL_NOT_VERIFIED,
      status: 400,
    });
  }
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.EMAIL_VERIFIED_SUCCESS,
    result,
  });
};

/**
 * @swagger
 * /account/logout:
 *   post:
 *     summary: Logout from the account
 *     tags: [Account]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               account_id:
 *                 type: string
 *                 description: The unique ID of the account
 *             required:
 *               - account_id
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Failed to logout
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const logoutController = async (req: Request, res: Response, next: NextFunction) => {
  await refreshTokenService.deleteRefreshToken(req.body.account_id);
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.USER_LOGGED_OUT_SUCCESS,
  });
};