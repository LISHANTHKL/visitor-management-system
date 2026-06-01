import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { getHealth } from '../services/healthService.js';

const HealthPage = () => {
  const [health, setHealth] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadHealth = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await getHealth();
      setHealth(response.data);
    } catch (requestError) {
      setError(requestError.message || 'Unable to reach API');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHealth();
  }, []);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          API Health
        </Typography>
        <Typography color="text.secondary">
          Verifies the frontend can communicate with the backend health endpoint.
        </Typography>
      </Box>

      <Paper sx={{ p: 3, borderRadius: 2 }} variant="outlined">
        <Stack spacing={2}>
          <Button
            variant="contained"
            startIcon={isLoading ? <CircularProgress color="inherit" size={16} /> : <RefreshIcon />}
            onClick={loadHealth}
            disabled={isLoading}
            sx={{ alignSelf: 'flex-start' }}
          >
            Check API
          </Button>

          {error && <Alert severity="error">{error}</Alert>}

          {health && (
            <Alert severity="success">
              {health.service} is {health.status} as of {health.timestamp}
            </Alert>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
};

export default HealthPage;

