import request from 'supertest';
import app from '../app';

jest.mock('../middleware/auth.middleware', () => ({
  __esModule: true,
  auth: (_req: any, _res: any, next: any) => { _req.user = { id: 1, email: 'john@example.com' }; next(); },
}));

jest.mock('../config/database', () => {
  const users: Array<any> = [
    { id: 1, name: 'John', email: 'john@example.com', profile_picture: null, created_at: new Date(), updated_at: new Date() },
  ];
  return {
    __esModule: true,
    default: {
      execute: async (sql: string, params: any[]) => {
        if (sql.includes('SELECT id, name, email, profile_picture, created_at, updated_at FROM users WHERE id = ?')) {
          const id = params[0];
          return [users.filter(u => u.id === id), undefined];
        }
        if (sql.includes('SELECT * FROM users WHERE id = ?')) {
          const id = params[0];
          return [users.filter(u => u.id === id), undefined];
        }
        if (sql.includes('SELECT id FROM users WHERE email = ? AND id != ?')) {
          return [[], undefined];
        }
        if (sql.includes('UPDATE users SET name = ?, email = ? WHERE id = ?')) {
          const [name, email, id] = params;
          const user = users.find(u => u.id === id);
          if (user) { user.name = name; user.email = email; user.updated_at = new Date(); }
          return [[], undefined];
        }
        if (sql.includes('UPDATE users SET password = ? WHERE id = ?')) {
          return [[], undefined];
        }
        return [[], undefined];
      },
      getConnection: async () => ({ release: () => {} }),
    }
  };
});

describe('Profile routes', () => {
  test('GET /api/profile retourne le profil', async () => {
    const res = await request(app).get('/api/profile');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('email', 'john@example.com');
  });

  test('PUT /api/profile met à jour le nom et email', async () => {
    const res = await request(app).put('/api/profile').send({ name: 'Johnny', email: 'johnny@example.com' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', 'Johnny');
    expect(res.body).toHaveProperty('email', 'johnny@example.com');
  });
});


