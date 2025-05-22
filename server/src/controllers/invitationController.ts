import { Request, Response } from 'express';
import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface Invitation extends RowDataPacket {
  id: number;
  sender_id: number;
  sender_email: string;
  recipient_email: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: Date;
  updated_at: Date;
}

export const sendInvitation = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { recipientEmail } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    // Vérifier si l'utilisateur existe
    const [users] = await pool.execute<RowDataPacket[]>(
      'SELECT email FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const senderEmail = users[0].email;

    // Vérifier si une invitation existe déjà
    const [existingInvitations] = await pool.execute<Invitation[]>(
      'SELECT * FROM invitations WHERE sender_id = ? AND recipient_email = ? AND status = "pending"',
      [userId, recipientEmail]
    );

    if (existingInvitations.length > 0) {
      return res.status(400).json({ message: 'Une invitation est déjà en attente pour cet utilisateur' });
    }

    // Créer l'invitation
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO invitations (sender_id, sender_email, recipient_email, status) VALUES (?, ?, ?, "pending")',
      [userId, senderEmail, recipientEmail]
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

    // Créer une notification
    await pool.execute(
      'INSERT INTO notifications (user_id, message, type) VALUES (?, ?, "INVITATION")',
      [userId, 'Vous avez accepté une invitation']
    );

    res.json({ message: 'Invitation acceptée avec succès' });
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