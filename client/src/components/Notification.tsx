import React from 'react';
import { Box, Typography, IconButton, Paper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface NotificationProps {
  message: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, onClose }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        top: 20,
        right: 20,
        padding: 2,
        backgroundColor: 'white',
        borderRadius: 2,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Typography>{message}</Typography>
      <IconButton size="small" onClick={onClose}>
        <CloseIcon />
      </IconButton>
    </Paper>
  );
};

export default Notification; 