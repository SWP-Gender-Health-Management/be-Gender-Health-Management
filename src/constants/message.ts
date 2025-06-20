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
  USER_GET_ACCOUNT_ID_SUCCESS: 'Get account ID success',
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
  PASSWORD_INVALID_OLD: 'Password is invalid',
  AUTHORIZATION_INVALID: 'Authorization is invalid',
  EMAIL_NOT_EXIST: 'Email is not exist',
  SEND_PASSCODE_RESET_PASSWORD_SUCCESS: 'Send passcode reset password successfully',
  VERIFY_PASSCODE_RESET_PASSWORD_SUCCESS: 'Verify passcode reset password successfully',
  PERMISSION_DENIED: 'Permission denied',
  REFRESH_TOKEN_SUCCESS: 'Refresh token successfully'
}

export const REFRESH_TOKEN_MESSAGES = {
  REFRESH_TOKEN_NOT_FOUND: 'Refresh token not found',
  INVALID_REFRESH_TOKEN: 'Invalid refresh token'
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
  APPOINTMENT_ID_INVALID: 'Appointment id is invalid',
  STATUS_INVALID: 'Status is invalid',
  NAME_REQUIRED: 'Laborarity name is required',
  DESCRIPTION_REQUIRED: 'Laborarity description is required',
  PRICE_REQUIRED: 'Laborarity price is required',
  SPECIMEN_REQUIRED: 'Laborarity specimen is required',
  LABORARITY_CREATED_SUCCESS: 'Laborarity created successfully',
  LABORARITY_NOT_FOUND: 'Laborarity not found',
  APPOINTMENT_STATUS_UPDATED_SUCCESS: 'Appointment status updated successfully',
  LABORATORIES_RETRIEVED_SUCCESS: 'Laboratories retrieved successfully',
  LABORATORY_CREATED_SUCCESS: 'Laboratory created successfully',
  LABORATORY_NAME_ALREADY_EXISTS: 'Laboratory name already exists',
  LABORATORY_NOT_FOUND: 'Laboratory not found',
  LABORATORY_HAS_APPOINTMENTS: 'Laboratory has appointments',
  LABORATORY_RETRIEVED_SUCCESS: 'Laboratory retrieved successfully',
  LABORATORY_UPDATED_SUCCESS: 'Laboratory updated successfully',
  LABORATORY_DELETED_SUCCESS: 'Laboratory deleted successfully',
  LABORATORY_NAME_INVALID: 'Laboratory name is invalid',
  LABORATORY_DESCRIPTION_REQUIRED: 'Laboratory description is required',
  LABORATORY_PRICE_INVALID: 'Laboratory price is invalid',
  LABORATORY_NAME_REQUIRED: 'Laboratory name is required'
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

export const RESULT_MESSAGES = {
  APP_ID_INVALID: 'App ID is invalid',
  RESULT_INVALID: 'Result is invalid',
  RESULT_CONCLUSION_INVALID: 'Result conclusion is invalid',
  RESULT_NAME_INVALID: 'Result name is invalid',
  RESULT_UNIT_INVALID: 'Result unit is invalid',
  RESULT_NORMAL_RANGE_INVALID: 'Result normal range is invalid',
  RESULT_CREATED_SUCCESS: 'Result created successfully',
  RESULT_CREATE_FAILED: 'Result create failed',
  RESULT_CREATE_NOT_ENOUGH_DATA: 'Result create not enough data'
}

export const STAFF_MESSAGES = {
  STAFF_ID_INVALID: 'Staff id is invalid'
}

export const CONSULTANT_PATTERNS_MESSAGES = {
  WORKING_SLOT_NOT_FOUND: 'Working slot not found',
  CONSULTANT_NOT_FOUND: 'Consultant not found',
  CONSULTANT_PATTERN_ALREADY_EXISTS: 'Consultant pattern already exists for this slot, consultant, and date',
  CONSULTANT_PATTERN_NOT_FOUND: 'Consultant pattern not found',
  CONSULTANT_PATTERN_CANNOT_DELETE: 'Cannot delete booked consultant pattern or one with associated appointments',
  WORKING_SLOT_ID_INVALID: 'Working slot ID must be a valid UUID',
  CONSULTANT_ID_INVALID: 'Consultant ID must be a valid UUID',
  DATE_INVALID: 'Date must be a valid date',
  IS_BOOKED_INVALID: 'is_booked must be a boolean',
  CONSULTANT_PATTERN_CREATED_SUCCESS: 'Consultant pattern created successfully',
  CONSULTANT_PATTERNS_RETRIEVED_SUCCESS: 'Consultant patterns retrieved successfully',
  CONSULTANT_PATTERN_RETRIEVED_SUCCESS: 'Consultant pattern retrieved successfully',
  CONSULTANT_PATTERN_UPDATED_SUCCESS: 'Consultant pattern updated successfully',
  CONSULTANT_PATTERN_DELETED_SUCCESS: 'Consultant pattern deleted successfully',
  ERROR_FETCHING_CONSULTANT_PATTERN: 'Error fetching consultant pattern',
  ERROR_UPDATING_CONSULTANT_PATTERN: 'Error updating consultant pattern',
  ERROR_DELETING_CONSULTANT_PATTERN: 'Error deleting consultant pattern'
}

export const CONSULTANT_APPOINTMENTS_MESSAGES = {
  CONSULT_APPOINTMENT_CREATED_SUCCESS: 'Consult appointment created successfully',
  CONSULT_APPOINTMENTS_RETRIEVED_SUCCESS: 'Consult appointments retrieved successfully',
  CONSULT_APPOINTMENT_RETRIEVED_SUCCESS: 'Consult appointment retrieved successfully',
  CONSULT_APPOINTMENT_UPDATED_SUCCESS: 'Consult appointment updated successfully',
  CONSULT_APPOINTMENT_DELETED_SUCCESS: 'Consult appointment deleted successfully',
  CONSULT_APPOINTMENT_NOT_FOUND: 'Consult appointment not found',
  CONSULTANT_PATTERN_NOT_FOUND: 'Consultant pattern not found',
  CONSULTANT_PATTERN_ALREADY_BOOKED: 'Consultant pattern is already booked',
  CUSTOMER_NOT_FOUND: 'Customer not found',
  CONSULT_APPOINTMENT_CANNOT_DELETE: 'Cannot delete consult appointment with associated feedback'
}

export const QUESTION_MESSAGES = {
  QUESTION_CREATED_SUCCESS: 'Question created successfully',
  QUESTIONS_RETRIEVED_SUCCESS: 'Questions retrieved successfully',
  QUESTION_RETRIEVED_SUCCESS: 'Question retrieved successfully',
  QUESTION_UPDATED_SUCCESS: 'Question updated successfully',
  QUESTION_DELETED_SUCCESS: 'Question deleted successfully',
  CUSTOMER_NOT_FOUND: 'Customer not found or invalid role',
  QUESTION_NOT_FOUND: 'Question not found',
  CONTENT_REQUIRED: 'Question content is required and cannot be empty',
  QUESTION_CANNOT_DELETE: 'Cannot delete question with associated reply',
  QUESTION_ALREADY_REPLIED: 'Question already have been replied'
}

export const REPLY_MESSAGES = {
  REPLY_CREATED_SUCCESS: 'Reply created successfully',
  REPLIES_RETRIEVED_SUCCESS: 'Replies retrieved successfully',
  REPLY_RETRIEVED_SUCCESS: 'Reply retrieved successfully',
  REPLY_UPDATED_SUCCESS: 'Reply updated successfully',
  REPLY_DELETED_SUCCESS: 'Reply deleted successfully',
  CONSULTANT_NOT_FOUND: 'Consultant not found or invalid role',
  QUESTION_NOT_FOUND: 'Question not found',
  CONTENT_REQUIRED: 'Reply content is required and cannot be empty',
  REPLY_ALREADY_EXISTS: 'A reply already exists for this question',
  REPLY_NOT_FOUND: 'Can not found matched reply'
}

export const CONSULT_REPORT_MESSAGES = {
  REPORT_CREATED_SUCCESS: 'Consult report created successfully',
  REPORTS_RETRIEVED_SUCCESS: 'Consult reports retrieved successfully',
  REPORT_RETRIEVED_SUCCESS: 'Consult report retrieved successfully',
  REPORT_UPDATED_SUCCESS: 'Consult report updated successfully',
  REPORT_DELETED_SUCCESS: 'Consult report deleted successfully',
  CONSULT_APPOINTMENT_NOT_FOUND: 'Consult appointment not found',
  NAME_REQUIRED: 'Report name is required and cannot be empty',
  DESCRIPTION_REQUIRED: 'Report description is required and cannot be empty',
  REPORT_ALREADY_EXISTS: 'A report already exists for this consult appointment',
  REPORT_NOT_FOUND: 'Consult report not found'
}

export const FEEDBACK_MESSAGES = {
  FEEDBACK_CREATED_SUCCESS: 'Feedback created successfully',
  FEEDBACKS_RETRIEVED_SUCCESS: 'Feedbacks retrieved successfully',
  FEEDBACK_RETRIEVED_SUCCESS: 'Feedback retrieved successfully',
  FEEDBACK_UPDATED_SUCCESS: 'Feedback updated successfully',
  FEEDBACK_DELETED_SUCCESS: 'Feedback deleted successfully',
  CONSULT_APPOINTMENT_NOT_FOUND: 'Consult appointment not found',
  LABORATORY_APPOINTMENT_NOT_FOUND: 'Laboratory appointment not found',
  APPOINTMENT_NOT_PROVIDED: 'Either consult appointment or laboratory appointment must be provided',
  CONTENT_REQUIRED: 'Feedback content is required and cannot be empty',
  RATING_INVALID: 'Rating must be a number between 1 and 5',
  FEEDBACK_ALREADY_EXISTS: 'A feedback already exists for this appointment',
  FEEDBACK_NOT_FOUND: 'Feedback not found'
}
