import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Avatar,
  Tooltip,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  People as PeopleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { invitationService } from '../services/invitationService';

interface Participant {
  email: string;
  name: string;
  status: 'creator' | 'accepted';
  sender_name?: string;
}

interface ParticipantListProps {
  eventId?: string;
  taskId?: string;
  themeMode: 'light' | 'dark';
  compact?: boolean;
}

const ParticipantList: React.FC<ParticipantListProps> = ({ 
  eventId, 
  taskId,
  themeMode, 
  compact = false 
}) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchParticipants = async () => {
      if (!eventId && !taskId) return;
      
      setLoading(true);
      try {
        let data: Participant[];
        if (eventId) {
          data = await invitationService.getEventParticipants(eventId);
        } else if (taskId) {
          data = await invitationService.getTaskParticipants(taskId);
        } else {
          return;
        }
        setParticipants(data);
      } catch (error) {
        console.error('Erreur lors du chargement des participants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [eventId, taskId]);

  if (loading) {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <PeopleIcon fontSize="small" />
        <Typography variant="caption" color="text.secondary">
          Chargement...
        </Typography>
      </Box>
    );
  }

  if (participants.length === 0) {
    return null;
  }

  const creator = participants.find(p => p.status === 'creator');
  const invitedParticipants = participants.filter(p => p.status === 'accepted');

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (email: string) => {
    const colors = [
      '#f44336', '#e91e63', '#9c27b0', '#673ab7',
      '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
      '#009688', '#4caf50', '#8bc34a', '#cddc39',
      '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
    ];
    const hash = email.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  if (compact) {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <PeopleIcon fontSize="small" color="action" />
        <Box display="flex" alignItems="center" gap={0.5}>
          {creator && (
            <Tooltip title={`Créateur: ${creator.name}`}>
              <Avatar
                sx={{
                  width: 20,
                  height: 20,
                  fontSize: '0.7rem',
                  bgcolor: getAvatarColor(creator.email),
                }}
              >
                {getInitials(creator.name)}
              </Avatar>
            </Tooltip>
          )}
          {invitedParticipants.slice(0, 2).map((participant, index) => (
            <Tooltip key={index} title={participant.name}>
              <Avatar
                sx={{
                  width: 20,
                  height: 20,
                  fontSize: '0.7rem',
                  bgcolor: getAvatarColor(participant.email),
                }}
              >
                {getInitials(participant.name)}
              </Avatar>
            </Tooltip>
          ))}
          {invitedParticipants.length > 2 && (
            <Chip
              label={`+${invitedParticipants.length - 2}`}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                bgcolor: themeMode === 'dark' ? '#333' : '#f5f5f5',
                color: themeMode === 'dark' ? '#fff' : '#666',
              }}
            />
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Box 
        display="flex" 
        alignItems="center" 
        gap={1}
        sx={{ cursor: 'pointer' }}
        onClick={() => setExpanded(!expanded)}
      >
        <PeopleIcon fontSize="small" color="action" />
        <Typography variant="body2" color="text.secondary">
          Participants ({participants.length})
        </Typography>
        <IconButton size="small">
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      
      <Collapse in={expanded}>
        <Box mt={1} display="flex" flexDirection="column" gap={1}>
          {creator && (
            <Box display="flex" alignItems="center" gap={1}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: getAvatarColor(creator.email),
                }}
              >
                {getInitials(creator.name)}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight="medium">
                  {creator.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Créateur
                </Typography>
              </Box>
            </Box>
          )}
          
          {invitedParticipants.map((participant, index) => (
            <Box key={index} display="flex" alignItems="center" gap={1}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: getAvatarColor(participant.email),
                }}
              >
                {getInitials(participant.name)}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight="medium">
                  {participant.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Invité par {participant.sender_name || 'quelqu\'un'}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

export default ParticipantList;
