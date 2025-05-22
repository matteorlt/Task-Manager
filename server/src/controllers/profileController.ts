import { Request, Response } from 'express';
import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';

interface User extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  profile_picture?: string;
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
      'SELECT id, name, email, profile_picture, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const user = users[0];
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      profilePicture: user.profile_picture ? `/uploads/profile-pictures/${user.profile_picture}` : null,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du profil' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { name, email, password } = req.body;

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
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.execute(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, userId]
      );
    }

    // Récupérer les données mises à jour
    const [updatedUsers] = await pool.execute<User[]>(
      'SELECT id, name, email, profile_picture, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    const updatedUser = updatedUsers[0];
    res.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      profilePicture: updatedUser.profile_picture ? `/uploads/profile-pictures/${updatedUser.profile_picture}` : null,
      createdAt: updatedUser.created_at,
      updatedAt: updatedUser.updated_at
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du profil' });
  }
};

export const updateProfilePicture = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const file = req.file;

    if (!userId) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    if (!file) {
      return res.status(400).json({ message: 'Aucun fichier n\'a été téléchargé' });
    }

    // Récupérer l'ancienne photo de profil
    const [users] = await pool.execute<User[]>(
      'SELECT profile_picture FROM users WHERE id = ?',
      [userId]
    );

    const oldPicture = users[0]?.profile_picture;

    // Supprimer l'ancienne photo si elle existe
    if (oldPicture) {
      const oldPicturePath = path.join(__dirname, '../../uploads/profile-pictures', oldPicture);
      if (fs.existsSync(oldPicturePath)) {
        fs.unlinkSync(oldPicturePath);
      }
    }

    // Mettre à jour la photo de profil dans la base de données
    await pool.execute(
      'UPDATE users SET profile_picture = ? WHERE id = ?',
      [file.filename, userId]
    );

    // Récupérer les données mises à jour
    const [updatedUsers] = await pool.execute<User[]>(
      'SELECT id, name, email, profile_picture, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    const updatedUser = updatedUsers[0];
    res.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      profilePicture: `/uploads/profile-pictures/${updatedUser.profile_picture}`,
      createdAt: updatedUser.created_at,
      updatedAt: updatedUser.updated_at
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la photo de profil:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la photo de profil' });
  }
};

export const removeProfilePicture = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    // Récupérer l'ancienne photo de profil
    const [users] = await pool.execute<User[]>(
      'SELECT profile_picture FROM users WHERE id = ?',
      [userId]
    );

    const oldPicture = users[0]?.profile_picture;

    // Supprimer l'ancienne photo si elle existe
    if (oldPicture) {
      const oldPicturePath = path.join(__dirname, '../../uploads/profile-pictures', oldPicture);
      if (fs.existsSync(oldPicturePath)) {
        fs.unlinkSync(oldPicturePath);
      }
    }

    // Mettre à jour la base de données
    await pool.execute(
      'UPDATE users SET profile_picture = NULL WHERE id = ?',
      [userId]
    );

    // Récupérer les données mises à jour
    const [updatedUsers] = await pool.execute<User[]>(
      'SELECT id, name, email, profile_picture, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    const updatedUser = updatedUsers[0];
    res.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      profilePicture: null,
      createdAt: updatedUser.created_at,
      updatedAt: updatedUser.updated_at
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la photo de profil:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de la photo de profil' });
  }
}; 