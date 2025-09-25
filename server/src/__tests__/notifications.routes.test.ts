jest.mock('../middleware/auth.middleware', () => ({
  __esModule: true,
  auth: (_req: any, _res: any, next: any) => { _req.user = { id: 1, email: 'john@example.com' }; next(); },
}));

jest.mock('../config/database', () => {
  const notifications: Array<any> = [
    { id: 1, user_id: 1, message: 'Msg', type: 'INVITATION', is_read: false, created_at: new Date() },
  ];
  return {
    __esModule: true,
    default: {
      execute: async (sql: string, params: any[]) => {
        if (sql.includes('SELECT * FROM notifications WHERE user_id = ?')) {
          const userId = params[0];
          return [notifications.filter(n => n.user_id === userId), undefined];
        }
        if (sql.includes('UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?')) {
          const [id, userId] = params;
          const n = notifications.find(n => n.id === Number(id) && n.user_id === userId);
          if (n) n.is_read = true;
          return [[], undefined];
        }
        if (sql.includes('UPDATE notifications SET is_read = TRUE WHERE user_id = ?')) {
          const [userId] = params;
          notifications.forEach(n => { if (n.user_id === userId) n.is_read = true; });
          return [[], undefined];
        }
        if (sql.includes('DELETE FROM notifications WHERE id = ? AND user_id = ?')) {
          const [id, userId] = params;
          const idx = notifications.findIndex(n => n.id === Number(id) && n.user_id === userId);
          if (idx >= 0) notifications.splice(idx, 1);
          return [[], undefined];
        }
        return [[], undefined];
      },
      getConnection: async () => ({ release: () => {} }),
    }
  };
});

import request from 'supertest';
import app from '../app';

describe('Notifications routes', () => {
  test('GET /api/notifications liste', async () => {
    const res = await request(app).get('/api/notifications');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /api/notifications/:id/read marque comme lu', async () => {
    const res = await request(app).post('/api/notifications/1/read');
    expect(res.status).toBe(200);
  });

  test('POST /api/notifications/read-all marque tout', async () => {
    const res = await request(app).post('/api/notifications/read-all');
    expect(res.status).toBe(200);
  });

  test('DELETE /api/notifications/:id supprime', async () => {
    const res = await request(app).delete('/api/notifications/1');
    expect(res.status).toBe(200);
  });
});


