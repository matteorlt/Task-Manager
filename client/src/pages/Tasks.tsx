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
import { fetchEventsStart, fetchEventsSuccess, fetchEventsFailure } from '../store/slices/eventSlice';
import { Event } from '../store/slices/eventSlice';

const TASKS_URL = 'http://localhost:3000/api/tasks';
const EVENTS_URL = 'http://localhost:3000/api/events';

const Tasks: React.FC = () => {
  const dispatch = useDispatch();
  const { tasks, loading } = useSelector((state: RootState) => state.tasks);
  const { token } = useSelector((state: RootState) => state.auth);
  const { events, loading: eventsLoading } = useSelector((state: RootState) => state.events);
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE':
        return 'success';
      case 'IN_PROGRESS':
        return 'warning';
      case 'TODO':
        return 'info';
      default:
        return 'default';
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
        <Typography variant="h4">Tâches</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Nouvelle tâche
        </Button>
      </Box>

      <Grid container spacing={3}>
        {tasks.map((task) => {
          const tags = Array.isArray(task.tags) ? task.tags : [];
          return (
            <Grid item xs={12} sm={6} md={4} key={task.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {task.title}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    {task.description}
                  </Typography>
                  <Box display="flex" gap={1} mb={1}>
                    <Chip
                      label={task.status}
                      color={getStatusColor(task.status)}
                      size="small"
                    />
                    <Chip
                      label={task.priority}
                      color={getPriorityColor(task.priority)}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    Date limite: {formatDate(task.dueDate)}
                  </Typography>
                  {task.category && (
                    <Typography variant="body2" color="textSecondary">
                      Catégorie: {task.category}
                    </Typography>
                  )}
                  {tags.length > 0 && (
                    <Box display="flex" gap={0.5} mt={1} flexWrap="wrap">
                      {tags.map((tag, index) => (
                        <Chip key={index} label={tag} size="small" />
                      ))}
                    </Box>
                  )}
                </CardContent>
                <CardActions>
                  <IconButton size="small" onClick={() => handleOpen(task)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(task.id)}>
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Section Événements */}
      <Typography variant="h5" mt={4} mb={2}>Événements</Typography>
      <Grid container spacing={3}>
        {events.map((event: Event) => (
          <Grid item xs={12} sm={6} md={4} key={event.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>{event.title}</Typography>
                <Typography color="textSecondary" gutterBottom>{event.description}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Début : {formatDate(event.startDate)}<br />
                  Fin : {formatDate(event.endDate)}
                </Typography>
                {event.location && (
                  <Typography variant="body2" color="textSecondary">
                    Lieu : {event.location}
                  </Typography>
                )}
              </CardContent>
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
    </Box>
  );
};

export default Tasks; 