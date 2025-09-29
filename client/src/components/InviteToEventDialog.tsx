import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, Alert, Box } from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { API_ENDPOINTS } from '../config';

type Props = {
  open: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle?: string;
  themeMode?: string;
  onSuccess?: () => void;
};

const InviteToEventDialog: React.FC<Props> = ({ open, onClose, eventId, eventTitle, themeMode, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    if (!email.trim()) {
      setError('Veuillez entrer un email');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_ENDPOINTS.INVITATIONS.SEND, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ recipientEmail: email.trim(), eventId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Erreur lors de l\'envoi de l\'invitation');
      }
      onSuccess?.();
      onClose();
      setEmail('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
        <Box display="flex" alignItems="center" gap={1}>
          <PersonAddIcon />
          Inviter quelqu'un à l'événement
        </Box>
      </DialogTitle>
      <DialogContent>
        {eventTitle && (
          <Typography
            variant="body2"
            sx={{ mb: 2, color: themeMode === 'dark' ? 'rgba(255,255,255,0.7)' : 'text.secondary' }}
          >
            Inviter quelqu'un à participer à l'événement : <strong>{eventTitle}</strong>
          </Typography>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Adresse email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          required
          disabled={loading}
          placeholder="exemple@email.com"
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading} sx={{ color: themeMode === 'dark' ? '#fff' : undefined }}>
          Annuler
        </Button>
        <Button onClick={handleInvite} variant="contained" disabled={loading || !email.trim()} sx={{
          background: themeMode === 'dark' 
            ? 'linear-gradient(45deg, #90caf9 30%, #64b5f6 90%)'
            : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
        }}>
          {loading ? 'Envoi...' : 'Envoyer l\'invitation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InviteToEventDialog;


