import express from 'express';
import authenticate from '../../middlewares/authenticate.js';
import authorize from '../../middlewares/authorize.js';
import { validateAssignment } from '../grievances/grievance.validation.js';
import { grievanceIdParamsSchema, validateRequest } from '../../utils/request-validation.js';
import {
  assignDepartment,
  listAssignmentHistory
} from './department-assignment.controller.js';

const router = express.Router();

router.use(authenticate, authorize('cmo'));
router.get('/:grievanceId', validateRequest({ params: grievanceIdParamsSchema }), listAssignmentHistory);
router.post('/:grievanceId', validateRequest({ params: grievanceIdParamsSchema }), validateAssignment, assignDepartment);

export default router;
