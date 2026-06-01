import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import LogoutIcon from '@mui/icons-material/Logout';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { useAppDispatch } from '../hooks/useAppDispatch.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import { logout } from '../store/authSlice.js';

const navItems = [
  { label: 'Dashboard', path: '/', icon: <DashboardIcon fontSize="small" />, roles: ['admin'] },
  { label: 'Users', path: '/admin/users', icon: <PeopleAltIcon fontSize="small" />, roles: ['admin'] },
  {
    label: 'Visitor Requests',
    path: '/admin/visitor-requests',
    icon: <AssignmentTurnedInIcon fontSize="small" />,
    roles: ['admin']
  },
  {
    label: 'My Visitors',
    path: '/employee/visitors',
    icon: <EventAvailableIcon fontSize="small" />,
    roles: ['employee']
  },
  {
    label: 'QR Scanner',
    path: '/security/scan',
    icon: <QrCodeScannerIcon fontSize="small" />,
    roles: ['security']
  },
  {
    label: 'Visitor Logs',
    path: '/security/visitor-logs',
    icon: <ReceiptLongIcon fontSize="small" />,
    roles: ['security']
  }
];

const roleLabels = {
  admin: 'Admin',
  employee: 'Employee',
  security: 'Security'
};

const roleColors = {
  admin: 'primary',
  employee: 'secondary',
  security: 'warning'
};

const MainLayout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isLoading } = useAppSelector((state) => state.auth);
  const [profileAnchor, setProfileAnchor] = useState(null);
  const isProfileMenuOpen = Boolean(profileAnchor);
  const roleLabel = roleLabels[user?.role] || 'User';

  const handleProfileOpen = (event) => {
    setProfileAnchor(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchor(null);
  };

  const handleLogout = async () => {
    handleProfileClose();
    await dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
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

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ flex: 1 }}>
            {navItems
              .filter((item) => !item.roles || item.roles.includes(user?.role))
              .map((item) => (
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

          <Stack direction="row" alignItems="center" spacing={1.5}>
            {user && (
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ display: { xs: 'none', sm: 'flex' } }}
              >
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                    {user.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
                <Chip
                  label={roleLabel}
                  color={roleColors[user.role] || 'default'}
                  size="small"
                  variant="outlined"
                />
              </Stack>
            )}

            <IconButton
              aria-label="Open profile menu"
              aria-controls={isProfileMenuOpen ? 'profile-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={isProfileMenuOpen ? 'true' : undefined}
              onClick={handleProfileOpen}
              disabled={isLoading}
            >
              <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main' }}>
                {user?.name ? user.name.charAt(0).toUpperCase() : <AccountCircleIcon />}
              </Avatar>
            </IconButton>

            <Button
              variant="outlined"
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              disabled={isLoading}
              sx={{ display: { xs: 'none', md: 'inline-flex' } }}
            >
              Logout
            </Button>
          </Stack>

          <Menu
            id="profile-menu"
            anchorEl={profileAnchor}
            open={isProfileMenuOpen}
            onClose={handleProfileClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Box sx={{ px: 2, py: 1.25, minWidth: 220 }}>
              <Typography variant="subtitle2">{user?.name || 'Loading user'}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email || ''}
              </Typography>
              <Chip
                label={roleLabel}
                color={roleColors[user?.role] || 'default'}
                size="small"
                variant="outlined"
                sx={{ mt: 1 }}
              />
            </Box>
            <Divider />
            <MenuItem onClick={handleLogout} disabled={isLoading}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container component="main" maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Outlet />
      </Container>
    </Box>
  );
};

export default MainLayout;
