import express from 'express';
import authenticate from '../../middlewares/authenticate.js';
import authorize from '../../middlewares/authorize.js';
import { upload } from '../../middlewares/upload.js';
import {
  validateActionReport,
  validateReportFiles
} from '../grievances/grievance.validation.js';
import { grievanceIdParamsSchema, validateRequest } from '../../utils/request-validation.js';
import { authorizeActionReport, submitActionReport } from './action-taken-report.controller.js';

const router = express.Router();

router.post(
  '/:grievanceId',
  authenticate,
  authorize('department_officer'),
  validateRequest({ params: grievanceIdParamsSchema }),
  authorizeActionReport,
  upload.array('attachments', 5),
  validateActionReport,
  validateReportFiles,
  submitActionReport
);

export default router;
