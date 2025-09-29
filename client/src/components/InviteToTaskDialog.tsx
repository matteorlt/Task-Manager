import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Box,
  Typography,
} from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { invitationService } from '../services/invitationService';

interface InviteToTaskDialogProps {
  open: boolean;
  onClose: () => void;
  taskId: string;
  taskTitle: string;
  themeMode: 'light' | 'dark';
  onSuccess?: () => void;
}

const InviteToTaskDialog: React.FC<InviteToTaskDialogProps> = ({
  open,
  onClose,
  taskId,
  taskTitle,
  themeMode,
  onSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim()) {
      setError('L\'adresse email est requise');
      return;
    }

    // Validation basique de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }

    setLoading(true);
    try {
      await invitationService.sendTaskInvitation(email, taskId);
      setSuccess(`Invitation envoyée avec succès à ${email}`);
      setEmail('');
      
      // Appeler le callback de succès si fourni
      if (onSuccess) {
        onSuccess();
      }
      
      // Fermer le dialogue après un délai
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 2000);
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi de l\'invitation:', error);
      setError(error.response?.data?.message || 'Erreur lors de l\'envoi de l\'invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setEmail('');
      setError(null);
      setSuccess(null);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
          Inviter quelqu'un à la tâche
        </Box>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Typography
            variant="body2"
            sx={{
              color: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
              mb: 2,
            }}
          >
            Inviter quelqu'un à participer à la tâche : <strong>{taskTitle}</strong>
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
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
          <Button 
            onClick={handleClose} 
            disabled={loading}
            sx={{ color: themeMode === 'dark' ? '#fff' : undefined }}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !email.trim()}
            sx={{
              background: themeMode === 'dark' 
                ? 'linear-gradient(45deg, #90caf9 30%, #64b5f6 90%)'
                : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            }}
          >
            {loading ? 'Envoi...' : 'Envoyer l\'invitation'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default InviteToTaskDialog;
