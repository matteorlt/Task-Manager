import { Request, Response } from 'express';
import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface Task extends RowDataPacket {
  id: number;
  user_id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: Date;
  category: string;
  created_at: Date;
  updated_at: Date;
}

export const getTasks = async (req: Request, res: Response) => {
  try {
    const [tasks] = await pool.execute<Task[]>('SELECT * FROM tasks');
    res.json(tasks);
  } catch (error) {
    console.error('Erreur lors de la récupération des tâches:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des tâches' });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, description, status, priority, dueDate, category, tags } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO tasks (user_id, title, description, status, priority, due_date, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, title, description, status, priority, dueDate, category]
    );

    const [newTask] = await pool.execute<Task[]>(
      'SELECT * FROM tasks WHERE id = ?',
      [result.insertId]
    );
    res.status(201).json(newTask[0]);
  } catch (error) {
    console.error('Erreur lors de la création de la tâche:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la tâche' });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, dueDate, category, tags } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    await pool.execute(
      'UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, due_date = ?, category = ? WHERE id = ? AND user_id = ?',
      [title, description, status, priority, dueDate, category, id, userId]
    );

    const [updatedTask] = await pool.execute<Task[]>(
      'SELECT * FROM tasks WHERE id = ?',
      [id]
    );
    res.json(updatedTask[0]);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la tâche:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la tâche' });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    await pool.execute(
      'DELETE FROM tasks WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    res.json({ message: 'Tâche supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la tâche:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de la tâche' });
  }
}; 