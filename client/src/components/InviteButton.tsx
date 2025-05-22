import React, { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

interface InviteButtonProps {
  onInvite: (email: string) => Promise<void>;
}

const InviteButton: React.FC<InviteButtonProps> = ({ onInvite }) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSubmit = async () => {
    if (!email) return;
    
    setLoading(true);
    try {
      await onInvite(email);
      setEmail('');
      handleClose();
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'invitation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<PersonAddIcon />}
        onClick={handleOpen}
        sx={{ mr: 2 }}
      >
        Inviter
      </Button>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Inviter un utilisateur</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annuler</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !email}
            variant="contained"
          >
            Envoyer l'invitation
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InviteButton; 