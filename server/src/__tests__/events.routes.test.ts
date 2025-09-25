// Mock auth to inject a user
jest.mock('../middleware/auth.middleware', () => ({
  __esModule: true,
  auth: (_req: any, _res: any, next: any) => {
    _req.user = { id: 1, email: 'john@example.com' };
    next();
  },
}));

// Mock DB for events
jest.mock('../config/database', () => {
  const eventsTable: Array<any> = [
    { id: 1, user_id: 1, title: 'E1', description: '', start_date: new Date(), end_date: new Date(), all_day: false, location: 'L', created_at: new Date(), updated_at: new Date() },
  ];
  return {
    __esModule: true,
    default: {
      execute: async (sql: string, params: any[]) => {
        if (sql.includes('SELECT * FROM events WHERE user_id = ?')) {
          const userId = params[0];
          return [eventsTable.filter(e => e.user_id === userId), undefined];
        }
        if (sql.includes('INSERT INTO events')) {
          const [userId, title, description, start, end, allDay, location] = params;
          const newId = eventsTable.length + 1;
          const now = new Date();
          eventsTable.push({ id: newId, user_id: userId, title, description, start_date: new Date(start), end_date: new Date(end), all_day: !!allDay, location, created_at: now, updated_at: now });
          return [{ insertId: newId }, undefined];
        }
        if (sql.includes('SELECT * FROM events WHERE id = ? AND user_id = ?')) {
          const [id, userId] = params;
          return [eventsTable.filter(e => e.id === Number(id) && e.user_id === userId), undefined];
        }
        if (sql.includes('SELECT * FROM events WHERE id = ?')) {
          const [id] = params;
          return [eventsTable.filter(e => e.id === Number(id)), undefined];
        }
        if (sql.includes('UPDATE events SET')) {
          const [title, description, start, end, allDay, location, id] = params;
          const idx = eventsTable.findIndex(e => e.id === Number(id));
          if (idx >= 0) {
            eventsTable[idx] = { ...eventsTable[idx], title, description, start_date: new Date(start), end_date: new Date(end), all_day: !!allDay, location, updated_at: new Date() };
          }
          return [[], undefined];
        }
        if (sql.includes('DELETE FROM events WHERE id = ? AND user_id = ?')) {
          const [id, userId] = params;
          const idx = eventsTable.findIndex(e => e.id === Number(id) && e.user_id === userId);
          if (idx >= 0) eventsTable.splice(idx, 1);
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

describe('Events routes', () => {
  test('GET /api/events retourne la liste', async () => {
    const res = await request(app).get('/api/events');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /api/events crée un événement', async () => {
    const res = await request(app)
      .post('/api/events')
      .send({ title: 'Nouveau', description: '', startDate: new Date().toISOString(), endDate: new Date().toISOString(), allDay: false, location: 'L' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  test('PUT /api/events/:id met à jour', async () => {
    const res = await request(app)
      .put('/api/events/1')
      .send({ title: 'MAJ', description: 'd', startDate: new Date().toISOString(), endDate: new Date().toISOString(), allDay: true, location: 'X' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('updatedAt');
  });

  test('DELETE /api/events/:id supprime', async () => {
    const res = await request(app).delete('/api/events/1');
    expect(res.status).toBe(200);
  });
});


