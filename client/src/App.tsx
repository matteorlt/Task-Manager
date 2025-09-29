import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './store';
import { createAppTheme } from './theme';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Calendar from './pages/Calendar';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';
import { loginSuccess } from './store/slices/authSlice';
import { AnimatePresence, motion } from 'framer-motion';
import { RootState } from './store';
import Profile from './pages/Profile';
import axios from 'axios';
import InvitationsList from './components/InvitationsList';
import { API_ENDPOINTS } from './config';

type AuthLoaderProps = { children: React.ReactNode };

const AuthLoader: React.FC<AuthLoaderProps> = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Vérifier si le token est valide en faisant une requête au serveur
      axios.get(API_ENDPOINTS.AUTH.VERIFY, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => {
          dispatch(loginSuccess({ token, user: response.data.user }));
        })
        .catch(() => {
          localStorage.removeItem('token');
        });
    }
  }, [dispatch]);

  return <>{children}</>;
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Routes location={location}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<Layout />}>
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/tasks" element={<PrivateRoute><Tasks /></PrivateRoute>} />
            <Route path="/calendar" element={<PrivateRoute><Calendar /></PrivateRoute>} />
            <Route path="profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="invitations" element={<PrivateRoute><InvitationsList /></PrivateRoute>} />
          </Route>
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const AppContent: React.FC = () => {
  const themeMode = useSelector((state: RootState) => state.theme.mode);
  const theme = createAppTheme(themeMode);
  const { token } = useSelector((state: RootState) => state.auth);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <style>{`html, body, #root { overflow-x: hidden; }`}</style>
      <AuthLoader>
        <Router>
          <Routes>
            <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!token ? <Register /> : <Navigate to="/" />} />
            <Route
              path="/"
              element={token ? <Layout /> : <Navigate to="/login" />}
            >
              <Route index element={<Dashboard />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="profile" element={<Profile />} />
              <Route path="invitations" element={<InvitationsList />} />
            </Route>
          </Routes>
        </Router>
      </AuthLoader>
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App; 