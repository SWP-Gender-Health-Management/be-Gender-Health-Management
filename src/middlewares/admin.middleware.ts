import { checkSchema } from 'express-validator'
import { ADMIN_MESSAGES, USERS_MESSAGES } from '../constants/message.js'
import accountService from '../services/account.service.js'
import { validate } from '../utils/validations.js'
import multer from 'multer'
import { NextFunction, Request, Response } from 'express'
import { convertStringToRole, Role } from '~/enum/role.enum.js'

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
    },
    role: {
      isString: true,
      notEmpty: true,
      errorMessage: ADMIN_MESSAGES.ROLE_REQUIRED
    }
  })
)

export const validateUpdateStaffProfile = validate(
  checkSchema({
    specialty: {
      // isString: true,
      // trim: true,
      notEmpty: false,
      errorMessage: ADMIN_MESSAGES.SPECIALTY_REQUIRED
    },
    rating: {
      // isString: true,
      notEmpty: false,
      errorMessage: ADMIN_MESSAGES.RATING_REQUIRED
    },
    description: {
      // isString: true,
      // trim: true,
      notEmpty: false,
      errorMessage: ADMIN_MESSAGES.DESCRIPTION_REQUIRED
    },
    gg_meet: {
      // isString: true,
      // trim: true,
      notEmpty: false,
      errorMessage: ADMIN_MESSAGES.GG_MEET_REQUIRED
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

export const conditionalAdminCheck = (req: Request, res: Response, next: NextFunction) => {
  const { update_role } = req.body
  const parseRole = convertStringToRole(update_role as string)
  if (parseRole === Role.CONSULTANT) {
    // Nếu client yêu cầu kiểm tra an ninh (secure=true),
    // thì cho phép đi tiếp đến middleware tiếp theo (là restrictTo).
    console.log('Điều kiện secure=true được áp dụng. Sẽ kiểm tra quyền Admin.')
    return next('route')
  } else {
    // Nếu không, bỏ qua các middleware còn lại của route này
    // và nhảy đến route tiếp theo (là route không cần quyền).
    console.log('Bỏ qua kiểm tra quyền Admin.')
    return next()
  }
}
