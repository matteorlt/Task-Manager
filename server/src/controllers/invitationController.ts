import { Request, Response } from 'express';
import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface Invitation extends RowDataPacket {
  id: number;
  sender_id: number;
  sender_email: string;
  sender_name: string;
  recipient_email: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: Date;
  updated_at: Date;
}

export const sendInvitation = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { recipientEmail, eventId } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    // Récupérer aussi le nom de l'utilisateur
    const [users] = await pool.execute<RowDataPacket[]>(
      'SELECT email, name FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const senderEmail = users[0].email;
    const senderName = users[0].name;

    // Vérifier si une invitation existe déjà
    const [existingInvitations] = await pool.execute<Invitation[]>(
      'SELECT * FROM invitations WHERE sender_id = ? AND recipient_email = ? AND event_id = ? AND status = "pending"',
      [userId, recipientEmail, eventId]
    );

    if (existingInvitations.length > 0) {
      return res.status(400).json({ message: 'Une invitation est déjà en attente pour cet utilisateur pour cet événement' });
    }

    // Créer l'invitation avec le nom de l'expéditeur
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO invitations (sender_id, sender_email, sender_name, recipient_email, event_id, status) VALUES (?, ?, ?, ?, ?, "pending")',
      [userId, senderEmail, senderName, recipientEmail, eventId]
    );

    // Créer une notification
    await pool.execute(
      'INSERT INTO notifications (user_id, message, type) VALUES (?, ?, "INVITATION")',
      [userId, `Nouvelle invitation envoyée à ${recipientEmail}`]
    );

    res.status(201).json({ message: 'Invitation envoyée avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'invitation:', error);
    res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'invitation' });
  }
};

export const getInvitations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    // Récupérer l'email de l'utilisateur
    const [users] = await pool.execute<RowDataPacket[]>(
      'SELECT email FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const userEmail = users[0].email;

    // Récupérer les invitations
    const [invitations] = await pool.execute<Invitation[]>(
      'SELECT * FROM invitations WHERE recipient_email = ? AND status = "pending" ORDER BY created_at DESC',
      [userEmail]
    );

    res.json(invitations);
  } catch (error) {
    console.error('Erreur lors de la récupération des invitations:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des invitations' });
  }
};

export const acceptInvitation = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { invitationId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    // Récupérer l'email de l'utilisateur
    const [users] = await pool.execute<RowDataPacket[]>(
      'SELECT email FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const userEmail = users[0].email;

    // Mettre à jour l'invitation
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE invitations SET status = "accepted" WHERE id = ? AND recipient_email = ? AND status = "pending"',
      [invitationId, userEmail]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Invitation non trouvée ou déjà traitée' });
    }

    // Récupérer les ids liés à l'invitation
    const [invitations] = await pool.execute<RowDataPacket[]>(
      'SELECT event_id, task_id FROM invitations WHERE id = ?',
      [invitationId]
    );
    if (!invitations.length) {
      return res.status(404).json({ message: 'Invitation introuvable' });
    }
    const { event_id: eventId, task_id: taskId } = invitations[0] as any;

    if (eventId) {
      // Cas: invitation à un événement
      const [events] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM events WHERE id = ?',
        [eventId]
      );
      if (!events.length) {
        return res.status(404).json({ message: 'Événement original introuvable' });
      }
      const event = events[0];
      await pool.execute(
        'INSERT INTO events (user_id, title, description, start_date, end_date, all_day, location) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, event.title, event.description, event.start_date, event.end_date, event.all_day, event.location]
      );
      await pool.execute(
        'INSERT INTO notifications (user_id, message, type) VALUES (?, ?, "INVITATION")',
        [userId, 'Vous avez accepté une invitation']
      );
      return res.json({ message: 'Invitation acceptée avec succès' });
    }

    if (taskId) {
      // Cas: invitation à une tâche
      const [tasks] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM tasks WHERE id = ?',
        [taskId]
      );
      if (!tasks.length) {
        return res.status(404).json({ message: 'Tâche originale introuvable' });
      }
      const task = tasks[0];
      await pool.execute(
        'INSERT INTO tasks (user_id, title, description, status, priority, due_date, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, task.title, task.description, 'TODO', task.priority, task.due_date, task.category]
      );
      await pool.execute(
        'INSERT INTO notifications (user_id, message, type) VALUES (?, ?, "TASK_INVITATION")',
        [userId, `Vous avez accepté l'invitation pour la tâche: ${task.title}`]
      );
      return res.json({ message: 'Invitation acceptée avec succès' });
    }

    return res.status(400).json({ message: 'Invitation mal formée (aucun event_id ou task_id)' });
  } catch (error) {
    console.error('Erreur lors de l\'acceptation de l\'invitation:', error);
    res.status(500).json({ message: 'Erreur lors de l\'acceptation de l\'invitation' });
  }
};

export const rejectInvitation = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { invitationId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    // Récupérer l'email de l'utilisateur
    const [users] = await pool.execute<RowDataPacket[]>(
      'SELECT email FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const userEmail = users[0].email;

    // Mettre à jour l'invitation
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE invitations SET status = "rejected" WHERE id = ? AND recipient_email = ? AND status = "pending"',
      [invitationId, userEmail]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Invitation non trouvée ou déjà traitée' });
    }

    // Créer une notification
    await pool.execute(
      'INSERT INTO notifications (user_id, message, type) VALUES (?, ?, "INVITATION")',
      [userId, 'Vous avez rejeté une invitation']
    );

    res.json({ message: 'Invitation rejetée avec succès' });
  } catch (error) {
    console.error('Erreur lors du rejet de l\'invitation:', error);
    res.status(500).json({ message: 'Erreur lors du rejet de l\'invitation' });
  }
}; 