import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

interface User extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  password: string;
  profile_picture?: string;
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const [users] = await pool.execute<User[]>(
      'SELECT id, name, email, password, profile_picture FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'votre_secret_jwt',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profilePicture: user.profile_picture ? `/uploads/profile-pictures/${user.profile_picture}` : null
      }
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ message: 'Erreur lors de la connexion' });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Vérifier si l'email est déjà utilisé
    const [existingUsers] = await pool.execute<User[]>(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    const token = jwt.sign(
      { id: (result as any).insertId, email },
      process.env.JWT_SECRET || 'votre_secret_jwt',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: (result as any).insertId,
        name,
        email,
        profilePicture: null
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ message: 'Erreur lors de l\'inscription' });
  }
};

export const verifyToken = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const [users] = await pool.execute<User[]>(
      'SELECT id, name, email, profile_picture FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const user = users[0];
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profilePicture: user.profile_picture ? `/uploads/profile-pictures/${user.profile_picture}` : null
      }
    });
  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);
    res.status(500).json({ message: 'Erreur lors de la vérification du token' });
  }
}; 