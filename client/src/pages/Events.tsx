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

const EVENTS_URL = 'http://localhost:3000/api/events';

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
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        dispatch(fetchEventsStart());
        const response = await fetch(EVENTS_URL, {
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
        startDate: event.startDate.split('T')[0],
        endDate: event.endDate.split('T')[0],
        allDay: event.allDay,
        location: event.location,
      });
    } else {
      const today = new Date();
      const defaultStartDate = startDate || today.toISOString().split('T')[0];
      const defaultEndDate = startDate || today.toISOString().split('T')[0];
      
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        startDate: defaultStartDate,
        endDate: defaultEndDate,
        allDay: false,
        location: '',
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
    try {
      if (editingEvent) {
        const response = await fetch(`${EVENTS_URL}/${editingEvent.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData),
        });
        const data = await response.json();
        dispatch(updateEvent(data));
      } else {
        const response = await fetch(EVENTS_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData),
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
        await fetch(`${EVENTS_URL}/${eventId}`, {
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
                  Début: {new Date(event.startDate).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Fin: {new Date(event.endDate).toLocaleString()}
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