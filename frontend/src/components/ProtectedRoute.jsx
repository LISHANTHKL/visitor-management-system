import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAppSelector } from '../hooks/useAppSelector.js';

const ProtectedRoute = () => {
  const location = useLocation();
  const { isAuthenticated, isLoading, token, user } = useAppSelector((state) => state.auth);

  if (isLoading || (token && isAuthenticated && !user)) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
