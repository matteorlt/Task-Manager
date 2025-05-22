import express from 'express';
import { register, login, verifyToken } from '../controllers/authController';
import { auth } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify', auth, verifyToken);

export default router; 