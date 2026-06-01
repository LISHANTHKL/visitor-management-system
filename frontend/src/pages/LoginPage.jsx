import { useEffect, useState } from 'react';
import { Link as RouterLink, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import { useAppDispatch } from '../hooks/useAppDispatch.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import { clearAuthError, login } from '../store/authSlice.js';

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    email: 'admin@test.com',
    password: ''
  });

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  if (isLoading && isAuthenticated) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isAuthenticated && !isLoading) {
    return <Navigate to={from} replace />;
  }

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await dispatch(login(formData));

    if (login.fulfilled.match(result)) {
      navigate(from, { replace: true });
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'grid', placeItems: 'center', p: 2 }}>
      <Container maxWidth="xs">
        <Paper variant="outlined" sx={{ p: 4, borderRadius: 2 }}>
          <Stack component="form" spacing={3} onSubmit={handleSubmit}>
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                Sign in
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                Visitor Management System
              </Typography>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              fullWidth
              autoComplete="email"
            />

            <TextField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              fullWidth
              autoComplete="current-password"
            />

            <Button type="submit" variant="contained" size="large" startIcon={<LoginIcon />} disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>

            <Button component={RouterLink} to="/unauthorized" color="inherit">
              View unauthorized page
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
