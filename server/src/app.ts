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
const explicitOrigin = process.env.ORIGIN || 'http://localhost:8081';

app.use(cors({
  origin: function (origin, callback) {
    // Autoriser les requêtes sans origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    let isAllowed = false;
    try {
      const url = new URL(origin);
      const hostname = url.hostname;

      // Autoriser l'origin explicite
      if (origin === explicitOrigin) {
        isAllowed = true;
      }

      // Autoriser tous les sous-domaines Codespaces
      if (
        hostname.endsWith('.app.github.dev') ||
        hostname.endsWith('.githubpreview.dev')
      ) {
        isAllowed = true;
      }
    } catch (e) {
      // Si l'origin n'est pas une URL valide, on refuse
      isAllowed = false;
    }

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('Origin non autorisé:', origin);
      callback(new Error('Non autorisé par CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Gérer explicitement les preflight requests
app.options('*', cors({
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

console.log('CORS ORIGIN autorisé:', process.env.ORIGIN);

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

// Ne démarre pas l'écoute du serveur en environnement de test
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
  });
}

export default app; 