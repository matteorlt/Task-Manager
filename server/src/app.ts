import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/task.routes';
import eventRoutes from './routes/event.routes';
import invitationRoutes from './routes/invitationRoutes';
import notificationRoutes from './routes/notificationRoutes';
import profileRoutes from './routes/profileRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

// Configuration CORS
app.use(cors({
  origin: process.env.ORIGIN || 'http://localhost:8081',
  credentials: true
}));

// Middleware
app.use(express.json());

// Créer le dossier uploads s'il n'existe pas
const uploadsDir = path.join(__dirname, '../uploads/profile-pictures');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Servir les fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Route de base pour tester
app.get('/', (req, res) => {
  res.json({ message: 'API Task Manager fonctionne correctement' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/profile', profileRoutes);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

export default app; 