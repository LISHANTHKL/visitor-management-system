import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import RoleProtectedRoute from '../components/RoleProtectedRoute.jsx';
import MainLayout from '../layouts/MainLayout.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import HealthPage from '../pages/HealthPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import UnauthorizedPage from '../pages/UnauthorizedPage.jsx';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />
          },
          {
            element: <RoleProtectedRoute allowedRoles={['admin', 'security']} />,
            children: [
              {
                path: 'health',
                element: <HealthPage />
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
]);
