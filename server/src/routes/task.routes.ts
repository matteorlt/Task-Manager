import express from 'express';
import { auth } from '../middleware/auth.middleware';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/task.controller';

const router = express.Router();

// Routes protégées par l'authentification
router.use(auth);

// Routes des tâches
router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router; 