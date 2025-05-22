import express from 'express';
import { auth } from '../middleware/auth.middleware';
import { getProfile, updateProfile } from '../controllers/profileController';

const router = express.Router();

router.get('/', auth, getProfile);
router.put('/', auth, updateProfile);

export default router; 