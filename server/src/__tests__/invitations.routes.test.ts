jest.mock('../middleware/auth.middleware', () => ({
  __esModule: true,
  auth: (_req: any, _res: any, next: any) => { _req.user = { id: 2, email: 'rcpt@example.com' }; next(); },
}));

jest.mock('../config/database', () => {
  const users = [{ id: 1, email: 'sender@example.com', name: 'Sender' }, { id: 2, email: 'rcpt@example.com', name: 'Rcpt' }];
  const invitations: Array<any> = [
    { id: 1, sender_id: 1, sender_email: 'sender@example.com', sender_name: 'Sender', recipient_email: 'rcpt@example.com', event_id: 10, status: 'pending', created_at: new Date(), updated_at: new Date() },
  ];
  const events = [{ id: 10, title: 'E', description: '', start_date: new Date(), end_date: new Date(), all_day: false, location: 'L' }];
  const notifications: Array<any> = [];
  return {
    __esModule: true,
    default: {
      execute: async (sql: string, params: any[]) => {
        if (sql.includes('SELECT email, name FROM users WHERE id = ?')) {
          const id = params[0];
          return [users.filter(u => u.id === id), undefined];
        }
        if (sql.includes('SELECT email FROM users WHERE id = ?')) {
          const id = params[0];
          return [users.filter(u => u.id === id).map(u => ({ email: u.email })), undefined];
        }
        if (sql.includes('SELECT * FROM invitations WHERE sender_id = ?')) {
          const [senderId, recipientEmail, eventId] = params;
          return [invitations.filter(i => i.sender_id === senderId && i.recipient_email === recipientEmail && i.event_id === eventId && i.status === 'pending'), undefined];
        }
        if (sql.includes('INSERT INTO invitations')) {
          const [senderId, senderEmail, senderName, recipientEmail, eventId] = params;
          const id = invitations.length + 1;
          invitations.push({ id, sender_id: senderId, sender_email: senderEmail, sender_name: senderName, recipient_email: recipientEmail, event_id: eventId, status: 'pending', created_at: new Date(), updated_at: new Date() });
          return [{ insertId: id }, undefined];
        }
        if (sql.includes('INSERT INTO notifications')) {
          const [userId, message] = params;
          notifications.push({ id: notifications.length + 1, user_id: userId, message, type: 'INVITATION', is_read: false, created_at: new Date() });
          return [[], undefined];
        }
        if (sql.includes('SELECT * FROM invitations WHERE recipient_email = ?')) {
          const email = params[0];
          return [invitations.filter(i => i.recipient_email === email && i.status === 'pending'), undefined];
        }
        if (sql.includes('UPDATE invitations SET status = "accepted"')) {
          const [id, email] = params;
          const inv = invitations.find(i => i.id === Number(id) && i.recipient_email === email && i.status === 'pending');
          if (inv) inv.status = 'accepted';
          return [{ affectedRows: inv ? 1 : 0 }, undefined];
        }
        if (sql.includes('UPDATE invitations SET status = "rejected"')) {
          const [id, email] = params;
          const inv = invitations.find(i => i.id === Number(id) && i.recipient_email === email && i.status === 'pending');
          if (inv) inv.status = 'rejected';
          return [{ affectedRows: inv ? 1 : 0 }, undefined];
        }
        if (sql.includes('SELECT event_id FROM invitations WHERE id = ?')) {
          const id = params[0];
          const inv = invitations.find(i => i.id === Number(id));
          return [inv ? [{ event_id: inv.event_id }] : [], undefined];
        }
        if (sql.includes('SELECT * FROM events WHERE id = ?')) {
          const id = params[0];
          return [events.filter(e => e.id === Number(id)), undefined];
        }
        if (sql.includes('INSERT INTO events (user_id')) {
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

describe('Invitations routes', () => {
  test('POST /api/invitations envoie une invitation', async () => {
    const res = await request(app).post('/api/invitations').send({ recipientEmail: 'rcpt2@example.com', eventId: 10 });
    expect(res.status).toBe(201);
  });

  test('GET /api/invitations liste les invitations reçues', async () => {
    const res = await request(app).get('/api/invitations');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /api/invitations/:id/accept accepte une invitation', async () => {
    const res = await request(app).post('/api/invitations/1/accept');
    expect(res.status).toBe(200);
  });

  test('POST /api/invitations/:id/reject rejette une invitation', async () => {
    // Créer une nouvelle invitation en statut pending
    await request(app).post('/api/invitations').send({ recipientEmail: 'rcpt@example.com', eventId: 10 });
    // Récupérer les invitations pending du user courant (rcpt@example.com)
    const list = await request(app).get('/api/invitations');
    expect(Array.isArray(list.body)).toBe(true);
    const last = list.body[0];
    const res = await request(app).post(`/api/invitations/${last.id}/reject`);
    expect(res.status).toBe(200);
  });
});


