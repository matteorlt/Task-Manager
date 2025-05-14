import express from 'express';
import { auth } from '../middleware/auth.middleware';

const router = express.Router();

// Routes protégées par l'authentification
router.use(auth);

// Routes des tâches
router.get('/', (req, res) => {
  res.json({ message: 'Liste des tâches' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Tâche créée' });
});

router.put('/:id', (req, res) => {
  res.json({ message: 'Tâche mise à jour' });
});

router.delete('/:id', (req, res) => {
  res.json({ message: 'Tâche supprimée' });
});

export default router; 