export const HTTP_MESSAGE = {
  SUCCESS: 'Success',
  ERROR: 'Error',
  NOT_FOUND: 'Not found',
  BAD_REQUEST: 'Bad request',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  CONFLICT: 'Conflict',
  UNPROCESSABLE_ENTITY: 'Unprocessable entity',
  TOO_MANY_REQUESTS: 'Too many requests',
  SERVICE_UNAVAILABLE: 'Service unavailable',
  GATEWAY_TIMEOUT: 'Gateway timeout'
}

export const USERS_MESSAGES = {
  VALIDATION_ERROR: 'Validation error',
  USER_NOT_FOUND: 'User not found',
  USER_ALREADY_EXISTS: 'User already exists',
  USER_CREATED_SUCCESS: 'User created successfully',
  USER_UPDATED_SUCCESS: 'User updated successfully',
  EMAIL_ALREADY_EXIST: 'Email already exists',
  PASSWORD_MUST_BE_AT_LEAST_6_CHARACTERS: 'Password must be at least 6 characters long',
  PASSWORD_INVALID: 'Password must contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol',
  CONFIRM_PASSWORD_MUST_MATCH: 'Confirm password must match password',
  USER_REGISTERED_SUCCESS: 'User registered successfully',
  EMAIL_NOT_FOUND: 'Email not found',
  USER_LOGGED_IN_SUCCESS: 'User logged in successfully',
  EMAIL_OR_PASSWORD_INVALID: 'Email or password invalid',
  NEW_PASSWORD_MUST_BE_DIFFERENT: 'New password must be different from the old password',
  PASSWORD_CHANGED_SUCCESS: 'Password changed successfully',
  ACCESS_TOKEN_REQUIRED: 'Access token is required',
  CHANGE_PASSWORD_FAILED: 'Change password failed',
  ACCOUNT_ALREADY_EXISTS: 'Account already exists',
  ACCOUNT_NOT_FOUND: 'Account not found',
  SECRET_PASSCODE_MUST_BE_6_CHARACTERS: 'Secret passcode must be 6 characters long',
  EMAIL_VERIFIED_SUCCESS: 'Email verified successfully',
  EMAIL_ALREADY_VERIFIED: 'Email already verified',
  SECRET_PASSCODE_MISMATCH: 'Secret passcode mismatch',
  FULL_NAME_INVALID: 'Fullname is invalid',
  PHONE_INVALID: 'Phone is invalid',
  DOB_INVALID: 'Date of birth is invalid',
  GENDER_INVALID: 'Gender is invalid',
  USER_VIEWED_SUCCESS: 'User viewed successfully',
  EMAIL_NOT_VERIFIED: 'Email not verified',
  EMAIL_VERIFIED_TOKEN_EXPIRED: 'Email verified token expired',
  USER_LOGGED_OUT_SUCCESS: 'User logged out successfully',
  SEND_EMAIL_VERIFIED_SUCCESS: 'Send email verified successfully',
  YOU_ARE_NOT_FEMALE: 'You are not female',
  PASSWORD_INVALID_OLD: 'Password is invalid'
}

export const CUSTOMER_MESSAGES = {
  CREATE_MENSTRUAL_CYCLE_SUCCESS: 'Menstrual cycle created successfully',
  PREDICT_PERIOD_SUCCESS: 'Period predicted successfully',
  START_DATE_GREATER_THAN_END_DATE: 'Start date must be before end date',
  END_DATE_GREATER_THAN_CURRENT_DATE: 'End date must be greater than current date',
  PERIOD_INVALID: 'Period must be a number',
  START_DATE_INVALID: 'Start date is invalid',
  END_DATE_INVALID: 'End date is invalid',
  NOTE_INVALID: 'Note is invalid',
  MENSTRUAL_CYCLE_NOT_FOUND: 'Menstrual cycle not found',
  MENSTRUAL_CYCLE_UPDATED: 'Menstrual cycle updated successfully',
  MENSTRUAL_CYCLE_SCHEDULED_NOTIFICATION: 'Menstrual cycle scheduled notification',
  MENSTRUAL_CYCLE_ALREADY_EXISTS: 'Menstrual cycle already exists',
  LABORARITY_ID_INVALID: 'Laborarity id is invalid',
  SLOT_ID_INVALID: 'Slot id is invalid',
  DATE_INVALID: 'Date is invalid',
  ACCOUNT_ID_INVALID: 'Account id is invalid',
  LABORARITY_APPOINTMENT_CREATED_SUCCESS: 'Laborarity appointment created successfully',
  LABORARITY_NOT_ENOUGH_STAFF: 'Laborarity not enough staff',
  LABORARITY_NOT_ENOUGH_STAFF_FOR_SLOT: 'Laborarity not enough staff for slot',
  WORKING_SLOT_INVALID: 'Working slot is invalid',
  GET_CUSTOMER_SUCCESS: 'Get customer successfully',
  AMOUNT_INVALID: 'Amount is invalid'
}

export const WORKING_SLOT_MESSAGES = {
  NAME_INVALID: 'Name is invalid',
  START_AT_INVALID: 'Start at is invalid',
  END_AT_INVALID: 'End at is invalid',
  TYPE_INVALID: 'Type is invalid',
  WORKING_SLOT_CREATED_SUCCESS: 'Working slot created successfully',
  WORKING_SLOT_UPDATED_SUCCESS: 'Working slot updated successfully',
  WORKING_SLOT_DELETED_SUCCESS: 'Working slot deleted successfully',
  WORKING_SLOT_NOT_FOUND: 'Working slot not found',
  GET_SLOT_SUCCESS: 'Get slot successfully'
}

export const STAFF_PATTERN_MESSAGES = {
  DATE_INVALID: 'Date is invalid',
  WORKING_SLOT_ID_INVALID: 'Working slot id is invalid',
  ACCOUNT_ID_INVALID: 'Account id is invalid',
  STAFF_PATTERN_DELETED_SUCCESS: 'Staff pattern deleted successfully',
  STAFF_PATTERN_NOT_FOUND: 'Staff pattern not found',
  ADD_STAFF_PATTERN_SUCCESS: 'Add staff pattern successfully',
  GET_STAFF_PATTERN_SUCCESS: 'Get staff pattern successfully',
  GET_ALL_STAFF_PATTERN_SUCCESS: 'Get all staff pattern successfully',
  UPDATE_STAFF_PATTERN_SUCCESS: 'Update staff pattern successfully'
}

export const ADMIN_MESSAGES = {
  ADMIN_CREATED_SUCCESS: 'Admin created successfully',
  MANAGER_CREATED_SUCCESS: 'Manager created successfully',
  STAFF_CREATED_SUCCESS: 'Staff created successfully',
  CONSULTANT_CREATED_SUCCESS: 'Consultant created successfully',
  CUSTOMER_CREATED_SUCCESS: 'Customer created successfully',
  FULL_NAME_REQUIRED: 'Full name is required',
  EMAIL_REQUIRED: 'Email is required',
  PASSWORD_REQUIRED: 'Password is required',
  EMAIL_ALREADY_EXISTS: 'Email already exists'
}

export const LABORARITY_MESSAGES = {
  NAME_REQUIRED: 'Laborarity name is required',
  DESCRIPTION_REQUIRED: 'Laborarity description is required',
  PRICE_REQUIRED: 'Laborarity price is required',
  SPECIMEN_REQUIRED: 'Laborarity specimen is required',
  LABORARITY_CREATED_SUCCESS: 'Laborarity created successfully',
  LABORARITY_NOT_FOUND: 'Laborarity not found'
}

export const TRANSACTION_MESSAGES = {
  APP_ID_INVALID: 'App ID is invalid',
  AMOUNT_INVALID: 'Amount is invalid',
  METHOD_INVALID: 'Method is invalid',
  DATE_INVALID: 'Date is invalid',
  DESCRIPTION_INVALID: 'Description is invalid',
  ACCOUNT_ID_INVALID: 'Account ID is invalid',
  TRANSACTION_CREATED_SUCCESS: 'Transaction created successfully',
  PAYMENT_LINK_CREATED_SUCCESS: 'Payment link created successfully',
  TRANSACTION_ALREADY_PAID: 'Transaction already paid',
  TRANSACTION_NOT_FOUND: 'Transaction not found',
  TRANSACTION_PAID_SUCCESS: 'Transaction paid successfully',
  TRANSACTION_FAILED: 'Transaction failed'
}
