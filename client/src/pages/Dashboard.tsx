import React from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import { RootState } from '../store';
import { formatDate } from '../utils/dateUtils';
import {
  Assignment as TaskIcon,
  Event as EventIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

const Dashboard: React.FC = () => {
  const { tasks, loading: tasksLoading } = useSelector((state: RootState) => state.tasks);
  const { events, loading: eventsLoading } = useSelector((state: RootState) => state.events);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingTasks = tasks
    .filter(task => {
      const dueDate = new Date(task.dueDate);
      return dueDate >= today;
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  const upcomingEvents = events
    .filter(event => {
      const start = new Date(event.startDate || (event as any)['start_date']);
      return start >= today;
    })
    .sort((a, b) => {
      const aStart = new Date(a.startDate || (a as any)['start_date']);
      const bStart = new Date(b.startDate || (b as any)['start_date']);
      return aStart.getTime() - bStart.getTime();
    })
    .slice(0, 5);

  const completedTasks = tasks.filter(task => task.status === 'DONE').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  if (tasksLoading || eventsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 600,
            color: 'primary.main',
            mb: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <TrendingUpIcon fontSize="large" />
          Tableau de bord
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Paper
                sx={{
                  p: 3,
                  height: '100%',
                  background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '4px',
                    height: '100%',
                    background: 'linear-gradient(180deg, #2196F3 0%, #21CBF3 100%)',
                  },
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: 'primary.main',
                    fontWeight: 600,
                  }}
                >
                  <TaskIcon />
                  Tâches à venir
                </Typography>
                <List>
                  {upcomingTasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <ListItem
                        sx={{
                          borderRadius: 1,
                          mb: 1,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: 'rgba(33, 150, 243, 0.08)',
                            transform: 'translateX(4px)',
                          },
                        }}
                      >
                        <ListItemText
                          primary={task.title}
                          secondary={`Date limite: ${formatDate(task.dueDate)}`}
                          primaryTypographyProps={{
                            fontWeight: 500,
                          }}
                        />
                      </ListItem>
                      {index < upcomingTasks.length - 1 && <Divider />}
                    </motion.div>
                  ))}
                  {upcomingTasks.length === 0 && (
                    <ListItem>
                      <ListItemText primary="Aucune tâche à venir" />
                    </ListItem>
                  )}
                </List>
              </Paper>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Paper
                sx={{
                  p: 3,
                  height: '100%',
                  background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '4px',
                    height: '100%',
                    background: 'linear-gradient(180deg, #f50057 0%, #ff4081 100%)',
                  },
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: 'secondary.main',
                    fontWeight: 600,
                  }}
                >
                  <EventIcon />
                  Événements à venir
                </Typography>
                <List>
                  {upcomingEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <ListItem
                        sx={{
                          borderRadius: 1,
                          mb: 1,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: 'rgba(245, 0, 87, 0.08)',
                            transform: 'translateX(4px)',
                          },
                        }}
                      >
                        <ListItemText
                          primary={event.title}
                          secondary={`Débute le : ${formatDate(event.startDate || (event as any)['start_date'])}`}
                          primaryTypographyProps={{
                            fontWeight: 500,
                          }}
                        />
                      </ListItem>
                      {index < upcomingEvents.length - 1 && <Divider />}
                    </motion.div>
                  ))}
                  {upcomingEvents.length === 0 && (
                    <ListItem>
                      <ListItemText primary="Aucun événement à venir" />
                    </ListItem>
                  )}
                </List>
              </Paper>
            </motion.div>
          </Grid>

          <Grid item xs={12}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Paper
                sx={{
                  p: 3,
                  background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '4px',
                    height: '100%',
                    background: 'linear-gradient(180deg, #4caf50 0%, #81c784 100%)',
                  },
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: 'success.main',
                    fontWeight: 600,
                  }}
                >
                  <CheckCircleIcon />
                  Progression des tâches
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body1" gutterBottom>
                    Taux de complétion: {completionRate.toFixed(1)}%
                  </Typography>
                  <Box
                    sx={{
                      width: '100%',
                      height: 8,
                      backgroundColor: 'rgba(0, 0, 0, 0.1)',
                      borderRadius: 4,
                      overflow: 'hidden',
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${completionRate}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, #4caf50 0%, #81c784 100%)',
                      }}
                    />
                  </Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    {completedTasks} tâches complétées sur {totalTasks}
                  </Typography>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  );
};

export default Dashboard; 