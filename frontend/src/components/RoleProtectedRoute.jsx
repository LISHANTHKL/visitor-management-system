import { Navigate, Outlet } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAppSelector } from '../hooks/useAppSelector.js';

const RoleProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, isLoading, token } = useAppSelector((state) => state.auth);

  if (isLoading || (token && !user)) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default RoleProtectedRoute;

