import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
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
  Tooltip,
  Typography
} from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import UpcomingIcon from '@mui/icons-material/Upcoming';
import VerifiedIcon from '@mui/icons-material/Verified';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useAppDispatch } from '../hooks/useAppDispatch.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import {
  clearEmployeeVisitorError,
  clearSelectedEmployeeVisitorRequest,
  fetchEmployeeVisitorRequests,
  fetchEmployeeVisitorSummary,
  fetchTodayEmployeeVisitors,
  fetchUpcomingEmployeeVisitors,
  selectEmployeeVisitorRequest
} from '../store/employeeVisitorSlice.js';
import {
  applyEmployeeStatusUpdate,
  fetchMyAvailability
} from '../store/availabilitySlice.js';
import { subscribeToEmployeeStatus } from '../services/socketService.js';

const statusOptions = [
  { label: 'All statuses', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' }
];

const statusLabels = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' };
const statusColors = { pending: 'warning', approved: 'success', rejected: 'error' };

const formatDate = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: '2-digit' }).format(new Date(value));
};

const formatSlotLabel = (slot) => {
  if (!slot) return '-';
  const [h, m] = slot.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  return `${String(h % 12 || 12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`;
};

const DetailLine = ({ label, value }) => (
  <Box>
    <Typography variant="body2" color="text.secondary">{label}</Typography>
    <Typography sx={{ fontWeight: 600 }}>{value || '-'}</Typography>
  </Box>
);

const SummaryCard = ({ label, value, icon, gradient, glow }) => (
  <Box
    sx={{
      background: gradient || 'linear-gradient(135deg,#1a56db,#3b82f6)',
      borderRadius: 3,
      p: 2.5,
      position: 'relative',
      overflow: 'hidden',
      boxShadow: `0 6px 20px ${glow || 'rgba(0,0,0,0.15)'}`,
      transition: 'transform 0.2s',
      '&:hover': { transform: 'translateY(-2px)' }
    }}
  >
    <Box sx={{ position: 'absolute', right: -16, top: -16, width: 100, height: 100, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.08)' }} />
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ position: 'relative' }}>
      <Box>
        <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem', fontWeight: 600, mb: 0.75 }}>{label}</Typography>
        <Typography sx={{ color: '#fff', fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>{value ?? 0}</Typography>
      </Box>
      <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
        {icon}
      </Box>
    </Stack>
  </Box>
);

const StatusCard = ({ status }) => {
  const isOccupied = status?.status === 'occupied';
  return (
    <Box
      sx={{
        background: isOccupied
          ? 'linear-gradient(135deg, #b45309, #f59e0b)'
          : 'linear-gradient(135deg, #15803d, #22c55e)',
        borderRadius: 3,
        p: 2.5,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: isOccupied
          ? '0 6px 20px rgba(245,158,11,0.35)'
          : '0 6px 20px rgba(34,197,94,0.35)',
        transition: 'transform 0.2s',
        '&:hover': { transform: 'translateY(-2px)' }
      }}
    >
      <Box sx={{ position: 'absolute', right: -16, top: -16, width: 100, height: 100, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.08)' }} />
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ position: 'relative' }}>
        <Box>
          <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem', fontWeight: 600, mb: 0.75 }}>
            Current Status
          </Typography>
          <Typography sx={{ color: '#fff', fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.2 }}>
            {isOccupied ? 'Occupied' : 'Available'}
          </Typography>
          {isOccupied && status?.currentVisitor?.visitorName && (
            <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', mt: 0.75 }}>
              With {status.currentVisitor.visitorName}
            </Typography>
          )}
        </Box>
        <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
          <MeetingRoomIcon sx={{ fontSize: 22 }} />
        </Box>
      </Stack>
    </Box>
  );
};

const VisitorTable = ({ title, requests, isLoading, onView, emptyMessage }) => (
  <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
    <Typography variant="h6" component="h2" sx={{ fontWeight: 700, mb: 2.5, color: '#0f172a' }}>{title}</Typography>
    <TableContainer>
      <Table sx={{ minWidth: 760 }}>
        <TableHead>
          <TableRow>
            <TableCell>Visitor</TableCell>
            <TableCell>Visit</TableCell>
            <TableCell>Purpose</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Details</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                <CircularProgress size={24} />
              </TableCell>
            </TableRow>
          )}
          {!isLoading && requests.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary" sx={{ fontSize: '0.875rem' }}>{emptyMessage}</Typography>
              </TableCell>
            </TableRow>
          )}
          {!isLoading && requests.map((request) => (
            <TableRow key={request._id} hover>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{request.visitorName}</Typography>
                <Typography variant="caption" color="text.secondary">{request.visitorEmail}</Typography>
                <Typography variant="caption" color="text.secondary" display="block">{request.visitorPhone}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{formatDate(request.visitDate)}</Typography>
                <Typography variant="caption" color="text.secondary">{formatSlotLabel(request.visitTime)}</Typography>
              </TableCell>
              <TableCell sx={{ maxWidth: 260 }}>
                <Typography variant="body2" noWrap>{request.purpose}</Typography>
              </TableCell>
              <TableCell>
                <Chip label={statusLabels[request.status] || request.status} color={statusColors[request.status] || 'default'} size="small" />
              </TableCell>
              <TableCell align="right">
                <Tooltip title="View details">
                  <IconButton size="small" onClick={() => onView(request)}>
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Paper>
);

const EmployeeVisitorsPage = () => {
  const dispatch = useAppDispatch();
  const employee = useAppSelector((state) => state.auth.user);
  const {
    requests, summaryRequests, todayVisitors, upcomingVisitors,
    selectedRequest, isLoadingRequests, isLoadingToday, isLoadingUpcoming, error
  } = useAppSelector((state) => state.employeeVisitor);
  const { myStatus } = useAppSelector((state) => state.availability);

  const [filters, setFilters] = useState({ date: '', status: '', visitorName: '' });
  const [detailsOpen, setDetailsOpen] = useState(false);

  const pendingCount = useMemo(
    () => summaryRequests.filter((r) => r.status === 'pending').length,
    [summaryRequests]
  );
  const approvedCount = useMemo(
    () => summaryRequests.filter((r) => r.status === 'approved').length,
    [summaryRequests]
  );

  const loadDashboard = useCallback(() => {
    dispatch(fetchEmployeeVisitorSummary());
    dispatch(fetchTodayEmployeeVisitors());
    dispatch(fetchUpcomingEmployeeVisitors());
    dispatch(fetchEmployeeVisitorRequests(filters));
    dispatch(fetchMyAvailability());
  }, [dispatch, filters]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  useEffect(() => {
    const unsubscribe = subscribeToEmployeeStatus((payload) => {
      if (String(payload?.employeeId || '') !== String(employee?._id || '')) return;
      dispatch(applyEmployeeStatusUpdate(payload));
      dispatch(fetchMyAvailability());
      dispatch(fetchTodayEmployeeVisitors());
    });
    return unsubscribe;
  }, [dispatch, employee?._id]);

  const handleFilterChange = (e) =>
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleOpenDetails = (request) => {
    dispatch(selectEmployeeVisitorRequest(request));
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    dispatch(clearSelectedEmployeeVisitorRequest());
  };

  return (
    <Stack spacing={3.5}>
      <Box>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 800, color: '#0f172a' }}>
          My Visitors
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5, fontSize: '0.875rem' }}>
          View visitors assigned to you. Approvals are handled by administrators.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => dispatch(clearEmployeeVisitorError())} sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatusCard status={myStatus} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SummaryCard
            label="Today's Visitors"
            value={todayVisitors.length}
            icon={<EventAvailableIcon sx={{ fontSize: 22 }} />}
            gradient="linear-gradient(135deg, #1a56db, #3b82f6)"
            glow="rgba(59,130,246,0.35)"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SummaryCard
            label="Upcoming Visitors"
            value={upcomingVisitors.length}
            icon={<UpcomingIcon sx={{ fontSize: 22 }} />}
            gradient="linear-gradient(135deg, #5b21b6, #8b5cf6)"
            glow="rgba(139,92,246,0.35)"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SummaryCard
            label="Pending Requests"
            value={pendingCount}
            icon={<HourglassTopIcon sx={{ fontSize: 22 }} />}
            gradient="linear-gradient(135deg, #b45309, #f59e0b)"
            glow="rgba(245,158,11,0.35)"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SummaryCard
            label="Approved Requests"
            value={approvedCount}
            icon={<VerifiedIcon sx={{ fontSize: 22 }} />}
            gradient="linear-gradient(135deg, #15803d, #22c55e)"
            glow="rgba(34,197,94,0.35)"
          />
        </Grid>
      </Grid>

      <VisitorTable title="Today's Visitors" requests={todayVisitors} isLoading={isLoadingToday} onView={handleOpenDetails} emptyMessage="No approved visitors for today" />
      <VisitorTable title="Upcoming Visitors" requests={upcomingVisitors} isLoading={isLoadingUpcoming} onView={handleOpenDetails} emptyMessage="No upcoming approved visitors" />

      <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Typography variant="h6" component="h2" sx={{ fontWeight: 700, mb: 2.5, color: '#0f172a' }}>
          Request History
        </Typography>
        <Grid container spacing={2} sx={{ mb: 2.5 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label="Visitor Name"
              name="visitorName"
              value={filters.visitorName}
              onChange={handleFilterChange}
              fullWidth
              InputProps={{ startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} /> }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField label="Date" name="date" type="date" value={filters.date} onChange={handleFilterChange} fullWidth InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField label="Status" name="status" value={filters.status} onChange={handleFilterChange} select fullWidth>
              {statusOptions.map((s) => <MenuItem key={s.value || 'all'} value={s.value}>{s.label}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <Button variant="outlined" startIcon={isLoadingRequests ? <CircularProgress size={14} /> : <RefreshIcon />} onClick={loadDashboard} disabled={isLoadingRequests} fullWidth sx={{ height: '100%', minHeight: 40 }}>
              Refresh
            </Button>
          </Grid>
        </Grid>
        <TableContainer>
          <Table sx={{ minWidth: 860 }}>
            <TableHead>
              <TableRow>
                <TableCell>Visitor</TableCell>
                <TableCell>Visit</TableCell>
                <TableCell>Purpose</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoadingRequests && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}><CircularProgress size={24} /></TableCell>
                </TableRow>
              )}
              {!isLoadingRequests && requests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary" sx={{ fontSize: '0.875rem' }}>No visitor request history found</Typography>
                  </TableCell>
                </TableRow>
              )}
              {!isLoadingRequests && requests.map((request) => (
                <TableRow key={request._id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{request.visitorName}</Typography>
                    <Typography variant="caption" color="text.secondary">{request.visitorEmail}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block">{request.visitorPhone}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{formatDate(request.visitDate)}</Typography>
                    <Typography variant="caption" color="text.secondary">{formatSlotLabel(request.visitTime)}</Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 280 }}>
                    <Typography variant="body2" noWrap>{request.purpose}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={statusLabels[request.status] || request.status} color={statusColors[request.status] || 'default'} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View details">
                      <IconButton size="small" onClick={() => handleOpenDetails(request)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={detailsOpen} onClose={handleCloseDetails} fullWidth maxWidth="md">
        <DialogTitle>Visitor Details</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip label={statusLabels[selectedRequest?.status] || selectedRequest?.status || '-'} color={statusColors[selectedRequest?.status] || 'default'} variant="outlined" />
              <Chip icon={<EventAvailableIcon />} label={`${formatDate(selectedRequest?.visitDate)} at ${formatSlotLabel(selectedRequest?.visitTime)}`} variant="outlined" />
            </Stack>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Stack spacing={1.5}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Visitor Details</Typography>
                  <DetailLine label="Name" value={selectedRequest?.visitorName} />
                  <DetailLine label="Email" value={selectedRequest?.visitorEmail} />
                  <DetailLine label="Phone" value={selectedRequest?.visitorPhone} />
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Stack spacing={1.5}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Visit Details</Typography>
                  <DetailLine label="Date" value={formatDate(selectedRequest?.visitDate)} />
                  <DetailLine label="Time" value={formatSlotLabel(selectedRequest?.visitTime)} />
                  <DetailLine label="Purpose" value={selectedRequest?.purpose} />
                  <DetailLine label="Status" value={statusLabels[selectedRequest?.status]} />
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Stack spacing={1.5}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Employee Details</Typography>
                  <DetailLine label="Name" value={employee?.name || selectedRequest?.employeeName} />
                  <DetailLine label="Designation" value={employee?.designation || selectedRequest?.designation} />
                  <DetailLine label="Department" value={employee?.department || selectedRequest?.department} />
                  <DetailLine label="Cabin Number" value={employee?.cabinNumber || selectedRequest?.cabinNumber} />
                </Stack>
              </Grid>
              {selectedRequest?.status === 'rejected' && (
                <Grid size={{ xs: 12 }}>
                  <DetailLine label="Rejection Reason" value={selectedRequest?.rejectionReason} />
                </Grid>
              )}
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default EmployeeVisitorsPage;
