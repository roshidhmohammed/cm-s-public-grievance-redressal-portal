import express from 'express';
import authenticate from '../../middlewares/authenticate.js';
import authorize from '../../middlewares/authorize.js';
import {
  assignDepartmentOfficer,
  createDepartment,
  createOfficer,
  listDepartmentOfficers,
  listDepartments,
  listUnassignedDepartmentOfficers
} from './department.controller.js';
import { validateOfficer } from '../auth/auth.validation.js';
import {
  validateCreateDepartment,
  validateDepartmentId,
  validateOfficerAssignment
} from './department.validation.js';

const router = express.Router();

router.get('/', listDepartments);
router.get('/officers/unassigned', authenticate, authorize('cmo'), listUnassignedDepartmentOfficers);
router.post('/officers', authenticate, authorize('cmo'), validateOfficer, createOfficer);
router.post('/', authenticate, authorize('cmo'), validateCreateDepartment, createDepartment);
router.patch('/:id/officers', authenticate, authorize('cmo'), validateOfficerAssignment, assignDepartmentOfficer);
router.get('/:id/officers', authenticate, authorize('cmo'), validateDepartmentId, listDepartmentOfficers);

export default router;
