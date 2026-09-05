import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0a0e17',
      paper: 'rgba(22, 30, 46, 0.85)',
    },
    primary: {
      main: '#38bdf8',
      light: '#7dd3fc',
      dark: '#0284c7',
    },
    secondary: {
      main: '#8b5cf6',
      light: '#a78bfa',
      dark: '#7c3aed',
    },
    success: {
      main: '#10b981',
    },
    warning: {
      main: '#f59e0b',
    },
    error: {
      main: '#ef4444',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
    },
  },
  typography: {
    fontFamily: ['Inter', 'system-ui', '-apple-system', 'sans-serif'].join(','),
    h1: { fontFamily: 'Outfit, sans-serif', fontWeight: 800 },
    h2: { fontFamily: 'Outfit, sans-serif', fontWeight: 700 },
    h3: { fontFamily: 'Outfit, sans-serif', fontWeight: 700 },
    h4: { fontFamily: 'Outfit, sans-serif', fontWeight: 600 },
    h5: { fontFamily: 'Outfit, sans-serif', fontWeight: 600 },
    h6: { fontFamily: 'Outfit, sans-serif', fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
  },
});
