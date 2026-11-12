import express from 'express';
import authenticate from '../../middlewares/authenticate.js';
import authorize from '../../middlewares/authorize.js';
import { addCmoRemark } from './grievance-remark.controller.js';
import { validateRemark } from './grievance-remark.validation.js';

const router = express.Router();

router.post('/:grievanceId', authenticate, authorize('cmo'), validateRemark, addCmoRemark);

export default router;
