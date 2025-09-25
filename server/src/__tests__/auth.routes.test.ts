// Mock database pool
jest.mock('../config/database', () => {
  const usersTable: Array<any> = [
    { id: 1, name: 'John Doe', email: 'john@example.com', password: '$2a$10$hash' },
  ];
  return {
    __esModule: true,
    default: {
      execute: async (sql: string, params: any[]) => {
        if (sql.includes('SELECT * FROM users WHERE email = ?')) {
          const email = params[0];
          const found = usersTable.filter(u => u.email === email);
          return [found, undefined];
        }
        if (sql.includes('SELECT id FROM users WHERE email = ?')) {
          const email = params[0];
          const found = usersTable.filter(u => u.email === email).map(u => ({ id: u.id }));
          return [found, undefined];
        }
        if (sql.includes('INSERT INTO users')) {
          const [name, email, password] = params;
          const newId = usersTable.length + 1;
          usersTable.push({ id: newId, name, email, password });
          return [{ insertId: newId }, undefined];
        }
        return [[], undefined];
      },
      getConnection: async () => ({ release: () => {} }),
    },
  };
});

// Mock bcrypt and jwt
jest.mock('bcrypt', () => ({
  __esModule: true,
  default: {
    compare: async (password: string, hash: string) => password === 'validpassword',
    hash: async (password: string) => `hashed:${password}`,
  },
}));

jest.mock('jsonwebtoken', () => ({
  __esModule: true,
  default: {
    sign: () => 'mocked.jwt.token',
  },
  sign: () => 'mocked.jwt.token',
  verify: () => ({ id: 1, email: 'john@example.com' }),
}));

import request from 'supertest';
import app from '../app';

describe('Auth routes', () => {
  test('POST /api/auth/login succès', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john@example.com', password: 'validpassword' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
  });

  test('POST /api/auth/login mauvais mot de passe', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john@example.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  test('POST /api/auth/register crée un utilisateur', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Jane', email: 'jane@example.com', password: 'validpassword' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toMatchObject({ name: 'Jane', email: 'jane@example.com' });
  });
});


