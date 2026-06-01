import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import RoleHomeRoute from '../components/RoleHomeRoute.jsx';
import RoleProtectedRoute from '../components/RoleProtectedRoute.jsx';
import AdminUsersPage from '../pages/AdminUsersPage.jsx';
import AdminVisitorRequestsPage from '../pages/AdminVisitorRequestsPage.jsx';
import MainLayout from '../layouts/MainLayout.jsx';
import EmployeeVisitorsPage from '../pages/EmployeeVisitorsPage.jsx';
import HealthPage from '../pages/HealthPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import SecurityScannerPage from '../pages/SecurityScannerPage.jsx';
import SecurityVisitorLogsPage from '../pages/SecurityVisitorLogsPage.jsx';
import UnauthorizedPage from '../pages/UnauthorizedPage.jsx';
import VisitorPassPage from '../pages/VisitorPassPage.jsx';
import VisitorRequestPage from '../pages/VisitorRequestPage.jsx';

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
    path: '/visitor/request',
    element: <VisitorRequestPage />
  },
  {
    path: '/visitor/pass/:id',
    element: <VisitorPassPage />
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
            element: <RoleHomeRoute />
          },
          {
            element: <RoleProtectedRoute allowedRoles={['admin', 'security']} />,
            children: [
              {
                path: 'health',
                element: <HealthPage />
              }
            ]
          },
          {
            element: <RoleProtectedRoute allowedRoles={['security']} />,
            children: [
              {
                path: 'security',
                element: <Navigate to="/security/scan" replace />
              },
              {
                path: 'security/scan',
                element: <SecurityScannerPage />
              },
              {
                path: 'security/visitor-logs',
                element: <SecurityVisitorLogsPage />
              }
            ]
          },
          {
            element: <RoleProtectedRoute allowedRoles={['employee']} />,
            children: [
              {
                path: 'employee/visitors',
                element: <EmployeeVisitorsPage />
              }
            ]
          },
          {
            element: <RoleProtectedRoute allowedRoles={['admin']} />,
            children: [
              {
                path: 'admin/users',
                element: <AdminUsersPage />
              },
              {
                path: 'admin/visitor-requests',
                element: <AdminVisitorRequestsPage />
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
