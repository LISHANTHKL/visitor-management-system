import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { useAppDispatch } from '../hooks/useAppDispatch.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import { clearAnalyticsError, fetchAdminAnalytics } from '../store/analyticsSlice.js';
import { applyEmployeeStatusUpdate, fetchEmployeeAvailability } from '../store/availabilitySlice.js';
import { subscribeToDashboardUpdates, subscribeToEmployeeStatus } from '../services/socketService.js';

const chartColors = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2'];

const toDateInput = (date) => date.toISOString().slice(0, 10);

const getDefaultFilters = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 6);

  return {
    startDate: toDateInput(start),
    endDate: toDateInput(end),
    department: '',
    employeeId: ''
  };
};

const cardConfig = [
  { key: 'todayVisitors', label: "Today's Visitors", icon: <PeopleAltIcon color="primary" /> },
  { key: 'pendingApprovals', label: 'Pending Approvals', icon: <HourglassTopIcon color="warning" /> },
  { key: 'approvedToday', label: 'Approved Today', icon: <EventAvailableIcon color="success" /> },
  { key: 'checkedInVisitors', label: 'Checked In Visitors', icon: <LoginIcon color="success" /> },
  { key: 'checkedOutVisitors', label: 'Checked Out Visitors', icon: <LogoutIcon color="primary" /> },
  { key: 'availableEmployees', label: 'Available Employees', icon: <PeopleAltIcon color="success" /> },
  { key: 'occupiedEmployees', label: 'Occupied Employees', icon: <PeopleAltIcon color="warning" /> }
];

const SummaryCard = ({ label, value, icon }) => (
  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, height: '100%' }}>
    <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
      <Box>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h4" sx={{ mt: 0.75, fontWeight: 800 }}>
          {value ?? 0}
        </Typography>
      </Box>
      {icon}
    </Stack>
  </Paper>
);

const ChartPanel = ({ title, children, height = 280 }) => (
  <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: '100%' }}>
    <Stack spacing={2} sx={{ height: '100%' }}>
      <Typography variant="h6" component="h2">
        {title}
      </Typography>
      <Box sx={{ height }}>
        {children}
      </Box>
    </Stack>
  </Paper>
);

const EmployeeList = ({ title, employees, color }) => (
  <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: '100%' }}>
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" component="h2">
          {title}
        </Typography>
        <Chip label={employees.length} color={color} size="small" />
      </Stack>
      <Stack spacing={1.25}>
        {employees.length === 0 && <Typography color="text.secondary">No employees found.</Typography>}
        {employees.slice(0, 8).map((employee) => (
          <Box key={employee.employeeId} sx={{ borderBottom: 1, borderColor: 'divider', pb: 1 }}>
            <Typography sx={{ fontWeight: 700 }}>{employee.employeeName}</Typography>
            <Typography variant="body2" color="text.secondary">
              {[employee.department, employee.cabinNumber].filter(Boolean).join(' | ') || '-'}
            </Typography>
            {employee.currentVisitor?.visitorName && (
              <Typography variant="body2">Visitor: {employee.currentVisitor.visitorName}</Typography>
            )}
          </Box>
        ))}
      </Stack>
    </Stack>
  </Paper>
);

const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const { cards, charts, filters: filterOptions, isLoading, error } = useAppSelector((state) => state.analytics);
  const { availableEmployees, occupiedEmployees } = useAppSelector((state) => state.availability);
  const [filters, setFilters] = useState(getDefaultFilters);

  const activeFilters = useMemo(
    () => Object.fromEntries(Object.entries(filters).filter(([, value]) => String(value || '').trim())),
    [filters]
  );

  const loadDashboard = useCallback(() => {
    dispatch(fetchAdminAnalytics(activeFilters));
    dispatch(fetchEmployeeAvailability());
  }, [activeFilters, dispatch]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    const unsubscribeStatus = subscribeToEmployeeStatus((payload) => {
      dispatch(applyEmployeeStatusUpdate(payload));
      dispatch(fetchAdminAnalytics(activeFilters));
    });
    const unsubscribeDashboard = subscribeToDashboardUpdates(() => {
      loadDashboard();
    });

    return () => {
      unsubscribeStatus();
      unsubscribeDashboard();
    };
  }, [activeFilters, dispatch, loadDashboard]);

  const handleFilterChange = (field) => (event) => {
    setFilters((current) => ({
      ...current,
      [field]: event.target.value
    }));
  };

  const exportSummaryPdf = () => {
    const rows = cardConfig
      .map((card) => `<tr><td>${card.label}</td><td>${cards[card.key] ?? 0}</td></tr>`)
      .join('');
    const printWindow = window.open('', '_blank');

    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Analytics Dashboard Summary</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
            table { border-collapse: collapse; width: 100%; margin-top: 16px; }
            th, td { border: 1px solid #d1d5db; padding: 10px; text-align: left; }
            th { background: #f3f4f6; }
          </style>
        </head>
        <body>
          <h1>Analytics Dashboard Summary</h1>
          <p>${filters.startDate} to ${filters.endDate}</p>
          <table>
            <thead><tr><th>Metric</th><th>Value</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Analytics Dashboard
          </Typography>
          <Typography color="text.secondary">
            Visitor traffic, approvals, employee availability, and visit duration trends.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadDashboard} disabled={isLoading}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<DownloadIcon />} onClick={exportSummaryPdf}>
            Summary PDF
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" onClose={() => dispatch(clearAnalyticsError())}>
          {error}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              label="Start Date"
              type="date"
              value={filters.startDate}
              onChange={handleFilterChange('startDate')}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              label="End Date"
              type="date"
              value={filters.endDate}
              onChange={handleFilterChange('endDate')}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              label="Department"
              select
              value={filters.department}
              onChange={handleFilterChange('department')}
              fullWidth
            >
              <MenuItem value="">All Departments</MenuItem>
              {(filterOptions.departments || []).map((department) => (
                <MenuItem key={department} value={department}>
                  {department}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              label="Employee"
              select
              value={filters.employeeId}
              onChange={handleFilterChange('employeeId')}
              fullWidth
            >
              <MenuItem value="">All Employees</MenuItem>
              {(filterOptions.employees || []).map((employee) => (
                <MenuItem key={employee._id} value={employee._id}>
                  {employee.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {isLoading && <CircularProgress />}

      <Grid container spacing={2}>
        {cardConfig.map((card) => (
          <Grid key={card.key} size={{ xs: 12, sm: 6, lg: cardConfig.length === 7 ? 3 : 4 }}>
            <SummaryCard label={card.label} value={cards[card.key]} icon={card.icon} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <ChartPanel title="Visitors By Day">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.visitorsByDay || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="visitors" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartPanel>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <ChartPanel title="Visitors By Department">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={charts.visitorsByDepartment || []} dataKey="visitors" nameKey="department" outerRadius={92} label>
                  {(charts.visitorsByDepartment || []).map((entry, index) => (
                    <Cell key={entry.department} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartPanel>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <ChartPanel title="Most Visited Employees">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.mostVisitedEmployees || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="employeeName" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="visits" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <ChartPanel title="Average Visit Duration">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.averageVisitDuration || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="minutes" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <ChartPanel title="Employee Utilization" height={320}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.employeeUtilization || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="employeeName" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="occupiedVisits" fill="#7c3aed" />
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <EmployeeList title="Available Employees" employees={availableEmployees} color="success" />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <EmployeeList title="Occupied Employees" employees={occupiedEmployees} color="warning" />
        </Grid>
      </Grid>
    </Stack>
  );
};

export default DashboardPage;
