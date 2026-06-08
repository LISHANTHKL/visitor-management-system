import { useEffect, useState } from 'react';
import { Link as RouterLink, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LoginIcon from '@mui/icons-material/Login';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import { useAppDispatch } from '../hooks/useAppDispatch.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import { clearAuthError, login } from '../store/authSlice.js';

const roleHomePaths = {
  employee: '/employee/visitors',
  security: '/security'
};

const getRedirectPath = (user, fallback = '/') => roleHomePaths[user?.role] || fallback;

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);
  const [formData, setFormData] = useState({ email: 'admin@test.com', password: '' });

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  if (isLoading && isAuthenticated) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#0d1117' }}>
        <CircularProgress sx={{ color: '#3b82f6' }} />
      </Box>
    );
  }

  if (isAuthenticated && !isLoading) {
    return <Navigate to={getRedirectPath(null, from)} replace />;
  }

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login(formData));
    if (login.fulfilled.match(result)) {
      navigate(getRedirectPath(result.payload.user, from), { replace: true });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0d1117 0%, #0f172a 40%, #1a237e 80%, #0d1117 100%)'
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(37,99,235,0.18) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '5%',
          right: '5%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          width: 800,
          height: 800,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(59,130,246,0.05) 0%, transparent 60%)',
          pointerEvents: 'none'
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          top: 28,
          left: 36,
          display: 'flex',
          alignItems: 'center',
          gap: 1.25
        }}
      >
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37,99,235,0.4)'
          }}
        >
          <ShieldOutlinedIcon sx={{ color: '#fff', fontSize: 17 }} />
        </Box>
        <Typography sx={{ color: '#f1f5f9', fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.01em' }}>
          Visitor Management System
        </Typography>
      </Box>

      <Box
        sx={{
          width: '100%',
          maxWidth: 420,
          mx: 2,
          position: 'relative',
          zIndex: 1
        }}
      >
        <Box
          sx={{
            bgcolor: 'rgba(255,255,255,0.97)',
            borderRadius: 3.5,
            p: { xs: 3.5, sm: 4.5 },
            boxShadow: '0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)'
          }}
        >
          <Box sx={{ mb: 3.5 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2.5,
                boxShadow: '0 8px 20px rgba(37,99,235,0.35)'
              }}
            >
              <ShieldOutlinedIcon sx={{ color: '#fff', fontSize: 26 }} />
            </Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5, letterSpacing: '-0.02em' }}
            >
              Welcome back
            </Typography>
            <Typography sx={{ color: '#64748b', fontSize: '0.9375rem' }}>
              Sign in to your account
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <Box>
                <Typography
                  sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#374151', mb: 0.75 }}
                >
                  Email address
                </Typography>
                <TextField
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  fullWidth
                  autoComplete="email"
                  placeholder="you@company.com"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MailOutlineIcon sx={{ fontSize: 17, color: '#94a3b8' }} />
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#f8fafc',
                      fontSize: '0.9375rem',
                      '& fieldset': { borderColor: '#e2e8f0' },
                      '&.Mui-focused fieldset': { borderColor: '#2563eb' }
                    }
                  }}
                />
              </Box>

              <Box>
                <Typography
                  sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#374151', mb: 0.75 }}
                >
                  Password
                </Typography>
                <TextField
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  fullWidth
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ fontSize: 17, color: '#94a3b8' }} />
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#f8fafc',
                      fontSize: '0.9375rem',
                      '& fieldset': { borderColor: '#e2e8f0' }
                    }
                  }}
                />
              </Box>

              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={
                  isLoading ? <CircularProgress color="inherit" size={16} /> : <LoginIcon />
                }
                disabled={isLoading}
                fullWidth
                sx={{
                  py: 1.375,
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  borderRadius: 2.5,
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%)',
                  boxShadow: '0 6px 20px rgba(37,99,235,0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 60%, #2563eb 100%)',
                    boxShadow: '0 8px 24px rgba(37,99,235,0.5)'
                  }
                }}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </Stack>
          </Box>

          <Box
            sx={{
              mt: 3,
              pt: 3,
              borderTop: '1px solid #f1f5f9'
            }}
          >
            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1.5 }}>
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: 2,
                  bgcolor: '#f0fdf4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <PersonAddAltIcon sx={{ color: '#16a34a', fontSize: 16 }} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                Are you a visitor?
              </Typography>
            </Stack>
            <Typography sx={{ color: '#94a3b8', fontSize: '0.8125rem', mb: 2, lineHeight: 1.6 }}>
              No account needed — request a visit directly with any employee.
            </Typography>
            <Button
              component={RouterLink}
              to="/visitor/request"
              variant="outlined"
              fullWidth
              sx={{
                borderRadius: 2,
                fontWeight: 600,
                fontSize: '0.875rem',
                borderColor: '#e2e8f0',
                color: '#374151',
                '&:hover': { borderColor: '#2563eb', color: '#2563eb', bgcolor: '#eff6ff' }
              }}
            >
              Request a Visit
            </Button>
          </Box>
        </Box>

        <Typography
          sx={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem', textAlign: 'center', mt: 3 }}
        >
          &copy; {new Date().getFullYear()} Visitor Management System. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginPage;
