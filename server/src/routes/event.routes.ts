import express from 'express';
import { auth } from '../middleware/auth.middleware';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../controllers/event.controller';

const router = express.Router();

// Routes protégées par l'authentification
router.use(auth);

// Routes des événements
router.get('/', getEvents);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

export default router; 