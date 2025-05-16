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
    const { title, description, status, priority, dueDate, category, tags } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    if (!title) {
      return res.status(400).json({ message: 'Le titre est requis' });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.execute<ResultSetHeader>(
        'INSERT INTO tasks (user_id, title, description, status, priority, due_date, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, title, description, status, priority, dueDate, category]
      );

      if (tags && tags.length > 0) {
        for (const tag of tags) {
          await connection.execute(
            'INSERT INTO task_tags (task_id, tag) VALUES (?, ?)',
            [result.insertId, tag]
          );
        }
      }

      const [newTask] = await connection.execute<Task[]>(
        'SELECT t.*, GROUP_CONCAT(tt.tag) as tags FROM tasks t LEFT JOIN task_tags tt ON t.id = tt.task_id WHERE t.id = ? GROUP BY t.id',
        [result.insertId]
      );

      await connection.commit();
      res.status(201).json({
        ...newTask[0],
        dueDate: newTask[0].due_date ? newTask[0].due_date.toISOString() : null,
        createdAt: newTask[0].created_at.toISOString(),
        updatedAt: newTask[0].updated_at.toISOString(),
        tags: newTask[0].tags ? newTask[0].tags.split(',') : []
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
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

    if (!title) {
      return res.status(400).json({ message: 'Le titre est requis' });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.execute(
        'UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, due_date = ?, category = ? WHERE id = ? AND user_id = ?',
        [title, description, status, priority, dueDate, category, id, userId]
      );

      // Supprimer les anciens tags
      await connection.execute('DELETE FROM task_tags WHERE task_id = ?', [id]);

      // Ajouter les nouveaux tags
      if (tags && tags.length > 0) {
        for (const tag of tags) {
          await connection.execute(
            'INSERT INTO task_tags (task_id, tag) VALUES (?, ?)',
            [id, tag]
          );
        }
      }

      const [updatedTask] = await connection.execute<Task[]>(
        'SELECT t.*, GROUP_CONCAT(tt.tag) as tags FROM tasks t LEFT JOIN task_tags tt ON t.id = tt.task_id WHERE t.id = ? GROUP BY t.id',
        [id]
      );

      await connection.commit();
      res.json({
        ...updatedTask[0],
        dueDate: updatedTask[0].due_date ? updatedTask[0].due_date.toISOString() : null,
        createdAt: updatedTask[0].created_at.toISOString(),
        updatedAt: updatedTask[0].updated_at.toISOString(),
        tags: updatedTask[0].tags ? updatedTask[0].tags.split(',') : []
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
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