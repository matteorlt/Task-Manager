import { Request, Response } from 'express';
import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface Event extends RowDataPacket {
  id: number;
  user_id: number;
  title: string;
  description: string;
  start_date: Date;
  end_date: Date;
  all_day: boolean;
  location: string;
  created_at: Date;
  updated_at: Date;
}

export const getEvents = async (req: Request, res: Response) => {
  try {
    const [events] = await pool.execute<Event[]>('SELECT * FROM events');
    res.json(events);
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des événements' });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    let { title, description, startDate, endDate, allDay, location } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    // Ajuster la date de fin pour inclure le dernier jour si l'heure n'est pas précisée
    if (/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      endDate = endDate + ' 23:59:59';
    }

    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO events (user_id, title, description, start_date, end_date, all_day, location) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, title, description, startDate, endDate, allDay, location]
    );

    const [newEvent] = await pool.execute<Event[]>(
      'SELECT * FROM events WHERE id = ?',
      [result.insertId]
    );
    res.status(201).json(newEvent[0]);
  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'événement' });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let { title, description, startDate, endDate, allDay, location } = req.body;
    const userId = req.user?.id;

    // Log pour debug
    console.log('updateEvent:', { id, userId });

    if (!userId) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    // Ajuster la date de fin pour inclure le dernier jour si l'heure n'est pas précisée
    if (/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      endDate = endDate + ' 23:59:59';
    }

    await pool.execute(
      'UPDATE events SET title = ?, description = ?, start_date = ?, end_date = ?, all_day = ?, location = ? WHERE id = ? AND user_id = ?',
      [title, description, startDate, endDate, allDay, location, id, userId]
    );

    // Toujours retourner l'événement modifié en JSON
    const [updatedEvent] = await pool.execute<Event[]>(
      'SELECT * FROM events WHERE id = ?',
      [id]
    );
    if (updatedEvent && updatedEvent[0]) {
      res.json(updatedEvent[0]);
    } else {
      res.status(404).json({ message: "Événement non trouvé après modification" });
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'événement:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'événement' });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    await pool.execute(
      'DELETE FROM events WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    res.json({ message: 'Événement supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'événement' });
  }
}; 