import { useEffect, useMemo, useState } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import { useAppDispatch } from '../hooks/useAppDispatch.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import { clearSecurityVisitError, fetchSecurityVisitLogs } from '../store/securityVisitSlice.js';

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'approved', label: 'Approved' },
  { value: 'checked_in', label: 'Checked In' },
  { value: 'checked_out', label: 'Checked Out' },
  { value: 'expired', label: 'Expired' }
];

const statusColors = {
  approved: 'info',
  checked_in: 'success',
  checked_out: 'primary',
  expired: 'error'
};

const formatStatus = (status) =>
  String(status || '-')
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const formatDateTime = (value) => {
  if (!value) return '-';

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
};

const formatDuration = (minutes) => {
  if (minutes === null || minutes === undefined) return '-';

  const numericMinutes = Number(minutes);

  if (!Number.isFinite(numericMinutes)) return '-';
  if (numericMinutes < 1) return 'Less than 1 min';

  const hours = Math.floor(numericMinutes / 60);
  const remainingMinutes = numericMinutes % 60;
  const parts = [];

  if (hours) {
    parts.push(`${hours} hr`);
  }

  if (remainingMinutes) {
    parts.push(`${remainingMinutes} min`);
  }

  return parts.join(' ');
};

const SecurityVisitorLogsPage = () => {
  const dispatch = useAppDispatch();
  const { logs, isLoading, error } = useAppSelector((state) => state.securityVisit);
  const [filters, setFilters] = useState({
    searchVisitor: '',
    searchEmployee: '',
    date: '',
    status: ''
  });

  const normalizedFilters = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(filters).filter(([, value]) => String(value || '').trim())
      ),
    [filters]
  );

  const loadLogs = () => {
    dispatch(fetchSecurityVisitLogs(normalizedFilters));
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleFilterChange = (field) => (event) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [field]: event.target.value
    }));
  };

  const handleSearch = (event) => {
    event.preventDefault();
    loadLogs();
  };

  const handleReset = () => {
    const emptyFilters = {
      searchVisitor: '',
      searchEmployee: '',
      date: '',
      status: ''
    };

    setFilters(emptyFilters);
    dispatch(fetchSecurityVisitLogs({}));
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Visitor Logs
        </Typography>
        <Typography color="text.secondary">
          Search check-in and check-out records by visitor, employee, date, or status.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => dispatch(clearSecurityVisitError())}>
          {error}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Box component="form" onSubmit={handleSearch}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Visitor"
                value={filters.searchVisitor}
                onChange={handleFilterChange('searchVisitor')}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Employee"
                value={filters.searchEmployee}
                onChange={handleFilterChange('searchEmployee')}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField
                label="Date"
                type="date"
                value={filters.date}
                onChange={handleFilterChange('date')}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField
                label="Status"
                select
                value={filters.status}
                onChange={handleFilterChange('status')}
                fullWidth
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value || 'all'} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Stack direction="row" spacing={1}>
                <Button type="submit" variant="contained" startIcon={<SearchIcon />} disabled={isLoading} fullWidth>
                  Search
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  color="inherit"
                  startIcon={<RefreshIcon />}
                  onClick={handleReset}
                  disabled={isLoading}
                >
                  Reset
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table sx={{ minWidth: 980 }}>
          <TableHead>
            <TableRow>
              <TableCell>Visitor</TableCell>
              <TableCell>Employee</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Cabin</TableCell>
              <TableCell>Check-In</TableCell>
              <TableCell>Check-Out</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Security User</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            )}

            {!isLoading && logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">No visit logs found.</Typography>
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              logs.map((log) => (
                <TableRow key={log._id} hover>
                  <TableCell>
                    <Typography sx={{ fontWeight: 700 }}>{log.visitorName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {log.visitorEmail}
                    </Typography>
                  </TableCell>
                  <TableCell>{log.employeeName || '-'}</TableCell>
                  <TableCell>{log.department || '-'}</TableCell>
                  <TableCell>{log.cabinNumber || '-'}</TableCell>
                  <TableCell>{formatDateTime(log.checkInTime)}</TableCell>
                  <TableCell>{formatDateTime(log.checkOutTime)}</TableCell>
                  <TableCell>{formatDuration(log.duration)}</TableCell>
                  <TableCell>
                    <Chip
                      label={formatStatus(log.status)}
                      color={statusColors[log.status] || 'default'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography>{log.securityUser?.name || '-'}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {log.securityUser?.email || ''}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};

export default SecurityVisitorLogsPage;
