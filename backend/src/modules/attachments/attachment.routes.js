import express from 'express';
import authenticate from '../../middlewares/authenticate.js';
import authorize from '../../middlewares/authorize.js';
import { upload } from '../../middlewares/upload.js';
import {
  authorizeGrievanceAttachment,
  downloadAttachment,
  uploadAttachments
} from './attachment.controller.js';
import { validateRequest, grievanceIdParamsSchema } from '../../utils/request-validation.js';
import { validateGrievanceFiles } from '../grievances/grievance.validation.js';
import { z } from 'zod';

const attachmentParamsSchema = grievanceIdParamsSchema.extend({
  filename: z.string().min(1).max(255).regex(/^[a-zA-Z0-9._-]+$/)
});

const router = express.Router();

router.use(authenticate);
router.post(
  '/:grievanceId',
  authorize('citizen', 'cmo', 'department_officer'),
  validateRequest({ params: grievanceIdParamsSchema }),
  authorizeGrievanceAttachment,
  upload.array('attachments', 5),
  validateGrievanceFiles,
  uploadAttachments
);
router.get(
  '/:grievanceId/:filename',
  authorize('citizen', 'cmo', 'department_officer'),
  validateRequest({ params: attachmentParamsSchema }),
  downloadAttachment
);

export default router;
