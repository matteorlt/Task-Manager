import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  Alert,
} from '@mui/material';
import { Add as AddIcon, CalendarToday as CalendarIcon, Event as EventIcon } from '@mui/icons-material';
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
import { motion } from 'framer-motion';
import { API_ENDPOINTS } from '../config';
import ParticipantList from '../components/ParticipantList';

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
  const { token } = useSelector((state: RootState) => state.auth);
  const themeMode = useSelector((state: RootState) => state.theme.mode);
  const [open, setOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    allDay: false,
    location: '',
  });
  const navigate = useNavigate();
  const hasMountedRef = useRef(false);

  useEffect(() => {
    hasMountedRef.current = true;
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch events
        dispatch(fetchEventsStart());
        const eventsResponse = await fetch(API_ENDPOINTS.EVENTS.GET_ALL, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!eventsResponse.ok) {
          throw new Error('Erreur lors du chargement des événements');
        }
        const eventsData = await eventsResponse.json();
        dispatch(fetchEventsSuccess(eventsData));

        // Fetch tasks
        dispatch(fetchTasksStart());
        const tasksResponse = await fetch(API_ENDPOINTS.TASKS.GET_ALL, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!tasksResponse.ok) {
          throw new Error('Erreur lors du chargement des tâches');
        }
        const tasksData = await tasksResponse.json();
        dispatch(fetchTasksSuccess(tasksData));
      } catch (error) {
        dispatch(fetchEventsFailure('Erreur lors du chargement des données'));
        dispatch(fetchTasksFailure('Erreur lors du chargement des données'));
      }
    };

    if (token) {
      fetchData();
    }
  }, [dispatch, token]);

  // DEBUG : Affichage brut des events
  console.log('events (brut):', JSON.stringify(events, null, 2));

  // Convertir les tâches et événements en événements pour le calendrier
  const calendarEvents: CalendarEvent[] = [
    ...events
      .filter(event => (event.startDate || (event as any)['start_date']))
      .map(event => {
        const start = new Date(event.startDate || (event as any)['start_date']);
        const endRaw = new Date(event.endDate || (event as any)['end_date']);
        const end = new Date(endRaw);
        end.setDate(end.getDate() + 1); // Ajoute 1 jour pour l'affichage dans le calendrier
        return {
          id: `event-${event.id}`,
          title: `📅 ${event.title}`,
          startDate: start,
          endDate: end,
          allDay: true,
          type: 'event' as const,
          description: event.description,
          location: event.location,
          participants: event.participants
        };
      }),
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
  console.log('calendarEvents (détail):', JSON.stringify(calendarEvents, null, 2));
  // DEBUG : Affichage des données dans la console
  console.log('--- DEBUG CALENDRIER ---');
  console.log('events:', events);
  console.log('tasks:', tasks);
  console.log('calendarEvents:', calendarEvents);

  const handleOpen = (event?: CalendarEvent) => {
    if (event) {
      // Si c'est un événement (et pas une tâche), on retire 1 jour à la date de fin pour le formulaire
      let endDate = event.endDate;
      if (event.type === 'event') {
        const end = new Date(event.endDate);
        end.setDate(end.getDate() - 1);
        endDate = end;
      }
      setSelectedEvent(event);
      // Retirer l'emoji du titre pour le formulaire
      let cleanTitle = event.title;
      if (event.type === 'event' && cleanTitle.startsWith('📅 ')) {
        cleanTitle = cleanTitle.slice(2).trim();
      }
      if (event.type === 'task' && cleanTitle.startsWith('📝 ')) {
        cleanTitle = cleanTitle.slice(2).trim();
      }
      setFormData({
        title: cleanTitle,
        description: event.description,
        startDate: formatDateForInput(event.startDate),
        endDate: formatDateForInput(endDate),
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
    setError(null);

    if (!formData.title.trim()) {
      setError('Le titre est requis');
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      setError('Les dates de début et de fin sont requises');
      return;
    }

    // S'assurer que la date de fin est après la date de début
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    if (endDate < startDate) {
      setError('La date de fin doit être après la date de début');
      return;
    }

    // Toujours enregistrer le titre sans emoji
    const eventData = {
      title: formData.title.trim(),
      description: formData.description || '',
      startDate: formatDateForServer(formData.startDate),
      endDate: formatDateForServer(formData.endDate),
      allDay: formData.allDay,
      location: formData.location || '',
    };

    try {
      if (selectedEvent && selectedEvent.type === 'event') {
        // Extraire l'ID numérique de l'événement
        const eventId = selectedEvent.id.replace('event-', '');
        console.log('Modification de l\'événement:', { eventId, eventData });

        const response = await fetch(`${API_ENDPOINTS.EVENTS.GET_ALL}/${eventId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(eventData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erreur lors de la modification de l\'événement');
        }

        const data = await response.json();
        dispatch(updateEvent(data));
        handleClose();
      } else {
        const response = await fetch(API_ENDPOINTS.EVENTS.GET_ALL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(eventData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erreur lors de la création de l\'événement');
        }

        const data = await response.json();
        dispatch(addEvent(data));
        handleClose();
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'événement:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
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

  const handleEventClick = (calendarEvent: CalendarEvent) => {
    if (calendarEvent.type === 'task') {
      navigate('/tasks');
    } else {
      handleOpen(calendarEvent);
    }
  };

  // Mémo pour éviter de recréer ces objets à chaque saisie (sinon remount et ré-anime)
  const calendarMessages = useMemo(() => ({
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
  }), []);

  const ToolbarComponent = (props: any) => (
    <motion.div
      initial={!hasMountedRef.current ? { opacity: 0, y: -20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="rbc-toolbar">
        <span className="rbc-btn-group">
          <button type="button" onClick={() => props.onNavigate('PREV')} className="rbc-btn">Précédent</button>
          <button type="button" onClick={() => props.onNavigate('TODAY')} className="rbc-btn">Aujourd'hui</button>
          <button type="button" onClick={() => props.onNavigate('NEXT')} className="rbc-btn">Suivant</button>
        </span>
        <span className="rbc-toolbar-label">{props.label}</span>
        <span className="rbc-btn-group">
          <button type="button" className={props.view === 'month' ? 'rbc-active' : ''} onClick={() => props.onView('month')}>Mois</button>
          <button type="button" className={props.view === 'week' ? 'rbc-active' : ''} onClick={() => props.onView('week')}>Semaine</button>
          <button type="button" className={props.view === 'day' ? 'rbc-active' : ''} onClick={() => props.onView('day')}>Jour</button>
          <button type="button" className={props.view === 'agenda' ? 'rbc-active' : ''} onClick={() => props.onView('agenda')}>Agenda</button>
        </span>
      </div>
    </motion.div>
  );

  const calendarComponents = useMemo(() => ({ toolbar: ToolbarComponent }), []);

  return (
    <Box>
      <motion.div
        initial={!hasMountedRef.current ? { opacity: 0, y: 20 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              color: themeMode === 'dark' ? '#fff' : 'primary.main',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <CalendarIcon fontSize="large" />
            Calendrier
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
            sx={{
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
            }}
          >
            Nouvel événement
          </Button>
        </Box>

        <motion.div
          initial={!hasMountedRef.current ? { opacity: 0, scale: 0.95 } : false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Paper
            sx={{
              p: 3,
              background: themeMode === 'dark'
                ? 'linear-gradient(145deg, #1e1e1e 0%, #2d2d2d 100%)'
                : 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
              borderRadius: 2,
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              '& .rbc-calendar': {
                color: themeMode === 'dark' ? '#fff' : 'inherit',
              },
              '& .rbc-toolbar button': {
                color: themeMode === 'dark' ? '#fff' : 'inherit',
                backgroundColor: themeMode === 'dark' ? '#333' : '#fff',
                borderColor: themeMode === 'dark' ? '#444' : '#ccc',
                '&:hover': {
                  backgroundColor: themeMode === 'dark' ? '#444' : '#f0f0f0',
                },
                '&:active, &.rbc-active': {
                  backgroundColor: themeMode === 'dark' ? '#505050' : '#e6e6e6',
                  borderColor: themeMode === 'dark' ? '#666' : '#adadad',
                },
              },
              '& .rbc-month-view': {
                border: themeMode === 'dark' ? '1px solid #444' : '1px solid #ddd',
              },
              '& .rbc-header': {
                backgroundColor: themeMode === 'dark' ? '#333' : '#f5f5f5',
                color: themeMode === 'dark' ? '#fff' : 'inherit',
                borderBottom: themeMode === 'dark' ? '1px solid #444' : '1px solid #ddd',
              },
              '& .rbc-day-bg': {
                backgroundColor: themeMode === 'dark' ? '#1e1e1e' : '#fff',
                '&:hover': {
                  backgroundColor: themeMode === 'dark' ? '#2d2d2d' : '#f5f5f5',
                },
              },
              '& .rbc-off-range-bg': {
                backgroundColor: themeMode === 'dark' ? '#141414' : '#f5f5f5',
              },
              '& .rbc-today': {
                backgroundColor: themeMode === 'dark' ? '#333' : '#eaf6ff',
              },
              '& .rbc-event': {
                backgroundColor: themeMode === 'dark' ? '#2196f3' : '#3174ad',
                '&:hover': {
                  backgroundColor: themeMode === 'dark' ? '#1976d2' : '#265985',
                },
              },
              '& .rbc-show-more': {
                color: themeMode === 'dark' ? '#90caf9' : '#3174ad',
                backgroundColor: 'transparent',
              },
              '& .rbc-current-time-indicator': {
                backgroundColor: themeMode === 'dark' ? '#f50057' : '#74ad31',
              },
            }}
          >
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
                  backgroundColor: event.type === 'task' 
                    ? (themeMode === 'dark' ? '#f50057' : '#f44336')
                    : (themeMode === 'dark' ? '#4caf50' : '#66bb6a'),
                  borderRadius: '4px',
                  opacity: 0.8,
                  color: '#fff',
                  border: '0px',
                  display: 'block',
                  padding: '2px 4px',
                  fontSize: event.type === 'task' ? '0.875rem' : '0.75rem',
                  fontWeight: event.type === 'task' ? 'normal' : 'bold',
                  textAlign: event.type === 'task' ? 'left' : 'center',
                  textTransform: event.type === 'task' ? 'none' : 'uppercase',
                  boxShadow: event.type === 'task' ? 'none' : '0 2px 4px rgba(0,0,0,0.2)',
                  margin: event.type === 'task' ? '0' : '2px 0',
                  height: event.type === 'task' ? 'auto' : '24px',
                  lineHeight: event.type === 'task' ? 'normal' : '24px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    opacity: 1,
                  },
                },
              })}
              messages={calendarMessages}
              components={calendarComponents}
            />
          </Paper>
        </motion.div>
      </motion.div>

      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: themeMode === 'dark' ? '#1e1e1e' : '#fff',
            color: themeMode === 'dark' ? '#fff' : 'inherit',
          }
        }}
      >
        <DialogTitle sx={{ color: themeMode === 'dark' ? '#fff' : 'inherit' }}>
          {selectedEvent ? 'Modifier l\'événement' : 'Nouvel événement'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}
            <TextField
              fullWidth
              label="Titre"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              margin="normal"
              required
              error={!!error && !formData.title}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : undefined,
                  },
                  '&:hover fieldset': {
                    borderColor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : undefined,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : undefined,
                },
                '& .MuiOutlinedInput-input': {
                  color: themeMode === 'dark' ? '#fff' : undefined,
                },
              }}
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
              error={!!error && !formData.startDate}
            />
            <TextField
              fullWidth
              label="Date de fin"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value})}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
              error={!!error && !formData.endDate}
            />
            <TextField
              fullWidth
              label="Lieu"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              margin="normal"
            />
            
            {/* Affichage des participants pour les événements existants */}
            {selectedEvent && selectedEvent.type === 'event' && (
              <Box mt={2}>
                <ParticipantList
                  eventId={selectedEvent.id.replace('event-', '')}
                  themeMode={themeMode}
                  compact={false}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} sx={{ color: themeMode === 'dark' ? '#fff' : undefined }}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              sx={{
                background: themeMode === 'dark' 
                  ? 'linear-gradient(45deg, #90caf9 30%, #64b5f6 90%)'
                  : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              }}
            >
              {selectedEvent ? 'Modifier' : 'Créer'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default CalendarPage; 