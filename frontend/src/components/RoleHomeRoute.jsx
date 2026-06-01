import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/useAppSelector.js';
import DashboardPage from '../pages/DashboardPage.jsx';

const roleHomePaths = {
  employee: '/employee/visitors',
  security: '/security'
};

const RoleHomeRoute = () => {
  const user = useAppSelector((state) => state.auth.user);
  const homePath = roleHomePaths[user?.role];

  if (homePath) {
    return <Navigate to={homePath} replace />;
  }

  return <DashboardPage />;
};

export default RoleHomeRoute;
