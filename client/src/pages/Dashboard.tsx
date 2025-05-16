import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { RootState } from '../store';
import { fetchTasksStart, fetchTasksSuccess, fetchTasksFailure } from '../store/slices/taskSlice';
import { fetchEventsStart, fetchEventsSuccess, fetchEventsFailure } from '../store/slices/eventSlice';
import { formatDate } from '../utils/dateUtils';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { tasks, loading: tasksLoading } = useSelector((state: RootState) => state.tasks);
  const { events, loading: eventsLoading } = useSelector((state: RootState) => state.events);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tasks
        dispatch(fetchTasksStart());
        const tasksResponse = await fetch('/api/tasks');
        const tasksData = await tasksResponse.json();
        dispatch(fetchTasksSuccess(tasksData));

        // Fetch events
        dispatch(fetchEventsStart());
        const eventsResponse = await fetch('/api/events');
        const eventsData = await eventsResponse.json();
        dispatch(fetchEventsSuccess(eventsData));
      } catch (error) {
        dispatch(fetchTasksFailure('Erreur lors du chargement des données'));
        dispatch(fetchEventsFailure('Erreur lors du chargement des données'));
      }
    };

    fetchData();
  }, [dispatch]);

  const upcomingTasks = tasks
    .filter(task => task.status !== 'DONE')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  const upcomingEvents = events
    .filter(event => new Date(event.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 5);

  if (tasksLoading || eventsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Tableau de bord
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Tâches à venir
            </Typography>
            <List>
              {upcomingTasks.map((task, index) => (
                <React.Fragment key={task.id}>
                  <ListItem>
                    <ListItemText
                      primary={task.title}
                      secondary={`Date limite: ${formatDate(task.dueDate)}`}
                    />
                  </ListItem>
                  {index < upcomingTasks.length - 1 && <Divider />}
                </React.Fragment>
              ))}
              {upcomingTasks.length === 0 && (
                <ListItem>
                  <ListItemText primary="Aucune tâche à venir" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Événements à venir
            </Typography>
            <List>
              {upcomingEvents.map((event, index) => (
                <React.Fragment key={event.id}>
                  <ListItem>
                    <ListItemText
                      primary={event.title}
                      secondary={`Date: ${formatDate(event.startDate)}`}
                    />
                  </ListItem>
                  {index < upcomingEvents.length - 1 && <Divider />}
                </React.Fragment>
              ))}
              {upcomingEvents.length === 0 && (
                <ListItem>
                  <ListItemText primary="Aucun événement à venir" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 