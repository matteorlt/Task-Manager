import express from 'express';
import { auth } from '../middleware/auth.middleware';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../controllers/notificationController';

const router = express.Router();

router.get('/', auth, getNotifications);
router.post('/:notificationId/read', auth, markAsRead);
router.post('/read-all', auth, markAllAsRead);
router.delete('/:notificationId', auth, deleteNotification);

export default router; 