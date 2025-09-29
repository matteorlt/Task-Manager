import express from 'express';
import { auth } from '../middleware/auth.middleware';
import { 
  sendTaskInvitation, 
  getTaskParticipants, 
  acceptTaskInvitation, 
  rejectTaskInvitation 
} from '../controllers/taskInvitationController';

const router = express.Router();

// Routes protégées par l'authentification
router.use(auth);

// Routes des invitations aux tâches
router.post('/send', sendTaskInvitation);
router.get('/:id/participants', getTaskParticipants);
router.post('/:invitationId/accept', acceptTaskInvitation);
router.post('/:invitationId/reject', rejectTaskInvitation);

export default router;
