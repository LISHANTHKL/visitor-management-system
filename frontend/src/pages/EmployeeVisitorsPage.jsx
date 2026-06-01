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

const statusLabels = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected'
};

const statusColors = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error'
};

const formatDate = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  }).format(new Date(value));
};

const formatSlotLabel = (slot) => {
  if (!slot) return '-';

  const [hourValue, minuteValue] = slot.split(':').map(Number);
  const suffix = hourValue >= 12 ? 'PM' : 'AM';
  const hour = hourValue % 12 || 12;
  return `${String(hour).padStart(2, '0')}:${String(minuteValue).padStart(2, '0')} ${suffix}`;
};

const DetailLine = ({ label, value }) => (
  <Box>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography sx={{ fontWeight: 600 }}>{value || '-'}</Typography>
  </Box>
);

const SummaryCard = ({ label, value, icon }) => (
  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, height: '100%' }}>
    <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
      <Box>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h4" sx={{ mt: 0.75, fontWeight: 700 }}>
          {value}
        </Typography>
      </Box>
      {icon}
    </Stack>
  </Paper>
);

const StatusCard = ({ status }) => {
  const isOccupied = status?.status === 'occupied';

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 2,
        height: '100%',
        borderColor: isOccupied ? 'warning.main' : 'success.main',
        bgcolor: isOccupied ? 'rgba(245, 158, 11, 0.08)' : 'rgba(22, 163, 74, 0.08)'
      }}
    >
      <Stack spacing={1}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Current Status
          </Typography>
          <MeetingRoomIcon color={isOccupied ? 'warning' : 'success'} />
        </Stack>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          {isOccupied ? 'Occupied' : 'Available'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Current Visitor
        </Typography>
        <Typography sx={{ fontWeight: 700 }}>
          {status?.currentVisitor?.visitorName || '-'}
        </Typography>
      </Stack>
    </Paper>
  );
};

const VisitorTable = ({ title, requests, isLoading, onView, emptyMessage }) => (
  <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
    <Stack spacing={2}>
      <Typography variant="h6" component="h2">
        {title}
      </Typography>
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
                  <CircularProgress />
                </TableCell>
              </TableRow>
            )}

            {!isLoading && requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              requests.map((request) => (
                <TableRow key={request._id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {request.visitorName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {request.visitorEmail}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {request.visitorPhone}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{formatDate(request.visitDate)}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatSlotLabel(request.visitTime)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 260 }}>
                    <Typography variant="body2" noWrap>
                      {request.purpose}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={statusLabels[request.status] || request.status}
                      color={statusColors[request.status] || 'default'}
                      size="small"
                      variant="outlined"
                    />
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
    </Stack>
  </Paper>
);

const EmployeeVisitorsPage = () => {
  const dispatch = useAppDispatch();
  const employee = useAppSelector((state) => state.auth.user);
  const {
    requests,
    summaryRequests,
    todayVisitors,
    upcomingVisitors,
    selectedRequest,
    isLoadingRequests,
    isLoadingToday,
    isLoadingUpcoming,
    error
  } = useAppSelector((state) => state.employeeVisitor);
  const { myStatus } = useAppSelector((state) => state.availability);

  const [filters, setFilters] = useState({
    date: '',
    status: '',
    visitorName: ''
  });
  const [detailsOpen, setDetailsOpen] = useState(false);

  const pendingCount = useMemo(
    () => summaryRequests.filter((request) => request.status === 'pending').length,
    [summaryRequests]
  );
  const approvedCount = useMemo(
    () => summaryRequests.filter((request) => request.status === 'approved').length,
    [summaryRequests]
  );

  const loadDashboard = useCallback(() => {
    dispatch(fetchEmployeeVisitorSummary());
    dispatch(fetchTodayEmployeeVisitors());
    dispatch(fetchUpcomingEmployeeVisitors());
    dispatch(fetchEmployeeVisitorRequests(filters));
    dispatch(fetchMyAvailability());
  }, [dispatch, filters]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    const unsubscribe = subscribeToEmployeeStatus((payload) => {
      if (String(payload?.employeeId || '') !== String(employee?._id || '')) {
        return;
      }

      dispatch(applyEmployeeStatusUpdate(payload));
      dispatch(fetchMyAvailability());
      dispatch(fetchTodayEmployeeVisitors());
    });

    return unsubscribe;
  }, [dispatch, employee?._id]);

  const handleFilterChange = (event) => {
    setFilters((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const handleOpenDetails = (request) => {
    dispatch(selectEmployeeVisitorRequest(request));
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    dispatch(clearSelectedEmployeeVisitorRequest());
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          My Visitors
        </Typography>
        <Typography color="text.secondary">
          View visitors assigned to you. Approval and rejection are handled by administrators.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => dispatch(clearEmployeeVisitorError())}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatusCard status={myStatus} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SummaryCard
            label="Today's Visitors"
            value={todayVisitors.length}
            icon={<EventAvailableIcon color="primary" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SummaryCard
            label="Upcoming Visitors"
            value={upcomingVisitors.length}
            icon={<UpcomingIcon color="primary" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SummaryCard
            label="Pending Requests"
            value={pendingCount}
            icon={<HourglassTopIcon color="warning" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SummaryCard
            label="Approved Requests"
            value={approvedCount}
            icon={<VerifiedIcon color="success" />}
          />
        </Grid>
      </Grid>

      <VisitorTable
        title="Today's Visitors"
        requests={todayVisitors}
        isLoading={isLoadingToday}
        onView={handleOpenDetails}
        emptyMessage="No approved visitors for today"
      />

      <VisitorTable
        title="Upcoming Visitors"
        requests={upcomingVisitors}
        isLoading={isLoadingUpcoming}
        onView={handleOpenDetails}
        emptyMessage="No upcoming approved visitors"
      />

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Stack spacing={2}>
          <Typography variant="h6" component="h2">
            Request History
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Visitor Name"
                name="visitorName"
                value={filters.visitorName}
                onChange={handleFilterChange}
                fullWidth
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Date"
                name="date"
                type="date"
                value={filters.date}
                onChange={handleFilterChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                select
                fullWidth
              >
                {statusOptions.map((status) => (
                  <MenuItem key={status.value || 'all'} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Button
                variant="outlined"
                startIcon={isLoadingRequests ? <CircularProgress size={16} /> : <RefreshIcon />}
                onClick={loadDashboard}
                disabled={isLoadingRequests}
                fullWidth
                sx={{ minHeight: 56 }}
              >
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
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                )}

                {!isLoadingRequests && requests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      No visitor request history found
                    </TableCell>
                  </TableRow>
                )}

                {!isLoadingRequests &&
                  requests.map((request) => (
                    <TableRow key={request._id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {request.visitorName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {request.visitorEmail}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {request.visitorPhone}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{formatDate(request.visitDate)}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatSlotLabel(request.visitTime)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 280 }}>
                        <Typography variant="body2" noWrap>
                          {request.purpose}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={statusLabels[request.status] || request.status}
                          color={statusColors[request.status] || 'default'}
                          size="small"
                          variant="outlined"
                        />
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
        </Stack>
      </Paper>

      <Dialog open={detailsOpen} onClose={handleCloseDetails} fullWidth maxWidth="md">
        <DialogTitle>Visitor Details</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                label={statusLabels[selectedRequest?.status] || selectedRequest?.status || '-'}
                color={statusColors[selectedRequest?.status] || 'default'}
                variant="outlined"
              />
              <Chip
                icon={<EventAvailableIcon />}
                label={`${formatDate(selectedRequest?.visitDate)} at ${formatSlotLabel(selectedRequest?.visitTime)}`}
                variant="outlined"
              />
            </Stack>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Stack spacing={1.5}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Visitor Details
                  </Typography>
                  <DetailLine label="Name" value={selectedRequest?.visitorName} />
                  <DetailLine label="Email" value={selectedRequest?.visitorEmail} />
                  <DetailLine label="Phone" value={selectedRequest?.visitorPhone} />
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Stack spacing={1.5}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Visit Details
                  </Typography>
                  <DetailLine label="Date" value={formatDate(selectedRequest?.visitDate)} />
                  <DetailLine label="Time" value={formatSlotLabel(selectedRequest?.visitTime)} />
                  <DetailLine label="Purpose" value={selectedRequest?.purpose} />
                  <DetailLine label="Status" value={statusLabels[selectedRequest?.status]} />
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Stack spacing={1.5}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Employee Details
                  </Typography>
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
