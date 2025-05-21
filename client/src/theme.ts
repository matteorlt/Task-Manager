import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
    secondary: {
      main: '#f50057',
      light: '#ff4081',
      dark: '#c51162',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
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
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 12px rgba(0, 0, 0, 0.15)',
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
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(33, 150, 243, 0.08)',
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
  shadows: [
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
  ],
}); 