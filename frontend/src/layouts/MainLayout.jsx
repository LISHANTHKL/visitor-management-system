import { Outlet, NavLink } from 'react-router-dom';
import {
  AppBar,
  Box,
  Button,
  Container,
  Stack,
  Toolbar,
  Typography
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';

const navItems = [
  { label: 'Dashboard', path: '/', icon: <DashboardIcon fontSize="small" /> },
  { label: 'Health', path: '/health', icon: <MonitorHeartIcon fontSize="small" /> }
];

const MainLayout = () => (
  <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
    <AppBar position="sticky" color="inherit" elevation={0}>
      <Toolbar
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          gap: 2,
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          py: 1
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
          Visitor Management
        </Typography>

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          {navItems.map((item) => (
            <Button
              key={item.path}
              component={NavLink}
              to={item.path}
              end={item.path === '/'}
              startIcon={item.icon}
              sx={{
                color: 'text.secondary',
                '&.active': {
                  color: 'primary.main',
                  bgcolor: 'primary.light'
                }
              }}
            >
              {item.label}
            </Button>
          ))}
        </Stack>
      </Toolbar>
    </AppBar>

    <Container component="main" maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Outlet />
    </Container>
  </Box>
);

export default MainLayout;
