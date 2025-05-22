import { Request, Response } from 'express';
import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import bcrypt from 'bcrypt';

interface User extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  created_at: Date;
  updated_at: Date;
}

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    const [users] = await pool.execute<User[]>(
      'SELECT id, name, email, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du profil' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { name, email, currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    // Vérifier si l'utilisateur existe
    const [users] = await pool.execute<User[]>(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const user = users[0];

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email && email !== user.email) {
      const [existingUsers] = await pool.execute<User[]>(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }
    }

    // Mettre à jour les informations de base
    if (name || email) {
      await pool.execute(
        'UPDATE users SET name = ?, email = ? WHERE id = ?',
        [name || user.name, email || user.email, userId]
      );
    }

    // Mettre à jour le mot de passe si fourni
    if (currentPassword && newPassword) {
      const [userWithPassword] = await pool.execute<RowDataPacket[]>(
        'SELECT password FROM users WHERE id = ?',
        [userId]
      );

      const isValidPassword = await bcrypt.compare(currentPassword, userWithPassword[0].password);
      if (!isValidPassword) {
        return res.status(400).json({ message: 'Mot de passe actuel incorrect' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await pool.execute(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, userId]
      );
    }

    // Créer une notification
    await pool.execute(
      'INSERT INTO notifications (user_id, message, type) VALUES (?, ?, "PROFILE")',
      [userId, 'Votre profil a été mis à jour']
    );

    res.json({ message: 'Profil mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du profil' });
  }
}; 