import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Stack, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SearchOffIcon from '@mui/icons-material/SearchOff';

const NotFoundPage = () => (
  <Box
    sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0d1117 0%, #0f172a 50%, #1a237e 100%)',
      display: 'grid',
      placeItems: 'center',
      p: 3
    }}
  >
    <Stack spacing={3.5} alignItems="center" textAlign="center">
      <Box
        sx={{
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'rgba(37,99,235,0.2)',
          border: '2px solid rgba(59,130,246,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <SearchOffIcon sx={{ fontSize: 48, color: '#60a5fa' }} />
      </Box>

      <Box>
        <Typography
          sx={{
            fontSize: '7rem',
            fontWeight: 800,
            color: 'rgba(255,255,255,0.06)',
            lineHeight: 1,
            mb: 0.5,
            letterSpacing: '-0.04em'
          }}
        >
          404
        </Typography>
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, color: '#f1f5f9', mb: 1.5, letterSpacing: '-0.02em' }}
        >
          Page not found
        </Typography>
        <Typography sx={{ color: '#64748b', maxWidth: 360, mx: 'auto', lineHeight: 1.7, fontSize: '0.9375rem' }}>
          The page you are looking for doesn&apos;t exist or has been moved.
        </Typography>
      </Box>

      <Button
        component={RouterLink}
        to="/"
        variant="contained"
        startIcon={<HomeIcon />}
        sx={{
          px: 4,
          py: 1.375,
          borderRadius: 2.5,
          fontWeight: 700,
          fontSize: '0.9375rem',
          background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
          boxShadow: '0 8px 24px rgba(37,99,235,0.4)',
          '&:hover': { background: 'linear-gradient(135deg, #1e40af, #1d4ed8)' }
        }}
      >
        Back to Dashboard
      </Button>
    </Stack>
  </Box>
);

export default NotFoundPage;
