import { createTheme, ThemeOptions } from '@mui/material/styles';

const getThemeOptions = (mode: 'light' | 'dark'): ThemeOptions => ({
  palette: {
    mode,
    primary: {
      main: mode === 'light' ? '#2196f3' : '#90caf9',
      light: mode === 'light' ? '#64b5f6' : '#e3f2fd',
      dark: mode === 'light' ? '#1976d2' : '#42a5f5',
    },
    secondary: {
      main: mode === 'light' ? '#f50057' : '#f48fb1',
      light: mode === 'light' ? '#ff4081' : '#fce4ec',
      dark: mode === 'light' ? '#c51162' : '#f06292',
    },
    background: {
      default: mode === 'light' ? '#f5f5f5' : '#121212',
      paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
    },
    text: {
      primary: mode === 'light' ? 'rgba(0, 0, 0, 0.87)' : '#ffffff',
      secondary: mode === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
      letterSpacing: '-0.01562em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      letterSpacing: '-0.00833em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
      letterSpacing: '0em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      letterSpacing: '0.00735em',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      letterSpacing: '0em',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      letterSpacing: '0.0075em',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: mode === 'light' 
              ? '0 4px 8px rgba(0, 0, 0, 0.1)'
              : '0 4px 8px rgba(255, 255, 255, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: mode === 'light'
            ? '0 4px 6px rgba(0, 0, 0, 0.1)'
            : '0 4px 6px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: mode === 'light'
              ? '0 8px 12px rgba(0, 0, 0, 0.15)'
              : '0 8px 12px rgba(0, 0, 0, 0.4)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: mode === 'light'
              ? '0 6px 12px rgba(0, 0, 0, 0.1)'
              : '0 6px 12px rgba(0, 0, 0, 0.3)',
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: mode === 'light'
              ? 'rgba(33, 150, 243, 0.08)'
              : 'rgba(144, 202, 249, 0.08)',
            transform: 'translateX(4px)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
            },
          },
        },
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: mode === 'light' ? [
    'none',
    '0 2px 4px rgba(0,0,0,0.05)',
    '0 4px 6px rgba(0,0,0,0.07)',
    '0 6px 8px rgba(0,0,0,0.08)',
    '0 8px 10px rgba(0,0,0,0.09)',
    '0 10px 12px rgba(0,0,0,0.1)',
    '0 12px 14px rgba(0,0,0,0.11)',
    '0 14px 16px rgba(0,0,0,0.12)',
    '0 16px 18px rgba(0,0,0,0.13)',
    '0 18px 20px rgba(0,0,0,0.14)',
    '0 20px 22px rgba(0,0,0,0.15)',
    '0 22px 24px rgba(0,0,0,0.16)',
    '0 24px 26px rgba(0,0,0,0.17)',
    '0 26px 28px rgba(0,0,0,0.18)',
    '0 28px 30px rgba(0,0,0,0.19)',
    '0 30px 32px rgba(0,0,0,0.2)',
    '0 32px 34px rgba(0,0,0,0.21)',
    '0 34px 36px rgba(0,0,0,0.22)',
    '0 36px 38px rgba(0,0,0,0.23)',
    '0 38px 40px rgba(0,0,0,0.24)',
    '0 40px 42px rgba(0,0,0,0.25)',
    '0 42px 44px rgba(0,0,0,0.26)',
    '0 44px 46px rgba(0,0,0,0.27)',
    '0 46px 48px rgba(0,0,0,0.28)',
    '0 48px 50px rgba(0,0,0,0.29)',
  ] : [
    'none',
    '0 2px 4px rgba(0,0,0,0.2)',
    '0 4px 6px rgba(0,0,0,0.3)',
    '0 6px 8px rgba(0,0,0,0.4)',
    '0 8px 10px rgba(0,0,0,0.5)',
    '0 10px 12px rgba(0,0,0,0.6)',
    '0 12px 14px rgba(0,0,0,0.7)',
    '0 14px 16px rgba(0,0,0,0.8)',
    '0 16px 18px rgba(0,0,0,0.9)',
    '0 18px 20px rgba(0,0,0,1)',
    '0 20px 22px rgba(0,0,0,1.1)',
    '0 22px 24px rgba(0,0,0,1.2)',
    '0 24px 26px rgba(0,0,0,1.3)',
    '0 26px 28px rgba(0,0,0,1.4)',
    '0 28px 30px rgba(0,0,0,1.5)',
    '0 30px 32px rgba(0,0,0,1.6)',
    '0 32px 34px rgba(0,0,0,1.7)',
    '0 34px 36px rgba(0,0,0,1.8)',
    '0 36px 38px rgba(0,0,0,1.9)',
    '0 38px 40px rgba(0,0,0,2)',
    '0 40px 42px rgba(0,0,0,2.1)',
    '0 42px 44px rgba(0,0,0,2.2)',
    '0 44px 46px rgba(0,0,0,2.3)',
    '0 46px 48px rgba(0,0,0,2.4)',
    '0 48px 50px rgba(0,0,0,2.5)',
  ],
});

export const createAppTheme = (mode: 'light' | 'dark') => createTheme(getThemeOptions(mode)); 