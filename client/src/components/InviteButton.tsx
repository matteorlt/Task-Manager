import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
} from '@mui/material';
import { invitationService } from '../services/invitationService';
import { API_ENDPOINTS } from '../config';

interface Event {
  id: string;
  title: string;
}

interface InviteButtonProps {
  onInvite: (email: string, eventId: string) => void;
}

const InviteButton: React.FC<InviteButtonProps> = ({ onInvite }) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(API_ENDPOINTS.EVENTS.GET_ALL, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des événements:', error);
      }
    };

    if (open) {
      fetchEvents();
    }
  }, [open]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEmail('');
    setSelectedEvent('');
    setError('');
  };

  const handleSubmit = async () => {
    if (!email || !selectedEvent) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      await onInvite(email, selectedEvent);
      handleClose();
    } catch (error) {
      setError('Erreur lors de l\'envoi de l\'invitation');
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={handleClickOpen}
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          },
        }}
      >
        Inviter
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Inviter un utilisateur</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              autoFocus
              label="Email"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!error}
            />
            <FormControl fullWidth>
              <InputLabel>Événement</InputLabel>
              <Select
                value={selectedEvent}
                label="Événement"
                onChange={(e) => setSelectedEvent(e.target.value)}
                error={!!error}
              >
                {events.map((event) => (
                  <MenuItem key={event.id} value={event.id}>
                    {event.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Inviter
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InviteButton; 