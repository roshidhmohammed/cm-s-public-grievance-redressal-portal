import express from 'express';
import authenticate from '../../middlewares/authenticate.js';
import authorize from '../../middlewares/authorize.js';
import { submitFeedback } from './feedback.controller.js';
import { validateFeedback } from './feedback.validation.js';

const router = express.Router();

router.post('/:grievanceId', authenticate, authorize('citizen'), validateFeedback, submitFeedback);

export default router;
