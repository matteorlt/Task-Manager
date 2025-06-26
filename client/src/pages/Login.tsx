import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  Paper,
} from '@mui/material';
import { motion } from 'framer-motion';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice';
import { RootState } from '../store';
import { API_ENDPOINTS } from '../config';
import {
  LockOutlined as LockIcon,
  Email as EmailIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const themeMode = useSelector((state: RootState) => state.theme.mode);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginStart());

    try {
      console.log('Tentative de connexion via:', API_ENDPOINTS.AUTH.LOGIN);
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      let data = null;
      try {
        data = await response.json();
      } catch (jsonErr) {
        // Si la réponse n'est pas du JSON (ex: erreur réseau/CORS)
        throw new Error('Erreur réseau ou CORS');
      }

      if (!response.ok) {
        throw new Error(data && data.message ? data.message : 'Erreur de connexion');
      }

      dispatch(loginSuccess(data));
      navigate('/');
    } catch (err) {
      dispatch(loginFailure(err instanceof Error ? err.message : 'Erreur de connexion'));
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                backgroundColor: themeMode === 'dark' ? '#1976d2' : 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <LockIcon sx={{ fontSize: 30, color: 'white' }} />
            </Box>
          </motion.div>

          <Typography
            component="h1"
            variant="h5"
            sx={{
              fontWeight: 600,
              color: themeMode === 'dark' ? '#90caf9' : 'primary.main',
              mb: 3,
            }}
          >
            Connexion
          </Typography>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                {error}
              </Alert>
            </motion.div>
          )}

          <Paper
            elevation={3}
            sx={{
              p: 4,
              width: '100%',
              background: themeMode === 'dark'
                ? 'linear-gradient(145deg, #23272b 0%, #181a1b 100%)'
                : 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
              borderRadius: 2,
              color: themeMode === 'dark' ? '#fff' : 'inherit',
              boxShadow: themeMode === 'dark' ? '0 4px 12px rgba(0,0,0,0.7)' : undefined,
            }}
          >
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Adresse email"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: <EmailIcon sx={{ mr: 1, color: themeMode === 'dark' ? '#90caf9' : 'primary.main' }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: themeMode === 'dark' ? '#223040' : undefined,
                    color: themeMode === 'dark' ? '#fff' : undefined,
                    '& fieldset': {
                      borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.23)' : undefined,
                    },
                    '&:hover fieldset': {
                      borderColor: themeMode === 'dark' ? '#90caf9' : undefined,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: themeMode === 'dark' ? 'rgba(255,255,255,0.7)' : undefined,
                  },
                  input: {
                    color: themeMode === 'dark' ? '#fff' : undefined,
                  },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Mot de passe"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: <LockIcon sx={{ mr: 1, color: themeMode === 'dark' ? '#90caf9' : 'primary.main' }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: themeMode === 'dark' ? '#223040' : undefined,
                    color: themeMode === 'dark' ? '#fff' : undefined,
                    '& fieldset': {
                      borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.23)' : undefined,
                    },
                    '&:hover fieldset': {
                      borderColor: themeMode === 'dark' ? '#90caf9' : undefined,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: themeMode === 'dark' ? 'rgba(255,255,255,0.7)' : undefined,
                  },
                  input: {
                    color: themeMode === 'dark' ? '#fff' : undefined,
                  },
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  background: themeMode === 'dark'
                    ? 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)'
                    : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  boxShadow: themeMode === 'dark'
                    ? '0 3px 5px 2px rgba(33, 203, 243, .15)'
                    : '0 3px 5px 2px rgba(33, 203, 243, .3)',
                  color: '#fff',
                  '&:hover': {
                    background: themeMode === 'dark'
                      ? 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)'
                      : 'linear-gradient(45deg, #1976D2 30%, #1E88E5 90%)',
                  },
                }}
                disabled={loading}
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </Button>
              <Box sx={{ textAlign: 'center' }}>
                <span
                  style={{
                    color: themeMode === 'dark' ? '#90caf9' : 'primary.main',
                    fontSize: 14,
                  }}
                >
                  <Link
                    component={RouterLink}
                    to="/register"
                    variant="body2"
                    sx={{
                      color: themeMode === 'dark' ? '#90caf9' : 'primary.main',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    {"Pas encore de compte ? S'inscrire"}
                  </Link>
                </span>
              </Box>
            </Box>
          </Paper>
        </Box>
      </motion.div>
    </Container>
  );
};

export default Login; 