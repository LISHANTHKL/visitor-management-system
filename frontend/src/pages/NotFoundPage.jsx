import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';

const NotFoundPage = () => (
  <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
    <Stack spacing={2} alignItems="center" textAlign="center">
      <Typography variant="h3" component="h1">
        Page not found
      </Typography>
      <Typography color="text.secondary">
        The page you are looking for does not exist.
      </Typography>
      <Box>
        <Button component={RouterLink} to="/" variant="contained" startIcon={<HomeIcon />}>
          Back to Dashboard
        </Button>
      </Box>
    </Stack>
  </Container>
);

export default NotFoundPage;

