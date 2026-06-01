import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import HomeIcon from '@mui/icons-material/Home';

const UnauthorizedPage = () => (
  <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
    <Stack spacing={2} alignItems="center" textAlign="center">
      <LockIcon color="warning" sx={{ fontSize: 48 }} />
      <Typography variant="h3" component="h1">
        Unauthorized
      </Typography>
      <Typography color="text.secondary">
        Your account does not have permission to access this page.
      </Typography>
      <Box>
        <Button component={RouterLink} to="/" variant="contained" startIcon={<HomeIcon />}>
          Back to Home
        </Button>
      </Box>
    </Stack>
  </Container>
);

export default UnauthorizedPage;

