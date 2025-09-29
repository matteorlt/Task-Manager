import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Box, Chip, FormControlLabel, Switch } from '@mui/material';
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
  const [inviteInput, setInviteInput] = useState('');
  const [invites, setInvites] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

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
      if (isEvent) {
        await onCreateEvent({ title, description, startDate, endDate, allDay, location, invites });
      } else {
        await onCreateTask({ title, description, status, priority, dueDate: dueDate || null, category, invites });
      }
      onClose();
      setTitle(''); setDescription(''); setLocation(''); setAllDay(false); setStartDate(''); setEndDate(''); setStatus('TODO'); setPriority('MEDIUM'); setDueDate(''); setCategory(''); setInvites([]);
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
        <Box mb={2}>
          <Box
            sx={{
              position: 'relative',
              display: 'inline-flex',
              borderRadius: '999px',
              p: '4px',
              background: 'linear-gradient(145deg, rgba(33,150,243,0.15), rgba(33,203,243,0.15))',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.08)'
            }}
            role="tablist"
            aria-label="Choisir type: Événement ou Tâche"
          >
            {/* Animated background pill */}
            <Box
              component={motion.span}
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              sx={{
                position: 'absolute',
                top: 4,
                left: isEvent ? 4 : 'calc(50% + 0px)',
                width: 'calc(50% - 8px)',
                height: 'calc(100% - 8px)',
                borderRadius: '999px',
                background: 'linear-gradient(145deg, #1976D2, #21CBF3)',
                boxShadow: '0 6px 18px rgba(33, 150, 243, 0.35)',
                zIndex: 0,
              }}
            />

            {/* Left: Event */}
            <Button
              role="tab"
              aria-selected={isEvent}
              onClick={() => setIsEvent(true)}
              sx={{
                zIndex: 1,
                borderRadius: '999px',
                px: 3,
                py: 1,
                color: isEvent ? '#fff' : 'primary.main',
                textTransform: 'none',
                fontWeight: 600,
                transition: 'color .2s ease',
                '&:hover': { background: 'transparent' },
              }}
            >
              Événement
            </Button>

            {/* Right: Task */}
            <Button
              role="tab"
              aria-selected={!isEvent}
              onClick={() => setIsEvent(false)}
              sx={{
                zIndex: 1,
                borderRadius: '999px',
                px: 3,
                py: 1,
                color: !isEvent ? '#fff' : 'primary.main',
                textTransform: 'none',
                fontWeight: 600,
                transition: 'color .2s ease',
                '&:hover': { background: 'transparent' },
              }}
            >
              Tâche
            </Button>
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


