import express from 'express';
import authenticate from '../../middlewares/authenticate.js';
import authorize from '../../middlewares/authorize.js';
import { cmoDashboard, departmentDashboard } from './dashboard.controller.js';

const router = express.Router();

router.get('/cmo', authenticate, authorize('cmo'), cmoDashboard);
router.get('/department', authenticate, authorize('department_officer'), departmentDashboard);

export default router;
