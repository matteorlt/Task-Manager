import express from 'express';
import { auth } from '../middleware/auth.middleware';

const router = express.Router();

// Routes protégées par l'authentification
router.use(auth);

// Routes des événements
router.get('/', (req, res) => {
  res.json({ message: 'Liste des événements' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Événement créé' });
});

router.put('/:id', (req, res) => {
  res.json({ message: 'Événement mis à jour' });
});

router.delete('/:id', (req, res) => {
  res.json({ message: 'Événement supprimé' });
});

export default router; 