import express from 'express';
import authenticate from '../../middlewares/authenticate.js';
import authorize from '../../middlewares/authorize.js';
import { upload } from '../../middlewares/upload.js';
import {
  detail,
  escalate,
  list,
  review,
  submit,
  track
} from './grievance.controller.js';
import {
  validateGrievanceId,
  validateGrievanceList,
  validateOptionalGrievanceFiles,
  validateReferenceNumber,
  validateResolution,
  validateSubmission
} from './grievance.validation.js';

const router = express.Router();

router.use(authenticate);
router.get('/track/:referenceNumber', authorize('citizen'), validateReferenceNumber, track);
router.get('/', validateGrievanceList, list);
router.post(
  '/',
  authorize('citizen'),
  upload.array('attachments', 5),
  validateSubmission,
  validateOptionalGrievanceFiles,
  submit
);
router.get('/:id', validateGrievanceId, detail);
router.post('/:id/escalate', authorize('cmo'), validateGrievanceId, escalate);
router.patch('/:id/review', authorize('cmo'), validateGrievanceId, validateResolution, review);

export default router;
