import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/task.routes';
import eventRoutes from './routes/event.routes';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Route de base pour tester
app.get('/', (req, res) => {
  res.json({ message: 'API Task Manager fonctionne correctement' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/events', eventRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
}); 