import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  Drawer,
  IconButton,
  Stack,
  Tooltip,
  Typography
} from '@mui/material';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import UpcomingIcon from '@mui/icons-material/Upcoming';
import { useAppDispatch } from '../hooks/useAppDispatch.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import { logout } from '../store/authSlice.js';

const SIDEBAR_W = 256;

const navItems = [
  {
    label: 'Dashboard',
    path: '/',
    icon: <DashboardIcon sx={{ fontSize: 18 }} />,
    roles: ['admin']
  },
  {
    label: 'Users',
    path: '/admin/users',
    icon: <PeopleAltIcon sx={{ fontSize: 18 }} />,
    roles: ['admin']
  },
  {
    label: 'Visitor Requests',
    path: '/admin/visitor-requests',
    icon: <AssignmentTurnedInIcon sx={{ fontSize: 18 }} />,
    roles: ['admin']
  },
  {
    label: 'Logs & Reports',
    path: '/admin/logs',
    icon: <ReceiptLongIcon sx={{ fontSize: 18 }} />,
    roles: ['admin']
  },
  {
    label: 'My Visitors',
    path: '/employee/visitors',
    icon: <UpcomingIcon sx={{ fontSize: 18 }} />,
    roles: ['employee']
  },
  {
    label: 'QR Scanner',
    path: '/security/scan',
    icon: <QrCodeScannerIcon sx={{ fontSize: 18 }} />,
    roles: ['security']
  },
  {
    label: 'Visitor Logs',
    path: '/security/logs',
    icon: <ReceiptLongIcon sx={{ fontSize: 18 }} />,
    roles: ['security']
  }
];

const roleBadgeColors = {
  admin: { bg: 'rgba(37,99,235,0.18)', text: '#93c5fd' },
  employee: { bg: 'rgba(16,185,129,0.18)', text: '#6ee7b7' },
  security: { bg: 'rgba(217,119,6,0.18)', text: '#fcd34d' }
};

const MainLayout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isLoading } = useAppSelector((state) => state.auth);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login', { replace: true });
  };

  const filteredNav = navItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role)
  );

  const roleBadge = roleBadgeColors[user?.role] || { bg: 'rgba(255,255,255,0.1)', text: '#94a3b8' };

  const sidebarContent = (
    <Box
      sx={{
        width: SIDEBAR_W,
        height: '100%',
        bgcolor: '#0d1117',
        display: 'flex',
        flexDirection: 'column',
        borderRight: 'none'
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 3,
          borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2.5,
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37,99,235,0.4)',
              flexShrink: 0
            }}
          >
            <ShieldOutlinedIcon sx={{ color: '#fff', fontSize: 19 }} />
          </Box>
          <Box>
            <Typography
              sx={{
                color: '#f1f5f9',
                fontWeight: 800,
                fontSize: '0.9375rem',
                lineHeight: 1.2,
                letterSpacing: '-0.01em'
              }}
            >
              Visitor Management System
            </Typography>
            <Typography sx={{ color: '#475569', fontSize: '0.65rem', fontWeight: 500 }}>
              Management System
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ flex: 1, px: 1.5, py: 2.5, overflowY: 'auto' }}>
        <Typography
          sx={{
            color: '#334155',
            fontSize: '0.625rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            px: 1.75,
            mb: 1.25
          }}
        >
          Menu
        </Typography>

        {filteredNav.map((item) => (
          <Box
            key={item.path}
            component={NavLink}
            to={item.path}
            end={item.path === '/'}
            onClick={() => setMobileOpen(false)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 1.75,
              py: 1.125,
              borderRadius: 2,
              mb: 0.375,
              color: '#64748b',
              textDecoration: 'none',
              fontSize: '0.8125rem',
              fontWeight: 500,
              transition: 'all 0.15s ease',
              position: 'relative',
              '&:hover': {
                color: '#cbd5e1',
                bgcolor: 'rgba(255,255,255,0.05)'
              },
              '&.active': {
                color: '#93c5fd',
                bgcolor: 'rgba(37,99,235,0.15)',
                fontWeight: 700,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: '20%',
                  bottom: '20%',
                  width: 3,
                  borderRadius: '0 2px 2px 0',
                  bgcolor: '#3b82f6',
                  background: '#3b82f6'
                }
              }
            }}
          >
            <Box
              sx={{
                color: 'inherit',
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0
              }}
            >
              {item.icon}
            </Box>
            {item.label}
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          px: 1.5,
          pb: 2,
          pt: 1.5,
          borderTop: '1px solid rgba(255,255,255,0.06)'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            p: 1.5,
            borderRadius: 2,
            bgcolor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.05)'
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              fontSize: '0.875rem',
              fontWeight: 800,
              flexShrink: 0
            }}
          >
            {user?.name?.charAt(0).toUpperCase() || '?'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              noWrap
              sx={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.8125rem', lineHeight: 1.3 }}
            >
              {user?.name || 'Loading...'}
            </Typography>
            <Box
              sx={{
                display: 'inline-block',
                mt: 0.4,
                px: 1,
                py: 0.15,
                borderRadius: 4,
                bgcolor: roleBadge.bg,
                color: roleBadge.text,
                fontSize: '0.6rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase'
              }}
            >
              {user?.role || 'user'}
            </Box>
          </Box>
          <Tooltip title="Sign out" placement="top">
            <IconButton
              size="small"
              onClick={handleLogout}
              disabled={isLoading}
              sx={{
                color: '#475569',
                flexShrink: 0,
                '&:hover': { color: '#f87171', bgcolor: 'rgba(239,68,68,0.1)' }
              }}
            >
              <LogoutIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: SIDEBAR_W,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: SIDEBAR_W,
            boxSizing: 'border-box',
            border: 'none',
            bgcolor: '#0d1117',
            boxShadow: '2px 0 20px rgba(0,0,0,0.3)'
          }
        }}
      >
        {sidebarContent}
      </Drawer>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: SIDEBAR_W,
            boxSizing: 'border-box',
            border: 'none',
            bgcolor: '#0d1117'
          }
        }}
      >
        {sidebarContent}
      </Drawer>

      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#eef2ff'
        }}
      >
        <Box
          sx={{
            display: { xs: 'flex', md: 'none' },
            alignItems: 'center',
            gap: 1.5,
            px: 2,
            py: 1.5,
            bgcolor: '#0d1117',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            position: 'sticky',
            top: 0,
            zIndex: 100
          }}
        >
          <IconButton
            onClick={() => setMobileOpen(true)}
            sx={{ color: '#94a3b8', p: 0.75 }}
          >
            <MenuIcon />
          </IconButton>
          <Stack direction="row" spacing={1} alignItems="center">
            <ShieldOutlinedIcon sx={{ color: '#60a5fa', fontSize: 20 }} />
            <Typography sx={{ color: '#f1f5f9', fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.01em' }}>
              Visitor Management System
            </Typography>
          </Stack>
        </Box>

        <Box sx={{ flex: 1, p: { xs: 2.5, md: 3.5 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
