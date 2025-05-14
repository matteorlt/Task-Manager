import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider, useDispatch } from 'react-redux';
import { store } from './store';
import { theme } from './theme';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Calendar from './pages/Calendar';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';
import { loginSuccess } from './store/slices/authSlice';

type AuthLoaderProps = { children: React.ReactNode };
const AuthLoader: React.FC<AuthLoaderProps> = ({ children }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // On ne connaît pas l'utilisateur, mais on garde le token
      dispatch(loginSuccess({ user: null, token }));
    }
  }, [dispatch]);
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthLoader>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route element={<Layout />}>
                <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/tasks" element={<PrivateRoute><Tasks /></PrivateRoute>} />
                <Route path="/calendar" element={<PrivateRoute><Calendar /></PrivateRoute>} />
              </Route>
            </Routes>
          </Router>
        </AuthLoader>
      </ThemeProvider>
    </Provider>
  );
};

export default App; 