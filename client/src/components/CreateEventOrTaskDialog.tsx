import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Box, Chip, FormControlLabel, Switch, ToggleButton, ToggleButtonGroup, Alert, Typography } from '@mui/material';
import { CalendarToday as CalendarIcon, Assignment as TaskIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreateEvent: (payload: { title: string; description: string; startDate: string; endDate: string; allDay: boolean; location: string; invites: string[] }) => Promise<void>;
  onCreateTask: (payload: { title: string; description: string; status: string; priority: string; dueDate: string | null; category: string; invites: string[] }) => Promise<void>;
  initialDate?: { start: string; end: string };
};

const CreateEventOrTaskDialog: React.FC<Props> = ({ open, onClose, onCreateEvent, onCreateTask, initialDate }) => {
  const [isEvent, setIsEvent] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [startDate, setStartDate] = useState(initialDate?.start || '');
  const [endDate, setEndDate] = useState(initialDate?.end || '');
  const [status, setStatus] = useState<'TODO'|'IN_PROGRESS'|'DONE'>('TODO');
  const [priority, setPriority] = useState<'LOW'|'MEDIUM'|'HIGH'>('MEDIUM');
  const [dueDate, setDueDate] = useState<string>('');
  const [category, setCategory] = useState('');
  const [color, setColor] = useState<string>('#66bb6a');
  const [inviteInput, setInviteInput] = useState('');
  const [invites, setInvites] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addInvite = () => {
    const email = inviteInput.trim();
    if (!email) return;
    if (!invites.includes(email)) setInvites([...invites, email]);
    setInviteInput('');
  };

  const removeInvite = (email: string) => {
    setInvites(invites.filter(i => i !== email));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      setError(null);
      if (isEvent) {
        if (!title.trim()) {
          setError('Le titre est requis.');
          return;
        }
        if (!startDate) {
          setError('La date de début est requise.');
          return;
        }
        const effectiveEnd = endDate || startDate;
        if (new Date(effectiveEnd) < new Date(startDate)) {
          setError('La date de fin doit être postérieure à la date de début.');
          return;
        }
        await onCreateEvent({ title, description, startDate, endDate: effectiveEnd, allDay, location, invites, color } as any);
      } else {
        if (!title.trim()) {
          setError('Le titre est requis.');
          return;
        }
        await onCreateTask({ title, description, status, priority, dueDate: dueDate || null, category, invites, color } as any);
      }
      onClose();
      setTitle(''); setDescription(''); setLocation(''); setAllDay(false); setStartDate(''); setEndDate(''); setStatus('TODO'); setPriority('MEDIUM'); setDueDate(''); setCategory(''); setColor('#66bb6a'); setInvites([]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEvent ? 'Créer un évènement' : 'Créer une tâche'}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Box mb={2}>
            <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
          </Box>
        )}
        <Box mb={2}>
          <ToggleButtonGroup
            value={isEvent ? 'event' : 'task'}
            exclusive
            onChange={(e, val) => { if (val) setIsEvent(val === 'event'); }}
            color="primary"
            sx={{
              borderRadius: 2,
              overflow: 'hidden',
              '& .MuiToggleButton-root': {
                px: 2,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                gap: 1,
              }
            }}
            aria-label="Choisir le type"
          >
            <ToggleButton value="event" aria-label="Événement">
              <CalendarIcon fontSize="small" /> Événement
            </ToggleButton>
            <ToggleButton value="task" aria-label="Tâche">
              <TaskIcon fontSize="small" /> Tâche
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Sélection de couleur */}
        <Box mt={1} mb={1}>
          <Typography variant="subtitle2" color="text.secondary">Couleur</Typography>
          <Box mt={1} display="flex" gap={1} flexWrap="wrap">
            {['#66bb6a','#42a5f5','#ab47bc','#ef5350','#ffa726','#26a69a','#8d6e63','#5c6bc0','#ec407a'].map((c) => (
              <Box
                key={c}
                role="button"
                aria-label={`Choisir la couleur ${c}`}
                onClick={() => setColor(c)}
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  bgcolor: c,
                  border: color === c ? '3px solid rgba(0,0,0,0.35)' : '2px solid rgba(0,0,0,0.12)',
                  cursor: 'pointer',
                  boxShadow: color === c ? '0 0 0 3px rgba(33,150,243,0.25)' : 'none',
                  transition: 'all .15s ease',
                }}
              />
            ))}
          </Box>
        </Box>
        <TextField label="Titre" fullWidth margin="normal" value={title} onChange={e => setTitle(e.target.value)} />
        <TextField label="Description" fullWidth margin="normal" multiline minRows={2} value={description} onChange={e => setDescription(e.target.value)} />

        {isEvent ? (
          <>
            <TextField label="Début" type="datetime-local" fullWidth margin="normal" value={startDate} onChange={e => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            <TextField label="Fin" type="datetime-local" fullWidth margin="normal" value={endDate} onChange={e => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            <FormControlLabel control={<Switch checked={allDay} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAllDay(e.target.checked)} />} label="Toute la journée" />
            <TextField label="Lieu" fullWidth margin="normal" value={location} onChange={e => setLocation(e.target.value)} />
          </>
        ) : (
          <>
            <TextField label="Statut" select fullWidth margin="normal" value={status} onChange={e => setStatus(e.target.value as any)}>
              <MenuItem value="TODO">À faire</MenuItem>
              <MenuItem value="IN_PROGRESS">En cours</MenuItem>
              <MenuItem value="DONE">Terminé</MenuItem>
            </TextField>
            <TextField label="Priorité" select fullWidth margin="normal" value={priority} onChange={e => setPriority(e.target.value as any)}>
              <MenuItem value="LOW">Basse</MenuItem>
              <MenuItem value="MEDIUM">Moyenne</MenuItem>
              <MenuItem value="HIGH">Haute</MenuItem>
            </TextField>
            <TextField label="Échéance" type="datetime-local" fullWidth margin="normal" value={dueDate} onChange={e => setDueDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            <TextField label="Catégorie" fullWidth margin="normal" value={category} onChange={e => setCategory(e.target.value)} />
          </>
        )}

        <Box mt={2}>
          <TextField label="Inviter des emails (Entrée pour ajouter)" fullWidth value={inviteInput} onChange={e => setInviteInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addInvite(); } }} />
          <Box mt={1} display="flex" gap={1} flexWrap="wrap">
            {invites.map(email => (
              <Chip key={email} label={email} onDelete={() => removeInvite(email)} />
            ))}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
          {isEvent ? 'Créer l\'évènement' : 'Créer la tâche'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateEventOrTaskDialog;


