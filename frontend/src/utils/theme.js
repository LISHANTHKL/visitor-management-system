import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb',
      light: '#dbeafe',
      dark: '#1d4ed8',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#8b5cf6',
      light: '#ede9fe',
      dark: '#7c3aed'
    },
    success: {
      main: '#16a34a',
      light: '#dcfce7',
      dark: '#15803d'
    },
    warning: {
      main: '#d97706',
      light: '#fef3c7',
      dark: '#b45309'
    },
    error: {
      main: '#dc2626',
      light: '#fee2e2',
      dark: '#b91c1c'
    },
    info: {
      main: '#0891b2',
      light: '#cffafe',
      dark: '#0e7490'
    },
    background: {
      default: '#eef2ff',
      paper: '#ffffff'
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b'
    },
    divider: '#e2e8f0'
  },
  shape: {
    borderRadius: 12
  },
  typography: {
    fontFamily: ['Inter', 'system-ui', '-apple-system', 'sans-serif'].join(','),
    h1: { fontWeight: 800, letterSpacing: '-0.025em' },
    h2: { fontWeight: 800, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700, letterSpacing: '-0.015em' },
    h4: { fontWeight: 700, letterSpacing: '-0.01em', fontSize: '1.375rem' },
    h5: { fontWeight: 700, letterSpacing: '-0.005em' },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    body2: { color: '#374151' },
    overline: { fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.7rem' }
  },
  shadows: [
    'none',
    '0 1px 2px rgba(0,0,0,0.05)',
    '0 1px 3px rgba(0,0,0,0.08),0 1px 2px rgba(0,0,0,0.04)',
    '0 4px 6px rgba(0,0,0,0.06),0 2px 4px rgba(0,0,0,0.04)',
    '0 10px 15px rgba(0,0,0,0.07),0 4px 6px rgba(0,0,0,0.04)',
    '0 20px 25px rgba(0,0,0,0.08),0 8px 10px rgba(0,0,0,0.04)',
    '0 25px 50px rgba(0,0,0,0.15)',
    '0 25px 50px rgba(0,0,0,0.15)',
    '0 25px 50px rgba(0,0,0,0.15)',
    '0 25px 50px rgba(0,0,0,0.15)',
    '0 25px 50px rgba(0,0,0,0.15)',
    '0 25px 50px rgba(0,0,0,0.15)',
    '0 25px 50px rgba(0,0,0,0.15)',
    '0 25px 50px rgba(0,0,0,0.15)',
    '0 25px 50px rgba(0,0,0,0.15)',
    '0 25px 50px rgba(0,0,0,0.15)',
    '0 25px 50px rgba(0,0,0,0.15)',
    '0 25px 50px rgba(0,0,0,0.15)',
    '0 25px 50px rgba(0,0,0,0.15)',
    '0 25px 50px rgba(0,0,0,0.15)',
    '0 25px 50px rgba(0,0,0,0.15)',
    '0 25px 50px rgba(0,0,0,0.15)',
    '0 25px 50px rgba(0,0,0,0.15)',
    '0 25px 50px rgba(0,0,0,0.15)',
    '0 25px 50px rgba(0,0,0,0.15)'
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: { WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' },
        '*': { boxSizing: 'border-box' }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' }
        },
        contained: {
          '&:hover': { boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }
        },
        sizeLarge: { padding: '11px 28px', fontSize: '0.9375rem' }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
        outlined: { borderColor: '#e2e8f0' },
        elevation1: { boxShadow: '0 2px 8px rgba(0,0,0,0.06),0 0 0 1px rgba(0,0,0,0.04)' },
        elevation2: { boxShadow: '0 4px 12px rgba(0,0,0,0.08),0 0 0 1px rgba(0,0,0,0.04)' }
      }
    },
    MuiCard: {
      styleOverrides: { root: { backgroundImage: 'none' } }
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#f8fafc',
            fontWeight: 700,
            fontSize: '0.7rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#94a3b8',
            borderBottom: '2px solid #e2e8f0'
          }
        }
      }
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          '& .MuiTableRow-root:last-child .MuiTableCell-body': { borderBottom: 0 }
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: '#f1f5f9', padding: '13px 16px' }
      }
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&.MuiTableRow-hover:hover': { backgroundColor: '#f8fafc' }
        }
      }
    },
    MuiTextField: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#ffffff',
            '& fieldset': { borderColor: '#e2e8f0' },
            '&:hover fieldset': { borderColor: '#94a3b8' },
            '&.Mui-focused fieldset': { borderColor: '#2563eb', borderWidth: 2 }
          }
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '& fieldset': { borderColor: '#e2e8f0' },
          '&:hover fieldset': { borderColor: '#94a3b8' }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, borderRadius: 6, fontSize: '0.75rem' }
      }
    },
    MuiAlert: {
      styleOverrides: { root: { borderRadius: 10 } }
    },
    MuiTab: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' }
      }
    },
    MuiTabs: {
      styleOverrides: { indicator: { height: 2.5, borderRadius: 2 } }
    },
    MuiDivider: {
      styleOverrides: { root: { borderColor: '#e2e8f0' } }
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 16, boxShadow: '0 30px 60px rgba(0,0,0,0.2)' }
      }
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: { fontWeight: 700, fontSize: '1.0625rem', padding: '20px 24px 12px' }
      }
    },
    MuiMenuItem: {
      styleOverrides: {
        root: { borderRadius: 6, margin: '1px 4px', fontSize: '0.875rem' }
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { fontSize: '0.75rem', borderRadius: 6 }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { backgroundImage: 'none' }
      }
    }
  }
});
