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
    const userId = req.user?.id;
    const [tasks] = await pool.execute<Task[]>(
      'SELECT * FROM tasks WHERE user_id = ?',
      [userId]
    );
    // Convertir les dates au format ISO
    const formattedTasks = tasks.map(task => ({
      ...task,
      dueDate: task.due_date ? task.due_date.toISOString() : null,
      createdAt: task.created_at.toISOString(),
      updatedAt: task.updated_at.toISOString()
    }));
    res.json(formattedTasks);
  } catch (error) {
    console.error('Erreur lors de la récupération des tâches:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des tâches' });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { title, description, status, priority, dueDate, category } = req.body;

    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO tasks (user_id, title, description, status, priority, due_date, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, title, description, status, priority, dueDate, category]
    );

    const [newTask] = await pool.execute<Task[]>(
      'SELECT * FROM tasks WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      ...newTask[0],
      dueDate: newTask[0].due_date ? newTask[0].due_date.toISOString() : null,
      createdAt: newTask[0].created_at.toISOString(),
      updatedAt: newTask[0].updated_at.toISOString()
    });
  } catch (error) {
    console.error('Erreur lors de la création de la tâche:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la tâche' });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const taskId = req.params.id;
    const { title, description, status, priority, dueDate, category } = req.body;

    // Vérifier que la tâche appartient à l'utilisateur
    const [existingTasks] = await pool.execute<Task[]>(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
      [taskId, userId]
    );

    if (existingTasks.length === 0) {
      return res.status(403).json({ message: 'Accès non autorisé à cette tâche' });
    }

    await pool.execute(
      'UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, due_date = ?, category = ? WHERE id = ? AND user_id = ?',
      [title, description, status, priority, dueDate, category, taskId, userId]
    );

    const [updatedTask] = await pool.execute<Task[]>(
      'SELECT * FROM tasks WHERE id = ?',
      [taskId]
    );

    res.json({
      ...updatedTask[0],
      dueDate: updatedTask[0].due_date ? updatedTask[0].due_date.toISOString() : null,
      createdAt: updatedTask[0].created_at.toISOString(),
      updatedAt: updatedTask[0].updated_at.toISOString()
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la tâche:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la tâche' });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const taskId = req.params.id;

    // Vérifier que la tâche appartient à l'utilisateur
    const [existingTasks] = await pool.execute<Task[]>(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
      [taskId, userId]
    );

    if (existingTasks.length === 0) {
      return res.status(403).json({ message: 'Accès non autorisé à cette tâche' });
    }

    await pool.execute('DELETE FROM tasks WHERE id = ? AND user_id = ?', [taskId, userId]);
    res.json({ message: 'Tâche supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la tâche:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de la tâche' });
  }
}; 