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
    const userId = req.user?.id;
    const [events] = await pool.execute<Event[]>(
      'SELECT * FROM events WHERE user_id = ?',
      [userId]
    );
    // Convertir les dates au format ISO
    const formattedEvents = events.map(event => ({
      ...event,
      startDate: event.start_date.toISOString(),
      endDate: event.end_date.toISOString(),
      createdAt: event.created_at.toISOString(),
      updatedAt: event.updated_at.toISOString()
    }));
    res.json(formattedEvents);
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des événements' });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { title, description, startDate, endDate, allDay, location } = req.body;

    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO events (user_id, title, description, start_date, end_date, all_day, location) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, title, description, startDate, endDate, allDay, location]
    );

    const [newEvent] = await pool.execute<Event[]>(
      'SELECT * FROM events WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      ...newEvent[0],
      startDate: newEvent[0].start_date.toISOString(),
      endDate: newEvent[0].end_date.toISOString(),
      createdAt: newEvent[0].created_at.toISOString(),
      updatedAt: newEvent[0].updated_at.toISOString()
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'événement' });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const eventId = req.params.id;
    const { title, description, startDate, endDate, allDay, location } = req.body;

    // Vérifier que l'événement appartient à l'utilisateur
    const [existingEvents] = await pool.execute<Event[]>(
      'SELECT * FROM events WHERE id = ? AND user_id = ?',
      [eventId, userId]
    );

    if (existingEvents.length === 0) {
      return res.status(403).json({ message: 'Accès non autorisé à cet événement' });
    }

    await pool.execute(
      'UPDATE events SET title = ?, description = ?, start_date = ?, end_date = ?, all_day = ?, location = ? WHERE id = ? AND user_id = ?',
      [title, description, startDate, endDate, allDay, location, eventId, userId]
    );

    const [updatedEvent] = await pool.execute<Event[]>(
      'SELECT * FROM events WHERE id = ?',
      [eventId]
    );

    res.json({
      ...updatedEvent[0],
      startDate: updatedEvent[0].start_date.toISOString(),
      endDate: updatedEvent[0].end_date.toISOString(),
      createdAt: updatedEvent[0].created_at.toISOString(),
      updatedAt: updatedEvent[0].updated_at.toISOString()
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'événement:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'événement' });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const eventId = req.params.id;

    // Vérifier que l'événement appartient à l'utilisateur
    const [existingEvents] = await pool.execute<Event[]>(
      'SELECT * FROM events WHERE id = ? AND user_id = ?',
      [eventId, userId]
    );

    if (existingEvents.length === 0) {
      return res.status(403).json({ message: 'Accès non autorisé à cet événement' });
    }

    await pool.execute('DELETE FROM events WHERE id = ? AND user_id = ?', [eventId, userId]);
    res.json({ message: 'Événement supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'événement' });
  }
}; 