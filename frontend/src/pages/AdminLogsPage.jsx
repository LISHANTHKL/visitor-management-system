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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import { useAppDispatch } from '../hooks/useAppDispatch.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import { clearAdminLogsError, fetchAdminLogs } from '../store/adminLogsSlice.js';

const statusOptions = [
  { label: 'All Statuses', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Checked In', value: 'checked_in' },
  { label: 'Checked Out', value: 'checked_out' },
  { label: 'Expired', value: 'expired' },
  { label: 'Cancelled', value: 'cancelled' }
];

const sortOptions = [
  { label: 'Date', value: 'date' },
  { label: 'Visitor', value: 'visitorName' },
  { label: 'Employee', value: 'employeeName' },
  { label: 'Status', value: 'status' },
  { label: 'Check-In', value: 'checkIn' },
  { label: 'Check-Out', value: 'checkOut' }
];

const statusColors = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  checked_in: 'success',
  checked_out: 'primary',
  expired: 'error',
  cancelled: 'default'
};

const formatStatus = (status) =>
  String(status || '-')
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const formatDate = (value) => {
  if (!value) return '-';

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  }).format(new Date(value));
};

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

  return [hours ? `${hours} hr` : '', remainingMinutes ? `${remainingMinutes} min` : ''].filter(Boolean).join(' ');
};

const csvEscape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const downloadCsv = (logs) => {
  const headers = [
    'Visitor Name',
    'Email',
    'Phone',
    'Employee',
    'Department',
    'Purpose',
    'Date',
    'Time',
    'CheckIn',
    'CheckOut',
    'Duration',
    'Status',
    'Approved By',
    'Rejected By',
    'Checked In By',
    'Checked Out By'
  ];
  const rows = logs.map((log) => [
    log.visitorName,
    log.visitorEmail,
    log.visitorPhone,
    log.employeeName,
    log.department,
    log.purpose,
    formatDate(log.date),
    log.time,
    formatDateTime(log.checkIn),
    formatDateTime(log.checkOut),
    formatDuration(log.duration),
    formatStatus(log.status),
    log.audit?.approvedBy?.actorName,
    log.audit?.rejectedBy?.actorName,
    log.audit?.checkedInBy?.actorName,
    log.audit?.checkedOutBy?.actorName
  ]);
  const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'visitor-audit-logs.csv';
  link.click();
  URL.revokeObjectURL(url);
};

const printPdf = (logs) => {
  const rows = logs
    .map(
      (log) => `
        <tr>
          <td>${escapeHtml(log.visitorName)}</td>
          <td>${escapeHtml(log.employeeName)}</td>
          <td>${escapeHtml(log.department)}</td>
          <td>${formatDate(log.date)}</td>
          <td>${formatDateTime(log.checkIn)}</td>
          <td>${formatDateTime(log.checkOut)}</td>
          <td>${formatDuration(log.duration)}</td>
          <td>${formatStatus(log.status)}</td>
        </tr>
      `
    )
    .join('');
  const printWindow = window.open('', '_blank');

  if (!printWindow) return;

  printWindow.document.write(`
    <html>
      <head>
        <title>Visitor Logs Audit Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
          table { border-collapse: collapse; width: 100%; margin-top: 16px; font-size: 12px; }
          th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; vertical-align: top; }
          th { background: #f3f4f6; }
        </style>
      </head>
      <body>
        <h1>Visitor Logs Audit Report</h1>
        <table>
          <thead>
            <tr>
              <th>Visitor</th><th>Employee</th><th>Department</th><th>Date</th>
              <th>Check-In</th><th>Check-Out</th><th>Duration</th><th>Status</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
};

const AdminLogsPage = () => {
  const dispatch = useAppDispatch();
  const { logs, isLoading, error } = useAppSelector((state) => state.adminLogs);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    date: '',
    department: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  const activeFilters = useMemo(
    () => Object.fromEntries(Object.entries(filters).filter(([, value]) => String(value || '').trim())),
    [filters]
  );

  const loadLogs = useCallback(() => {
    dispatch(fetchAdminLogs(activeFilters));
  }, [activeFilters, dispatch]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleFilterChange = (field) => (event) => {
    setFilters((current) => ({
      ...current,
      [field]: event.target.value
    }));
  };

  const handleReset = () => {
    setFilters({
      search: '',
      status: '',
      date: '',
      department: '',
      sortBy: 'date',
      sortOrder: 'desc'
    });
    dispatch(fetchAdminLogs({ sortBy: 'date', sortOrder: 'desc' }));
  };

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Visitor Logs and Audit Logs
          </Typography>
          <Typography color="text.secondary">
            Search, filter, sort, and export visitor lifecycle and audit activity.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => downloadCsv(logs)} disabled={!logs.length}>
            CSV
          </Button>
          <Button variant="outlined" startIcon={<PictureAsPdfIcon />} onClick={() => printPdf(logs)} disabled={!logs.length}>
            PDF
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" onClose={() => dispatch(clearAdminLogsError())}>
          {error}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              label="Search"
              value={filters.search}
              onChange={handleFilterChange('search')}
              fullWidth
              InputProps={{ startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} /> }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <TextField label="Status" select value={filters.status} onChange={handleFilterChange('status')} fullWidth>
              {statusOptions.map((option) => (
                <MenuItem key={option.value || 'all'} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
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
            <TextField label="Department" value={filters.department} onChange={handleFilterChange('department')} fullWidth />
          </Grid>
          <Grid size={{ xs: 12, md: 1.5 }}>
            <TextField label="Sort" select value={filters.sortBy} onChange={handleFilterChange('sortBy')} fullWidth>
              {sortOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 1.5 }}>
            <TextField label="Order" select value={filters.sortOrder} onChange={handleFilterChange('sortOrder')} fullWidth>
              <MenuItem value="desc">Desc</MenuItem>
              <MenuItem value="asc">Asc</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" startIcon={<SearchIcon />} onClick={loadLogs} disabled={isLoading}>
                Search
              </Button>
              <Button variant="outlined" color="inherit" startIcon={<RefreshIcon />} onClick={handleReset} disabled={isLoading}>
                Reset
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table sx={{ minWidth: 1260 }}>
          <TableHead>
            <TableRow>
              <TableCell>Visitor</TableCell>
              <TableCell>Employee</TableCell>
              <TableCell>Purpose</TableCell>
              <TableCell>Date / Time</TableCell>
              <TableCell>Check-In</TableCell>
              <TableCell>Check-Out</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Audit</TableCell>
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
                  No logs found.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              logs.map((log) => (
                <TableRow key={log.visitorId} hover>
                  <TableCell>
                    <Typography sx={{ fontWeight: 700 }}>{log.visitorName}</Typography>
                    <Typography variant="body2" color="text.secondary">{log.visitorEmail}</Typography>
                    <Typography variant="body2" color="text.secondary">{log.visitorPhone}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography>{log.employeeName || '-'}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {[log.department, log.cabinNumber].filter(Boolean).join(' | ') || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 240 }}>
                    <Typography variant="body2">{log.purpose || '-'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography>{formatDate(log.date)}</Typography>
                    <Typography variant="body2" color="text.secondary">{log.time || '-'}</Typography>
                  </TableCell>
                  <TableCell>{formatDateTime(log.checkIn)}</TableCell>
                  <TableCell>{formatDateTime(log.checkOut)}</TableCell>
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
                    <Typography variant="body2">Approved: {log.audit?.approvedBy?.actorName || '-'}</Typography>
                    <Typography variant="body2">Rejected: {log.audit?.rejectedBy?.actorName || '-'}</Typography>
                    <Typography variant="body2">In: {log.audit?.checkedInBy?.actorName || '-'}</Typography>
                    <Typography variant="body2">Out: {log.audit?.checkedOutBy?.actorName || '-'}</Typography>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};

export default AdminLogsPage;
