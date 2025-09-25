// Mock auth middleware to inject a fake user
jest.mock('../middleware/auth.middleware', () => ({
  __esModule: true,
  auth: (_req: any, _res: any, next: any) => {
    _req.user = { id: 1, email: 'john@example.com' };
    next();
  },
}));

// Mock database pool for tasks queries
jest.mock('../config/database', () => {
  const tasksTable: Array<any> = [
    { id: 1, user_id: 1, title: 'T1', description: '', status: 'todo', priority: 'low', due_date: new Date(), category: 'general', created_at: new Date(), updated_at: new Date() },
  ];
  return {
    __esModule: true,
    default: {
      execute: async (sql: string, params: any[]) => {
        if (sql.includes('SELECT * FROM tasks WHERE user_id = ?')) {
          const userId = params[0];
          const items = tasksTable.filter(t => t.user_id === userId);
          return [items, undefined];
        }
        if (sql.includes('INSERT INTO tasks')) {
          const [userId, title, description, status, priority, dueDate, category] = params;
          const newId = tasksTable.length + 1;
          const now = new Date();
          tasksTable.push({ id: newId, user_id: userId, title, description, status, priority, due_date: dueDate ? new Date(dueDate) : null, category, created_at: now, updated_at: now });
          return [{ insertId: newId }, undefined];
        }
        // Vérifier la clause la plus spécifique avant la plus générale
        if (sql.includes('SELECT * FROM tasks WHERE id = ? AND user_id = ?')) {
          const [id, userId] = params;
          const found = tasksTable.filter(t => t.id === Number(id) && t.user_id === userId);
          return [found, undefined];
        }
        if (sql.includes('SELECT * FROM tasks WHERE id = ?')) {
          const id = params[0];
          const found = tasksTable.filter(t => t.id === Number(id));
          return [found, undefined];
        }
        if (sql.includes('UPDATE tasks SET')) {
          const [title, description, status, priority, dueDate, category, id] = params;
          const idx = tasksTable.findIndex(t => t.id === Number(id));
          if (idx >= 0) {
            tasksTable[idx] = {
              ...tasksTable[idx],
              title, description, status, priority, category, updated_at: new Date(),
              due_date: dueDate ? new Date(dueDate) : null,
            };
          }
          return [[], undefined];
        }
        if (sql.includes('DELETE FROM tasks WHERE id = ? AND user_id = ?')) {
          const [id, userId] = params;
          const idx = tasksTable.findIndex(t => t.id === Number(id) && t.user_id === userId);
          if (idx >= 0) tasksTable.splice(idx, 1);
          return [[], undefined];
        }
        return [[], undefined];
      },
      getConnection: async () => ({ release: () => {} }),
    },
  };
});

import request from 'supertest';
import app from '../app';

describe('Tasks routes', () => {
  test('GET /api/tasks renvoie les tâches de l’utilisateur', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /api/tasks crée une tâche', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Nouvelle tâche', description: 'Desc', status: 'todo', priority: 'low', dueDate: null, category: 'general' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  test('PUT /api/tasks/:id met à jour une tâche', async () => {
    const res = await request(app)
      .put('/api/tasks/1')
      .send({ title: 'T1 updated', description: '', status: 'doing', priority: 'high', dueDate: null, category: 'general' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('updatedAt');
  });

  test('DELETE /api/tasks/:id supprime une tâche', async () => {
    const res = await request(app).delete('/api/tasks/1');
    expect(res.status).toBe(200);
  });
});


