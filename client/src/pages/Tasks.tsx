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
  MenuItem,
  IconButton,
  Chip,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { RootState } from '../store';
import {
  fetchTasksStart,
  fetchTasksSuccess,
  fetchTasksFailure,
  addTask,
  updateTask,
  deleteTask,
} from '../store/slices/taskSlice';
import { Task } from '../store/slices/taskSlice';
import { formatDate, formatDateForInput, formatDateForServer } from '../utils/dateUtils';
import { fetchEventsStart, fetchEventsSuccess, fetchEventsFailure, updateEvent, deleteEvent } from '../store/slices/eventSlice';
import { Event } from '../store/slices/eventSlice';
import { motion } from 'framer-motion';
import { CalendarToday as CalendarTodayIcon, Category as CategoryIcon } from '@mui/icons-material';

const TASKS_URL = 'http://localhost:3000/api/tasks';
const EVENTS_URL = 'http://localhost:3000/api/events';

const Tasks: React.FC = () => {
  const dispatch = useDispatch();
  const { tasks, loading } = useSelector((state: RootState) => state.tasks);
  const { token } = useSelector((state: RootState) => state.auth);
  const { events, loading: eventsLoading } = useSelector((state: RootState) => state.events);
  const themeMode = useSelector((state: RootState) => state.theme.mode);
  const [open, setOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '',
    category: '',
    tags: '',
  });
  const [openEvent, setOpenEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [eventFormData, setEventFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    allDay: false,
    location: '',
  });

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        dispatch(fetchTasksStart());
        const response = await fetch(TASKS_URL, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        dispatch(fetchTasksSuccess(data));
      } catch (error) {
        dispatch(fetchTasksFailure('Erreur lors du chargement des tâches'));
      }
    };
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
      fetchTasks();
      fetchEvents();
    }
  }, [dispatch, token]);

  const handleOpen = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: formatDateForInput(task.dueDate),
        category: task.category,
        tags: Array.isArray(task.tags) ? task.tags.join(', ') : '',
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: '',
        category: '',
        tags: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingTask(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.title.trim()) {
      setError('Le titre est requis');
      return;
    }

    const taskData = {
      ...formData,
      dueDate: formatDateForServer(formData.dueDate),
      tags: formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== ''),
    };

    if (!editingTask && !window.confirm('Voulez-vous créer cette tâche ?')) {
      return;
    }

    try {
      if (editingTask) {
        const response = await fetch(`${TASKS_URL}/${editingTask.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(taskData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erreur lors de la modification de la tâche');
        }

        const data = await response.json();
        dispatch(updateTask(data));
        setSuccess('Tâche modifiée avec succès');
      } else {
        const response = await fetch(TASKS_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(taskData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erreur lors de la création de la tâche');
        }

        const data = await response.json();
        dispatch(addTask(data));
        setSuccess('Tâche créée avec succès');
      }
      handleClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la tâche:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    }
  };

  const handleDelete = async (taskId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      try {
        await fetch(`${TASKS_URL}/${taskId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        dispatch(deleteTask(taskId));
      } catch (error) {
        console.error('Erreur lors de la suppression de la tâche:', error);
      }
    }
  };

  const handleOpenEvent = (event?: Event) => {
    if (event) {
      setEditingEvent(event);
      setEventFormData({
        title: event.title,
        description: event.description,
        startDate: formatDateForInput(event.startDate || (event as any)['start_date']),
        endDate: formatDateForInput(event.endDate || (event as any)['end_date']),
        allDay: event.allDay,
        location: event.location,
      });
    } else {
      setEditingEvent(null);
      setEventFormData({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        allDay: false,
        location: '',
      });
    }
    setOpenEvent(true);
  };

  const handleCloseEvent = () => {
    setOpenEvent(false);
    setEditingEvent(null);
  };

  const handleSubmitEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation des champs requis
    if (!eventFormData.title.trim()) {
      setError('Le titre est requis');
      return;
    }

    if (!eventFormData.startDate) {
      setError('La date de début est requise');
      return;
    }

    if (!eventFormData.endDate) {
      setError('La date de fin est requise');
      return;
    }

    // Formatage des dates pour le backend
    const startDate = formatDateForServer(eventFormData.startDate);
    const endDate = formatDateForServer(eventFormData.endDate);

    // S'assurer qu'aucun champ n'est undefined
    const eventData = {
      title: eventFormData.title || null,
      description: eventFormData.description || null,
      startDate: startDate || null,
      endDate: endDate || null,
      allDay: eventFormData.allDay || false,
      location: eventFormData.location || null,
    };

    console.log('Token:', token);
    console.log('Données envoyées au backend:', JSON.stringify(eventData, null, 2));
    console.log('ID de l\'événement:', editingEvent?.id);

    try {
      if (editingEvent) {
        const idStr = String(editingEvent.id);
        const eventId = idStr.startsWith('event-')
          ? idStr.replace('event-', '')
          : idStr;
        
        const url = `${EVENTS_URL}/${eventId}`;
        console.log('URL de la requête:', url);
        
        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(eventData),
        });

        console.log('Statut de la réponse:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Erreur du serveur:', errorData);
          throw new Error(errorData.message || 'Erreur lors de la modification de l\'événement');
        }

        const data = await response.json();
        console.log('Données reçues du serveur:', data);
        
        dispatch(updateEvent(data));
        setSuccess('Événement modifié avec succès');
      }
      handleCloseEvent();
    } catch (error) {
      console.error('Erreur détaillée:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      try {
        await fetch(`${EVENTS_URL}/${eventId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        dispatch(deleteEvent(eventId));
        setSuccess('Événement supprimé avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'événement:', error);
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    if (themeMode === 'dark') {
      switch (priority) {
        case 'HIGH':
          return '#f44336';
        case 'MEDIUM':
          return '#ff9800';
        case 'LOW':
          return '#4caf50';
        default:
          return '#757575';
      }
    } else {
      switch (priority) {
        case 'HIGH':
          return '#ef5350';
        case 'MEDIUM':
          return '#ffa726';
        case 'LOW':
          return '#66bb6a';
        default:
          return '#bdbdbd';
      }
    }
  };

  const getStatusColor = (status: string) => {
    if (themeMode === 'dark') {
      switch (status) {
        case 'DONE':
          return '#4caf50';
        case 'IN_PROGRESS':
          return '#ff9800';
        case 'TODO':
          return '#2196f3';
        default:
          return '#757575';
      }
    } else {
      switch (status) {
        case 'DONE':
          return '#66bb6a';
        case 'IN_PROGRESS':
          return '#ffa726';
        case 'TODO':
          return '#42a5f5';
        default:
          return '#bdbdbd';
      }
    }
  };

  return (
    <Box>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
          Tâches
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
          Nouvelle tâche
        </Button>
      </Box>

      <Grid container spacing={3}>
        {tasks.map((task, index) => {
          const tags = Array.isArray(task.tags) ? task.tags : [];
          return (
            <Grid item xs={12} sm={6} md={4} key={task.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    background: themeMode === 'dark' 
                      ? 'linear-gradient(145deg, #1e1e1e 0%, #2d2d2d 100%)'
                      : 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
                    position: 'relative',
                    overflow: 'visible',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: `linear-gradient(90deg, ${getPriorityColor(task.priority)} 0%, ${getStatusColor(task.status)} 100%)`,
                      borderTopLeftRadius: '12px',
                      borderTopRightRadius: '12px',
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        fontWeight: 600,
                        color: themeMode === 'dark' ? '#fff' : 'text.primary',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      {task.title}
                    </Typography>
                    <Typography
                      color={themeMode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'}
                      gutterBottom
                      sx={{
                        mb: 2,
                        fontSize: '0.9rem',
                        lineHeight: 1.5,
                      }}
                    >
                      {task.description}
                    </Typography>
                    <Box display="flex" gap={1} mb={2}>
                      <Chip
                        label={task.status}
                        sx={{
                          bgcolor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : undefined,
                          color: getStatusColor(task.status),
                          fontWeight: 500,
                          '& .MuiChip-label': {
                            px: 1,
                          },
                        }}
                        size="small"
                      />
                      <Chip
                        label={task.priority}
                        sx={{
                          bgcolor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : undefined,
                          color: getPriorityColor(task.priority),
                          fontWeight: 500,
                          '& .MuiChip-label': {
                            px: 1,
                          },
                        }}
                        size="small"
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 1,
                        color: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                      }}
                    >
                      <CalendarTodayIcon fontSize="small" />
                      Date limite: {formatDate(task.dueDate)}
                    </Typography>
                    {task.category && (
                      <Typography
                        variant="body2"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 1,
                          color: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                        }}
                      >
                        <CategoryIcon fontSize="small" />
                        Catégorie: {task.category}
                      </Typography>
                    )}
                    {tags.length > 0 && (
                      <Box display="flex" gap={0.5} mt={2} flexWrap="wrap">
                        {tags.map((tag, index) => (
                          <Chip
                            key={index}
                            label={tag}
                            size="small"
                            sx={{
                              backgroundColor: themeMode === 'dark' 
                                ? 'rgba(33, 150, 243, 0.15)'
                                : 'rgba(33, 150, 243, 0.1)',
                              color: themeMode === 'dark' ? '#90caf9' : 'primary.main',
                              '&:hover': {
                                backgroundColor: themeMode === 'dark'
                                  ? 'rgba(33, 150, 243, 0.25)'
                                  : 'rgba(33, 150, 243, 0.2)',
                              },
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpen(task)}
                      sx={{ 
                        color: themeMode === 'dark' ? '#90caf9' : 'primary.main',
                      }}
                    >
                      Modifier
                    </Button>
                    <Button
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(task.id)}
                      sx={{ 
                        color: themeMode === 'dark' ? '#f48fb1' : 'error.main',
                      }}
                    >
                      Supprimer
                    </Button>
                  </CardActions>
                </Card>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>

      {/* Section Événements */}
      <Typography variant="h5" mt={4} mb={2} sx={{ color: themeMode === 'dark' ? '#fff' : 'text.primary' }}>
        Événements
      </Typography>
      <Grid container spacing={3}>
        {events.map((event: Event) => (
          <Grid item xs={12} sm={6} md={4} key={event.id}>
            <Card sx={{
              background: themeMode === 'dark' 
                ? 'linear-gradient(145deg, #1e1e1e 0%, #2d2d2d 100%)'
                : 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
            }}>
              <CardContent>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ color: themeMode === 'dark' ? '#fff' : 'text.primary' }}
                >
                  {event.title}
                </Typography>
                <Typography 
                  color={themeMode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'} 
                  gutterBottom
                >
                  {event.description}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ color: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary' }}
                >
                  Début : {formatDate(event.startDate || (event as any)['start_date'])}<br />
                  Fin : {formatDate(event.endDate || (event as any)['end_date'])}
                </Typography>
                {event.location && (
                  <Typography 
                    variant="body2" 
                    sx={{ color: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary' }}
                  >
                    Lieu : {event.location}
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <IconButton 
                  size="small" 
                  onClick={() => handleOpenEvent(event)}
                  sx={{ color: themeMode === 'dark' ? '#90caf9' : 'primary.main' }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={() => handleDeleteEvent(event.id)}
                  sx={{ color: themeMode === 'dark' ? '#f48fb1' : 'error.main' }}
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
        {events.length === 0 && !eventsLoading && (
          <Grid item xs={12}>
            <Typography>Aucun événement à afficher</Typography>
          </Grid>
        )}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTask ? 'Modifier la tâche' : 'Nouvelle tâche'}
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
              select
              label="Statut"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              margin="normal"
            >
              <MenuItem value="TODO">À faire</MenuItem>
              <MenuItem value="IN_PROGRESS">En cours</MenuItem>
              <MenuItem value="DONE">Terminé</MenuItem>
            </TextField>
            <TextField
              fullWidth
              select
              label="Priorité"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              margin="normal"
            >
              <MenuItem value="LOW">Basse</MenuItem>
              <MenuItem value="MEDIUM">Moyenne</MenuItem>
              <MenuItem value="HIGH">Haute</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Date limite"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Catégorie"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              margin="normal"
              placeholder="Ex: urgent, travail, personnel"
              helperText="Séparez les tags par des virgules (ex: urgent, travail, personnel)"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Annuler</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingTask ? 'Modifier' : 'Créer'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog de modification d'événement */}
      <Dialog open={openEvent} onClose={handleCloseEvent} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingEvent ? "Modifier l'événement" : 'Nouvel événement'}
        </DialogTitle>
        <form onSubmit={handleSubmitEvent}>
          <DialogContent>
            <TextField
              fullWidth
              label="Titre"
              value={eventFormData.title}
              onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={eventFormData.description}
              onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="Date de début"
              type="date"
              value={eventFormData.startDate}
              onChange={(e) => setEventFormData({ ...eventFormData, startDate: e.target.value })}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              fullWidth
              label="Date de fin"
              type="date"
              value={eventFormData.endDate}
              onChange={(e) => {
                const value = e.target.value;
                // Soustrait -1 jour à la date sélectionnée
                const dateObj = new Date(value);
                dateObj.setDate(dateObj.getDate() - 1);
                const year = dateObj.getFullYear();
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                const day = String(dateObj.getDate()).padStart(2, '0');
                setEventFormData({ ...eventFormData, endDate: `${year}-${month}-${day}` });
              }}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              fullWidth
              label="Lieu"
              value={eventFormData.location}
              onChange={(e) => setEventFormData({ ...eventFormData, location: e.target.value })}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEvent}>Annuler</Button>
            <Button type="submit" variant="contained">
              {editingEvent ? 'Modifier' : 'Créer'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Tasks; 