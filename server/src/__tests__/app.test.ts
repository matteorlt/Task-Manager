// Éviter la connexion DB en mockant avant l'import de app
jest.mock('../config/database', () => ({
  __esModule: true,
  default: {
    execute: async () => [[], undefined],
    getConnection: async () => ({ release: () => {} }),
  },
}));

import request from 'supertest';
import app from '../app';

describe('GET /', () => {
  it('retourne un message de santé', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });
});


