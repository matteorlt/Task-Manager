import React, { useEffect, useState } from 'react';
import { invitationService } from '../services/invitationService';
import { Button, Box, Typography, Paper } from '@mui/material';

const InvitationsList: React.FC = () => {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const data = await invitationService.getInvitations();
      setInvitations(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleAccept = async (id: string) => {
    await invitationService.acceptInvitation(id);
    fetchInvitations();
  };

  const handleDecline = async (id: string) => {
    await invitationService.rejectInvitation(id);
    fetchInvitations();
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <Box>
      <Typography variant="h5" mb={2}>Invitations reçues</Typography>
      {invitations.length === 0 && <Typography>Aucune invitation en attente.</Typography>}
      {invitations.map(inv => (
        <Paper key={inv.id} sx={{ p: 2, mb: 2 }}>
          <Typography>
            <b>{inv.sender_name || inv.senderName || inv.senderEmail}</b> t'a invité à un événement.
          </Typography>
          <Box mt={1}>
            <Button
              variant="contained"
              color="success"
              onClick={() => handleAccept(inv.id)}
              sx={{ mr: 1 }}
            >
              Accepter
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => handleDecline(inv.id)}
            >
              Refuser
            </Button>
          </Box>
        </Paper>
      ))}
    </Box>
  );
};

export default InvitationsList; 