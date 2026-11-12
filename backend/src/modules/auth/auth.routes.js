import express from 'express';
import authenticate from '../../middlewares/authenticate.js';
import authorize from '../../middlewares/authorize.js';
import { createOfficer, currentUser, register, signIn, signOut } from './auth.controller.js';
import { validateLogin, validateOfficer, validateRegistration } from './auth.validation.js';

const router = express.Router();

router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, signIn);
router.post('/logout', authenticate, signOut);
router.get('/me', authenticate, currentUser);
router.post('/officers', authenticate, authorize('cmo'), validateOfficer, createOfficer);

export default router;
