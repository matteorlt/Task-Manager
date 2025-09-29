import { Request, Response } from 'express';
import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { Invitation } from '../models/Invitation';

export const sendTaskInvitation = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { recipientEmail, taskId } = req.body;

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

    // Vérifier que la tâche appartient à l'utilisateur
    const [tasks] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
      [taskId, userId]
    );

    if (tasks.length === 0) {
      return res.status(403).json({ message: 'Accès non autorisé à cette tâche' });
    }

    // Vérifier si une invitation existe déjà
    const [existingInvitations] = await pool.execute<Invitation[]>(
      'SELECT * FROM invitations WHERE sender_id = ? AND recipient_email = ? AND task_id = ? AND status = "pending"',
      [userId, recipientEmail, taskId]
    );

    if (existingInvitations.length > 0) {
      return res.status(400).json({ message: 'Une invitation est déjà en attente pour cet utilisateur pour cette tâche' });
    }

    // Créer l'invitation avec le nom de l'expéditeur
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO invitations (sender_id, sender_email, sender_name, recipient_email, task_id, status) VALUES (?, ?, ?, ?, ?, "pending")',
      [userId, senderEmail, senderName, recipientEmail, taskId]
    );

    // Créer une notification
    await pool.execute(
      'INSERT INTO notifications (user_id, message, type) VALUES (?, ?, "INVITATION")',
      [userId, `Nouvelle invitation envoyée à ${recipientEmail} pour la tâche`]
    );

    res.status(201).json({ message: 'Invitation envoyée avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'invitation:', error);
    res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'invitation' });
  }
};

export const getTaskParticipants = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const taskId = req.params.id;

    if (!userId) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    // Vérifier que la tâche appartient à l'utilisateur
    const [existingTasks] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
      [taskId, userId]
    );

    if (existingTasks.length === 0) {
      return res.status(403).json({ message: 'Accès non autorisé à cette tâche' });
    }

    // Récupérer les invitations acceptées pour cette tâche
    const [participants] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        i.recipient_email,
        i.sender_name,
        i.status,
        u.name as recipient_name
      FROM invitations i
      LEFT JOIN users u ON u.email = i.recipient_email
      WHERE i.task_id = ? AND i.status = 'accepted'
      ORDER BY i.created_at ASC`,
      [taskId]
    );

    // Ajouter le créateur de la tâche comme participant
    const [creator] = await pool.execute<RowDataPacket[]>(
      'SELECT email, name FROM users WHERE id = ?',
      [userId]
    );

    const allParticipants = [
      {
        email: creator[0]?.email,
        name: creator[0]?.name,
        status: 'creator',
        sender_name: null
      },
      ...participants.map(p => ({
        email: p.recipient_email,
        name: p.recipient_name || p.recipient_email,
        status: p.status,
        sender_name: p.sender_name
      }))
    ];

    res.json(allParticipants);
  } catch (error) {
    console.error('Erreur lors de la récupération des participants:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des participants' });
  }
};

export const acceptTaskInvitation = async (req: Request, res: Response) => {
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

    // Récupérer le task_id de l'invitation
    const [invitations] = await pool.execute<RowDataPacket[]>(
      'SELECT task_id FROM invitations WHERE id = ?',
      [invitationId]
    );
    if (!invitations.length || !invitations[0].task_id) {
      return res.status(404).json({ message: 'Aucune tâche liée à cette invitation' });
    }
    const taskId = invitations[0].task_id;

    // Récupérer la tâche originale
    const [tasks] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM tasks WHERE id = ?',
      [taskId]
    );
    if (!tasks.length) {
      return res.status(404).json({ message: 'Tâche originale introuvable' });
    }
    const task = tasks[0];

    // Créer une copie de la tâche pour l'utilisateur invité
    await pool.execute(
      'INSERT INTO tasks (user_id, title, description, status, priority, due_date, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, task.title, task.description, 'TODO', task.priority, task.due_date, task.category]
    );

    // Créer une notification
    await pool.execute(
      'INSERT INTO notifications (user_id, message, type) VALUES (?, ?, "TASK_INVITATION")',
      [userId, `Vous avez accepté l'invitation pour la tâche: ${task.title}`]
    );

    res.json({ message: 'Invitation acceptée avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'acceptation de l\'invitation:', error);
    res.status(500).json({ message: 'Erreur lors de l\'acceptation de l\'invitation' });
  }
};

export const rejectTaskInvitation = async (req: Request, res: Response) => {
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

    res.json({ message: 'Invitation rejetée avec succès' });
  } catch (error) {
    console.error('Erreur lors du rejet de l\'invitation:', error);
    res.status(500).json({ message: 'Erreur lors du rejet de l\'invitation' });
  }
};
