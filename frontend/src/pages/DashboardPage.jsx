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
import TuneIcon from '@mui/icons-material/Tune';
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

const chartColors = ['#2563eb', '#16a34a', '#f59e0b', '#8b5cf6', '#0891b2', '#dc2626'];

const toDateInput = (date) => date.toISOString().slice(0, 10);

const getDefaultFilters = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 6);
  return { startDate: toDateInput(start), endDate: toDateInput(end), department: '', employeeId: '' };
};

const cardConfig = [
  {
    key: 'todayVisitors',
    label: "Today's Visitors",
    icon: <PeopleAltIcon sx={{ fontSize: 22 }} />,
    gradient: 'linear-gradient(135deg, #1a56db 0%, #3b82f6 100%)',
    glow: 'rgba(59,130,246,0.35)'
  },
  {
    key: 'pendingApprovals',
    label: 'Pending Approvals',
    icon: <HourglassTopIcon sx={{ fontSize: 22 }} />,
    gradient: 'linear-gradient(135deg, #b45309 0%, #f59e0b 100%)',
    glow: 'rgba(245,158,11,0.35)'
  },
  {
    key: 'approvedToday',
    label: 'Approved Today',
    icon: <EventAvailableIcon sx={{ fontSize: 22 }} />,
    gradient: 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)',
    glow: 'rgba(34,197,94,0.35)'
  },
  {
    key: 'checkedInVisitors',
    label: 'Checked In',
    icon: <LoginIcon sx={{ fontSize: 22 }} />,
    gradient: 'linear-gradient(135deg, #0c4a6e 0%, #06b6d4 100%)',
    glow: 'rgba(6,182,212,0.35)'
  },
  {
    key: 'checkedOutVisitors',
    label: 'Checked Out',
    icon: <LogoutIcon sx={{ fontSize: 22 }} />,
    gradient: 'linear-gradient(135deg, #5b21b6 0%, #8b5cf6 100%)',
    glow: 'rgba(139,92,246,0.35)'
  },
  {
    key: 'availableEmployees',
    label: 'Available',
    icon: <PeopleAltIcon sx={{ fontSize: 22 }} />,
    gradient: 'linear-gradient(135deg, #14532d 0%, #10b981 100%)',
    glow: 'rgba(16,185,129,0.35)'
  },
  {
    key: 'occupiedEmployees',
    label: 'Occupied',
    icon: <PeopleAltIcon sx={{ fontSize: 22 }} />,
    gradient: 'linear-gradient(135deg, #7f1d1d 0%, #f87171 100%)',
    glow: 'rgba(248,113,113,0.35)'
  }
];

const SummaryCard = ({ label, value, icon, gradient, glow }) => (
  <Box
    sx={{
      background: gradient,
      borderRadius: 3,
      p: 2.75,
      position: 'relative',
      overflow: 'hidden',
      boxShadow: `0 8px 24px ${glow || 'rgba(0,0,0,0.2)'}`,
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: `0 12px 32px ${glow || 'rgba(0,0,0,0.25)'}`
      }
    }}
  >
    <Box
      sx={{
        position: 'absolute',
        right: -20,
        top: -20,
        width: 120,
        height: 120,
        borderRadius: '50%',
        bgcolor: 'rgba(255,255,255,0.08)'
      }}
    />
    <Box
      sx={{
        position: 'absolute',
        right: 20,
        bottom: -30,
        width: 80,
        height: 80,
        borderRadius: '50%',
        bgcolor: 'rgba(255,255,255,0.05)'
      }}
    />
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="flex-start"
      sx={{ position: 'relative' }}
    >
      <Box>
        <Typography
          sx={{
            color: 'rgba(255,255,255,0.75)',
            fontSize: '0.75rem',
            fontWeight: 600,
            mb: 1,
            letterSpacing: '0.02em'
          }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            color: '#fff',
            fontSize: '2.25rem',
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: '-0.02em'
          }}
        >
          {value ?? 0}
        </Typography>
      </Box>
      <Box
        sx={{
          width: 46,
          height: 46,
          borderRadius: 2.5,
          bgcolor: 'rgba(255,255,255,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          flexShrink: 0
        }}
      >
        {icon}
      </Box>
    </Stack>
  </Box>
);

const ChartPanel = ({ title, children, height = 280 }) => (
  <Paper
    sx={{
      p: 3,
      borderRadius: 3,
      height: '100%',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      border: '1px solid #e2e8f0'
    }}
  >
    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2.5, color: '#0f172a' }}>
      {title}
    </Typography>
    <Box sx={{ height }}>{children}</Box>
  </Paper>
);

const EmployeeList = ({ title, employees, color }) => (
  <Paper
    sx={{
      p: 3,
      borderRadius: 3,
      height: '100%',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      border: '1px solid #e2e8f0'
    }}
  >
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
        {title}
      </Typography>
      <Chip label={employees.length} color={color} size="small" sx={{ fontWeight: 700 }} />
    </Stack>
    <Stack spacing={1}>
      {employees.length === 0 && (
        <Typography color="text.secondary" sx={{ fontSize: '0.875rem', py: 2, textAlign: 'center' }}>
          No employees found.
        </Typography>
      )}
      {employees.slice(0, 7).map((employee) => (
        <Box
          key={employee.employeeId}
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: '#f8fafc',
            border: '1px solid #f1f5f9',
            transition: 'background 0.15s',
            '&:hover': { bgcolor: '#f1f5f9' }
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', color: '#0f172a' }}>
            {employee.employeeName}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mt: 0.25 }}>
            {[employee.department, employee.cabinNumber].filter(Boolean).join(' · ') || '—'}
          </Typography>
          {employee.currentVisitor?.visitorName && (
            <Typography
              variant="body2"
              sx={{ mt: 0.5, fontSize: '0.75rem', color: '#d97706', fontWeight: 600 }}
            >
              With: {employee.currentVisitor.visitorName}
            </Typography>
          )}
        </Box>
      ))}
    </Stack>
  </Paper>
);

const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const { cards, charts, filters: filterOptions, isLoading, error } = useAppSelector(
    (state) => state.analytics
  );
  const { availableEmployees, occupiedEmployees } = useAppSelector((state) => state.availability);
  const [filters, setFilters] = useState(getDefaultFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFilters = useMemo(
    () =>
      Object.fromEntries(Object.entries(filters).filter(([, value]) => String(value || '').trim())),
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
    const unsubStatus = subscribeToEmployeeStatus((payload) => {
      dispatch(applyEmployeeStatusUpdate(payload));
      dispatch(fetchAdminAnalytics(activeFilters));
    });
    const unsubDashboard = subscribeToDashboardUpdates(() => loadDashboard());
    return () => {
      unsubStatus();
      unsubDashboard();
    };
  }, [activeFilters, dispatch, loadDashboard]);

  const handleFilterChange = (field) => (e) =>
    setFilters((prev) => ({ ...prev, [field]: e.target.value }));

  const exportSummaryPdf = () => {
    const rows = cardConfig
      .map((c) => `<tr><td>${c.label}</td><td>${cards[c.key] ?? 0}</td></tr>`)
      .join('');
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>Dashboard Summary</title><style>body{font-family:Arial,sans-serif;padding:24px}table{border-collapse:collapse;width:100%;margin-top:16px}th,td{border:1px solid #d1d5db;padding:10px;text-align:left}th{background:#f3f4f6}</style></head><body><h1>Analytics Dashboard Summary</h1><p>${filters.startDate} to ${filters.endDate}</p><table><thead><tr><th>Metric</th><th>Value</th></tr></thead><tbody>${rows}</tbody></table></body></html>`);
    w.document.close();
    w.focus();
    w.print();
  };

  return (
    <Stack spacing={3.5}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'flex-start' }}
        spacing={2}
      >
        <Box>
          <Typography
            variant="h5"
            component="h1"
            sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}
          >
            Analytics Dashboard
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5, fontSize: '0.875rem' }}>
            Live visitor traffic, approvals, and employee availability
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} flexShrink={0}>
          <Button
            variant="outlined"
            startIcon={<TuneIcon />}
            size="small"
            onClick={() => setFiltersOpen((v) => !v)}
            sx={{ borderRadius: 2, bgcolor: '#fff' }}
          >
            Filters
          </Button>
          <Button
            variant="outlined"
            startIcon={isLoading ? <CircularProgress size={13} /> : <RefreshIcon />}
            size="small"
            onClick={loadDashboard}
            disabled={isLoading}
            sx={{ borderRadius: 2, bgcolor: '#fff' }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            size="small"
            onClick={exportSummaryPdf}
            sx={{ borderRadius: 2 }}
          >
            Export
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" onClose={() => dispatch(clearAnalyticsError())} sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {filtersOpen && (
        <Paper
          sx={{
            p: 2.5,
            borderRadius: 3,
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}
        >
          <Typography
            sx={{
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#94a3b8',
              mb: 2
            }}
          >
            Filter Period &amp; Team
          </Typography>
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
                {(filterOptions.departments || []).map((d) => (
                  <MenuItem key={d} value={d}>{d}</MenuItem>
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
                {(filterOptions.employees || []).map((e) => (
                  <MenuItem key={e._id} value={e._id}>{e.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Paper>
      )}

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      <Grid container spacing={2.5}>
        {cardConfig.map((card) => (
          <Grid key={card.key} size={{ xs: 6, sm: 4, lg: 3 }}>
            <SummaryCard
              label={card.label}
              value={cards[card.key]}
              icon={card.icon}
              gradient={card.gradient}
              glow={card.glow}
            />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <ChartPanel title="Visitors By Day">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.visitorsByDay || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Line type="monotone" dataKey="visitors" stroke="#2563eb" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#2563eb' }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartPanel>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <ChartPanel title="Visitors By Department">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={charts.visitorsByDepartment || []} dataKey="visitors" nameKey="department" outerRadius={90} innerRadius={40} label>
                  {(charts.visitorsByDepartment || []).map((entry, index) => (
                    <Cell key={entry.department} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartPanel>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <ChartPanel title="Most Visited Employees">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.mostVisitedEmployees || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="employeeName" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Bar dataKey="visits" fill="#16a34a" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <ChartPanel title="Average Visit Duration (min)">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.averageVisitDuration || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Bar dataKey="minutes" fill="#f59e0b" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <ChartPanel title="Employee Utilization" height={300}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.employeeUtilization || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="employeeName" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Bar dataKey="occupiedVisits" fill="#8b5cf6" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
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
