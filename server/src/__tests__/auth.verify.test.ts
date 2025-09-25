jest.mock('../middleware/auth.middleware', () => ({
  __esModule: true,
  auth: (_req: any, _res: any, next: any) => { _req.user = { id: 1, email: 'john@example.com' }; next(); },
}));

jest.mock('../config/database', () => {
  const users = [{ id: 1, name: 'John', email: 'john@example.com' }];
  return {
    __esModule: true,
    default: {
      execute: async (sql: string, params: any[]) => {
        if (sql.includes('SELECT id, name, email FROM users WHERE id = ?')) {
          const id = params[0];
          return [users.filter(u => u.id === id), undefined];
        }
        return [[], undefined];
      },
      getConnection: async () => ({ release: () => {} }),
    },
  };
});

import request from 'supertest';
import app from '../app';

describe('GET /api/auth/verify', () => {
  it('retourne le profil basique de l’utilisateur', async () => {
    const res = await request(app).get('/api/auth/verify');
    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ id: 1, name: 'John', email: 'john@example.com' });
  });
});


