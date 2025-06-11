import { Router } from 'express';
import {
  createConsultantPattern,
  deleteConsultantPattern,
  getAllConsultantPatterns,
  getConsultantPatternById,
  getConsultantPatternByConsultantId, // Thêm import
  getConsultantPatternBySlotId, // Thêm import
  updateConsultantPattern
} from '~/controllers/consultant_pattern.controller';
import { validateAccessToken, restrictTo } from '~/middlewares/account.middleware';
import { Role } from '~/enum/role.enum';
import wrapRequestHandler from '~/utils/handle';

const router = Router();

router.post(
  '/create-onsultant-attern',
  validateAccessToken,
  restrictTo(Role.ADMIN),
  wrapRequestHandler(createConsultantPattern)
);

router.get(
  '/get-all-consultant-patterns',
  // validateAccessToken,
  // restrictTo(Role.ADMIN, Role.CUSTOMER),
  wrapRequestHandler(getAllConsultantPatterns)
);

router.get(
  '/get-consultant-pattern-by-id/:pattern_id',
  validateAccessToken,
  restrictTo(Role.ADMIN, Role.CUSTOMER),
  wrapRequestHandler(getConsultantPatternById)
);

router.get(
  '/get-consultant-pattern-by-id/consultant/:consultant_id', 
  validateAccessToken,
  restrictTo(Role.ADMIN, Role.CUSTOMER),
  wrapRequestHandler(getConsultantPatternByConsultantId)
);

router.get(
  '/get-consultant-pattern-by-id/slot/:slot_id', 
  validateAccessToken,
  restrictTo(Role.ADMIN, Role.CUSTOMER),
  wrapRequestHandler(getConsultantPatternBySlotId)
);

router.put(
  '/update-consultant-pattern/:pattern_id',
  // validateAccessToken,
  // restrictTo(Role.ADMIN),
  wrapRequestHandler(updateConsultantPattern)
);

router.delete(
  '/delete-consultant-pattern/:pattern_id',
  validateAccessToken,
  restrictTo(Role.ADMIN),
  wrapRequestHandler(deleteConsultantPattern)
);

export default router;