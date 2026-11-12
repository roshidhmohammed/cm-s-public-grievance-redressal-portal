import express from 'express';
import { liveness, readiness } from './health.controller.js';

const router = express.Router();

router.get('/', liveness);
router.get('/live', liveness);
router.get('/ready', readiness);

export default router;
