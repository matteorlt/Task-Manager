import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { RootState } from '../store';
import {
  fetchEventsStart,
  fetchEventsSuccess,
  fetchEventsFailure,
  addEvent,
  updateEvent,
  deleteEvent,
} from '../store/slices/eventSlice';
import { Event } from '../store/slices/eventSlice';
import Calendar from '@components/Calendar';
import { formatDate, formatDateForInput, formatDateForServer } from '../utils/dateUtils';
import { API_ENDPOINTS } from '../config';

const Events: React.FC = () => {
  const dispatch = useDispatch();
  const { events, loading } = useSelector((state: RootState) => state.events);
  const { token } = useSelector((state: RootState) => state.auth);
  const [open, setOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    allDay: false,
    location: '',
    color: '#66bb6a',
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        dispatch(fetchEventsStart());
        const response = await fetch(API_ENDPOINTS.EVENTS.GET_ALL, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        dispatch(fetchEventsSuccess(data));
      } catch (error) {
        dispatch(fetchEventsFailure('Erreur lors du chargement des événements'));
      }
    };

    if (token) {
      fetchEvents();
    }
  }, [dispatch, token]);

  const handleOpen = (event?: Event, startDate?: string) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description,
        startDate: formatDateForInput(event.startDate),
        endDate: formatDateForInput(event.endDate),
        allDay: event.allDay,
        location: event.location,
        color: (event as any).color || '#66bb6a',
      });
    } else {
      const today = new Date();
      const defaultStartDate = startDate ? formatDateForInput(startDate) : formatDateForInput(today);
      const defaultEndDate = startDate ? formatDateForInput(startDate) : formatDateForInput(today);
      
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        startDate: defaultStartDate,
        endDate: defaultEndDate,
        allDay: false,
        location: '',
        color: '#66bb6a',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingEvent(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const eventData = {
      ...formData,
      startDate: formatDateForServer(formData.startDate),
      endDate: formatDateForServer(formData.endDate),
    };
    try {
      if (editingEvent) {
        const response = await fetch(`${API_ENDPOINTS.EVENTS.GET_ALL}/${editingEvent.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(eventData),
        });
        const data = await response.json();
        dispatch(updateEvent(data));
      } else {
        const response = await fetch(API_ENDPOINTS.EVENTS.GET_ALL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
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

  const handleDelete = async (eventId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      try {
        await fetch(`${API_ENDPOINTS.EVENTS.GET_ALL}/${eventId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        dispatch(deleteEvent(eventId));
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'événement:', error);
      }
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Événements</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Nouvel événement
        </Button>
      </Box>

      <Box mb={3}>
        <Calendar
          onSelectDate={(date: Date) => {
            const formattedDate = date.toISOString().split('T')[0];
            handleOpen(undefined, formattedDate);
          }}
        />
      </Box>

      <Grid container spacing={3}>
        {events.map((event) => (
          <Grid item xs={12} sm={6} md={4} key={event.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {event.title}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {event.description}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Début: {formatDate(event.startDate)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Fin: {formatDate(event.endDate)}
                </Typography>
                {event.location && (
                  <Typography variant="body2" color="textSecondary">
                    Lieu: {event.location}
                  </Typography>
                )}
                <Typography variant="body2" color="textSecondary">
                  {event.allDay ? 'Journée entière' : 'Heure spécifique'}
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton size="small" onClick={() => handleOpen(event)}>
                  <EditIcon />
                </IconButton>
                <IconButton size="small" onClick={() => handleDelete(event.id)}>
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingEvent ? 'Modifier l\'événement' : 'Nouvel événement'}
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
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Date de fin"
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Lieu"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              margin="normal"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.allDay}
                  onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
                />
              }
              label="Journée entière"
            />

            {/* Sélection de couleur */}
            <Box mt={1} mb={1}>
              <Typography variant="subtitle2" color="text.secondary">Couleur</Typography>
              <Box mt={1} display="flex" gap={1} flexWrap="wrap">
                {['#66bb6a','#42a5f5','#ab47bc','#ef5350','#ffa726','#26a69a','#8d6e63','#5c6bc0','#ec407a'].map((c) => (
                  <Box
                    key={c}
                    role="button"
                    aria-label={`Choisir la couleur ${c}`}
                    onClick={() => setFormData({ ...formData, color: c })}
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      bgcolor: c,
                      border: formData.color === c ? '3px solid rgba(0,0,0,0.35)' : '2px solid rgba(0,0,0,0.12)',
                      cursor: 'pointer',
                      boxShadow: formData.color === c ? '0 0 0 3px rgba(33,150,243,0.25)' : 'none',
                      transition: 'all .15s ease',
                    }}
                  />
                ))}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Annuler</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingEvent ? 'Modifier' : 'Créer'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Events; 