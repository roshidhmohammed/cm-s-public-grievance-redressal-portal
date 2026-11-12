import express from 'express';
import authenticate from '../../middlewares/authenticate.js';
import authorize from '../../middlewares/authorize.js';
import { createEnquiry, listEnquiries, updateEnquiry } from './contact.controller.js';
import {
  validateCreateEnquiry,
  validateEnquiryList,
  validateUpdateEnquiry
} from './contact.validation.js';

const router = express.Router();

router.post('/', validateCreateEnquiry, createEnquiry);
router.get('/', authenticate, authorize('cmo'), validateEnquiryList, listEnquiries);
router.patch('/:id', authenticate, authorize('cmo'), validateUpdateEnquiry, updateEnquiry);

export default router;
