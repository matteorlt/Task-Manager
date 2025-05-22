import express from 'express';
import { auth } from '../middleware/auth.middleware';
import {
  sendInvitation,
  getInvitations,
  acceptInvitation,
  rejectInvitation,
} from '../controllers/invitationController';

const router = express.Router();

router.post('/', auth, sendInvitation);
router.get('/', auth, getInvitations);
router.post('/:invitationId/accept', auth, acceptInvitation);
router.post('/:invitationId/reject', auth, rejectInvitation);

export default router; 