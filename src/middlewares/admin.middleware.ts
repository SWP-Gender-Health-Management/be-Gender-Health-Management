import { checkSchema } from 'express-validator'
import { ADMIN_MESSAGES } from '../constants/message.js'
import accountService from '../services/account.service.js'
import { validate } from '../utils/validations.js'
import multer from 'multer'

export const validateCreateAccount = validate(
  checkSchema({
    full_name: {
      isString: true,
      trim: true,
      notEmpty: true,
      isLength: {
        options: { min: 1, max: 100 }
      },
      errorMessage: ADMIN_MESSAGES.FULL_NAME_REQUIRED
    },
    email: {
      isEmail: true,
      trim: true,
      notEmpty: true,
      isLength: {
        options: { min: 1, max: 100 }
      },
      custom: {
        options: async (email) => {
          const account = await accountService.checkEmailExist(email)
          if (account) {
            throw new Error(ADMIN_MESSAGES.EMAIL_ALREADY_EXISTS)
          }
        }
      },
      errorMessage: ADMIN_MESSAGES.EMAIL_REQUIRED
    },
    password: {
      isString: true,
      trim: true,
      notEmpty: true,
      isLength: {
        options: { min: 1, max: 100 }
      },
      isStrongPassword: {
        options: {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        }
      },
      errorMessage: ADMIN_MESSAGES.PASSWORD_REQUIRED
    }
  })
)

export const validateBanAccount = validate(
  checkSchema({
    account_id: {
      isUUID: true,
      trim: true,
      notEmpty: true,
      errorMessage: ADMIN_MESSAGES.ACCOUNT_ID_REQUIRED
    }
  })
)

// Sử dụng memoryStorage để không lưu file tạm ra đĩa
const storage = multer.memoryStorage()

export const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/html') {
      cb(null, true)
    } else {
      cb(new Error('Chỉ chấp nhận file .html!') as any, false)
    }
  },
  limits: { fileSize: 1024 * 1024 * 2 } // 2MB
})
