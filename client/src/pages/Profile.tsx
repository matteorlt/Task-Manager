import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Avatar,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { PhotoCamera, Delete } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setUser } from '../store/slices/authSlice';
import { API_ENDPOINTS } from '../config';
import axios from 'axios';

interface ProfileData {
  id: number;
  name: string;
  email: string;
  profilePicture: string | null;
  createdAt: string;
  updatedAt: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const Profile: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.PROFILE.GET, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfileData(response.data);
      setFormData(prev => ({
        ...prev,
        name: response.data.name,
        email: response.data.email,
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      setError('Erreur lors de la récupération du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.put(API_ENDPOINTS.PROFILE.UPDATE, {
        name: formData.name,
        email: formData.email,
        ...(formData.password && { password: formData.password }),
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProfileData(response.data);
      dispatch(setUser({
        id: response.data.id,
        name: response.data.name,
        email: response.data.email,
        profilePicture: response.data.profilePicture,
      }));
      setSuccess('Profil mis à jour avec succès');
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: '',
      }));
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setError('La taille du fichier ne doit pas dépasser 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      setLoading(true);
      const response = await axios.post(API_ENDPOINTS.PROFILE.UPLOAD_PICTURE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        },
      });
      setProfileData(response.data);
      setSuccess('Photo de profil mise à jour avec succès');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erreur lors de la mise à jour de la photo de profil');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePicture = async () => {
    try {
      setLoading(true);
      const response = await axios.delete(API_ENDPOINTS.PROFILE.REMOVE_PICTURE, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfileData(response.data);
      setSuccess('Photo de profil supprimée avec succès');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erreur lors de la suppression de la photo de profil');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profileData) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!profileData) {
    return null;
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Avatar
            src={profileData.profilePicture ? `http://localhost:3000${profileData.profilePicture}` : undefined}
            sx={{ width: 120, height: 120, mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="profile-picture-upload"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="profile-picture-upload">
              <IconButton color="primary" component="span" disabled={loading}>
                <PhotoCamera />
              </IconButton>
            </label>
            {profileData.profilePicture && (
              <IconButton color="error" onClick={handleRemovePicture} disabled={loading}>
                <Delete />
              </IconButton>
            )}
          </Box>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Nom"
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Nouveau mot de passe"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Confirmer le mot de passe"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            margin="normal"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Mettre à jour le profil'}
          </Button>
        </form>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Compte créé le: {new Date(profileData.createdAt).toLocaleDateString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Dernière mise à jour: {new Date(profileData.updatedAt).toLocaleDateString()}
          </Typography>
        </Box>
      </Paper>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile; 