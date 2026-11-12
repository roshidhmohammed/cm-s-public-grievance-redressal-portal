import express from 'express';
import authenticate from '../../middlewares/authenticate.js';
import authorize from '../../middlewares/authorize.js';
import { grievanceIdParamsSchema, validateRequest } from '../../utils/request-validation.js';
import { AIGrievanceController } from './ai-analysis.controller.js';
import {
  aiAnalysisIdParamsSchema,
  analyzeGrievanceRequestSchema,
  reviewAIAnalysisSchema
} from './ai-analysis.validation.js';

const router = express.Router();

router.get(
  '/grievances/:grievanceId',
  authenticate,
  authorize('cmo'),
  validateRequest({ params: grievanceIdParamsSchema }),
  AIGrievanceController.getForGrievance
);
router.post(
  '/analyze',
  authenticate,
  authorize('citizen'),
  validateRequest({ body: analyzeGrievanceRequestSchema }),
  AIGrievanceController.analyze
);
router.patch(
  '/:analysisId/review',
  authenticate,
  authorize('citizen'),
  validateRequest({ params: aiAnalysisIdParamsSchema, body: reviewAIAnalysisSchema }),
  AIGrievanceController.review
);

export default router;