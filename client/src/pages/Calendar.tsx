import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Paper,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import fr from 'date-fns/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { RootState } from '../store';
import {
  fetchEventsStart,
  fetchEventsSuccess,
  fetchEventsFailure,
  addEvent,
  updateEvent,
  deleteEvent,
} from '../store/slices/eventSlice';
import {
  fetchTasksStart,
  fetchTasksSuccess,
  fetchTasksFailure,
} from '../store/slices/taskSlice';
import { Event } from '../store/slices/eventSlice';
import { Task } from '../store/slices/taskSlice';
import { formatDate, formatDateForInput, formatDateForServer } from '../utils/dateUtils';

// Type commun pour les événements du calendrier
interface CalendarEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  type: 'event' | 'task';
  description: string;
  location?: string;
  participants?: string[];
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
}

const locales = {
  'fr': fr,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const CalendarPage: React.FC = () => {
  const dispatch = useDispatch();
  const { events, loading: eventsLoading } = useSelector((state: RootState) => state.events);
  const { tasks, loading: tasksLoading } = useSelector((state: RootState) => state.tasks);
  const [open, setOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    allDay: false,
    location: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch events
        dispatch(fetchEventsStart());
        const eventsResponse = await fetch('/api/events');
        const eventsData = await eventsResponse.json();
        dispatch(fetchEventsSuccess(eventsData));

        // Fetch tasks
        dispatch(fetchTasksStart());
        const tasksResponse = await fetch('/api/tasks');
        const tasksData = await tasksResponse.json();
        dispatch(fetchTasksSuccess(tasksData));
      } catch (error) {
        dispatch(fetchEventsFailure('Erreur lors du chargement des données'));
        dispatch(fetchTasksFailure('Erreur lors du chargement des données'));
      }
    };

    fetchData();
  }, [dispatch]);

  // Convertir les tâches en événements pour le calendrier
  const calendarEvents: CalendarEvent[] = [
    ...events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      allDay: event.allDay,
      type: 'event' as const,
      location: event.location,
      participants: event.participants
    })),
    ...tasks.map(task => ({
      id: `task-${task.id}`,
      title: `📝 ${task.title}`,
      startDate: new Date(task.dueDate),
      endDate: new Date(task.dueDate),
      allDay: true,
      type: 'task' as const,
      description: task.description,
      status: task.status,
      priority: task.priority
    }))
  ];

  const handleOpen = (event?: CalendarEvent) => {
    if (event) {
      setSelectedEvent(event);
      setFormData({
        title: event.title,
        description: event.description,
        startDate: formatDateForInput(event.startDate),
        endDate: formatDateForInput(event.endDate),
        allDay: event.allDay,
        location: event.location || '',
      });
    } else {
      setSelectedEvent(null);
      setFormData({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        allDay: false,
        location: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedEvent(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const eventData = {
      ...formData,
      startDate: formatDateForServer(formData.startDate),
      endDate: formatDateForServer(formData.endDate),
    };

    try {
      if (selectedEvent && selectedEvent.type === 'event') {
        const response = await fetch(`/api/events/${selectedEvent.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventData),
        });
        const data = await response.json();
        dispatch(updateEvent(data));
      } else {
        const response = await fetch('/api/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventData),
        });
        const data = await response.json();
        dispatch(addEvent(data));
      }
      handleClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'événement:', error);
    }
  };

  const handleSelect = ({ start, end }: { start: Date; end: Date }) => {
    setFormData({
      ...formData,
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd'),
    });
    handleOpen();
  };

  const handleEventClick = (event: CalendarEvent) => {
    handleOpen(event);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Calendrier</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Nouvel événement
        </Button>
      </Box>

      <Paper sx={{ p: 2 }}>
        <Calendar<CalendarEvent>
          localizer={localizer}
          events={calendarEvents}
          startAccessor="startDate"
          endAccessor="endDate"
          style={{ height: 600 }}
          onSelectSlot={handleSelect}
          onSelectEvent={handleEventClick}
          selectable
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: event.type === 'task' ? '#f50057' : '#1976d2',
              borderRadius: '4px',
              opacity: 0.8,
              color: 'white',
              border: '0px',
              display: 'block'
            }
          })}
          messages={{
            next: "Suivant",
            previous: "Précédent",
            today: "Aujourd'hui",
            month: "Mois",
            week: "Semaine",
            day: "Jour",
            agenda: "Agenda",
            date: "Date",
            time: "Heure",
            event: "Événement",
            noEventsInRange: "Aucun événement dans cette période",
          }}
        />
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedEvent ? 'Modifier l\'événement' : 'Nouvel événement'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Titre"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="Date de début"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              fullWidth
              label="Date de fin"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              fullWidth
              label="Lieu"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Annuler</Button>
            <Button type="submit" variant="contained">
              {selectedEvent ? 'Modifier' : 'Créer'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default CalendarPage; 