import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme as useMuiTheme,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assignment as TaskIcon,
  CalendarToday as CalendarIcon,
  Logout as LogoutIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { toggleTheme } from '../store/slices/themeSlice';
import InviteButton from './InviteButton';
import Notification from './Notification';
import { invitationService } from '../services/invitationService';

const Layout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [notifications, setNotifications] = useState<{ id: string; message: string }[]>([]);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const { token } = useSelector((state: RootState) => state.auth);
  const themeMode = useSelector((state: RootState) => state.theme.mode);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const invitations = await invitationService.getInvitations();
        const newNotifications = invitations.map(inv => ({
          id: inv.id,
          message: `Nouvelle invitation de ${inv.senderEmail}`,
        }));
        setNotifications(newNotifications);
      } catch (error) {
        console.error('Erreur lors de la récupération des invitations:', error);
      }
    };

    fetchInvitations();
    // Polling toutes les 30 secondes pour les nouvelles invitations
    const interval = setInterval(fetchInvitations, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const handleInvite = async (email: string) => {
    try {
      await invitationService.sendInvitation(email);
      // Ajouter une notification de succès
      setNotifications(prev => [...prev, {
        id: Date.now().toString(),
        message: `Invitation envoyée à ${email}`,
      }]);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'invitation:', error);
    }
  };

  const handleRemoveNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const menuItems = [
    { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/' },
    { text: 'Tâches', icon: <TaskIcon />, path: '/tasks' },
    { text: 'Calendrier', icon: <CalendarIcon />, path: '/calendar' },
    { text: 'Profil', icon: <PersonIcon />, path: '/profile' },
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '');
          return (
            <ListItem
              button
              key={item.text}
              onClick={() => {
                navigate(item.path);
                if (isMobile) {
                  setMobileOpen(false);
                }
              }}
              sx={{
                '&:hover': {
                  backgroundColor: themeMode === 'dark' ? 'rgba(144,202,249,0.08)' : 'rgba(33, 150, 243, 0.08)',
                },
                backgroundColor: isActive
                  ? (themeMode === 'dark' ? 'rgba(144,202,249,0.15)' : 'rgba(33, 150, 243, 0.15)')
                  : 'inherit',
                color: isActive
                  ? (themeMode === 'dark' ? '#90caf9' : 'primary.main')
                  : 'inherit',
                fontWeight: isActive ? 600 : 400,
              }}
            >
              <ListItemIcon sx={{ color: isActive ? (themeMode === 'dark' ? '#90caf9' : 'primary.main') : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          );
        })}
      </List>
      <List>
        <ListItem
          button
          onClick={handleThemeToggle}
          sx={{
            '&:hover': {
              backgroundColor: 'rgba(33, 150, 243, 0.08)',
            },
          }}
        >
          <ListItemIcon>
            {themeMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </ListItemIcon>
          <ListItemText primary={themeMode === 'dark' ? 'Mode clair' : 'Mode sombre'} />
        </ListItem>
        <ListItem
          button
          onClick={handleLogout}
          sx={{
            '&:hover': {
              backgroundColor: 'rgba(33, 150, 243, 0.08)',
            },
          }}
        >
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Déconnexion" />
        </ListItem>
      </List>
    </Box>
  );

  if (!token) {
    return <Outlet />;
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: themeMode === 'dark' ? '#1e1e1e' : 'primary.main',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Task Manager
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <InviteButton onInvite={handleInvite} />
            <IconButton color="inherit" onClick={handleThemeToggle}>
              {themeMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            <IconButton color="inherit" onClick={handleNotificationClick}>
              <Badge badgeContent={notifications.length} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={notificationAnchorEl}
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationClose}
        PaperProps={{
          sx: {
            width: 320,
            maxHeight: 400,
            mt: 1.5,
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          <IconButton size="small" onClick={handleNotificationClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        {notifications.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              Aucune notification
            </Typography>
          </MenuItem>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => {
                handleRemoveNotification(notification.id);
                handleNotificationClose();
              }}
              sx={{
                whiteSpace: 'normal',
                py: 1,
                '&:hover': {
                  backgroundColor: themeMode === 'dark' ? 'rgba(144,202,249,0.08)' : 'rgba(33, 150, 243, 0.08)',
                },
              }}
            >
              <Typography variant="body2">{notification.message}</Typography>
            </MenuItem>
          ))
        )}
      </Menu>

      <Box
        component="nav"
        sx={{
          width: { sm: 250 },
          flexShrink: { sm: 0 },
        }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: 250,
              background: themeMode === 'dark' ? '#1e1e1e' : '#fff',
              color: themeMode === 'dark' ? '#fff' : 'inherit',
              borderRight: themeMode === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.12)',
            },
          }}
        >
          <Toolbar />
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - 250px)` },
          mt: '64px',
          background: themeMode === 'dark' ? '#121212' : '#f5f5f5',
          minHeight: 'calc(100vh - 64px)',
          overflowY: 'auto',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout; 