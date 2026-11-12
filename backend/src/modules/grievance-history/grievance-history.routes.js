import express from 'express';
import authenticate from '../../middlewares/authenticate.js';
import { listGrievanceHistory } from './grievance-history.controller.js';
import { grievanceIdParamsSchema, validateRequest } from '../../utils/request-validation.js';

const router = express.Router();

router.use(authenticate);
router.get('/:grievanceId', validateRequest({ params: grievanceIdParamsSchema }), listGrievanceHistory);

export default router;
