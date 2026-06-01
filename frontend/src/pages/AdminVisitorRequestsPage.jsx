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
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BlockIcon from '@mui/icons-material/Block';
import DownloadIcon from '@mui/icons-material/Download';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useAppDispatch } from '../hooks/useAppDispatch.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import {
  approveRequest,
  clearSelectedVisitorRequest,
  clearVisitorApprovalMessages,
  fetchRequest,
  fetchRequests,
  rejectRequest
} from '../store/visitorApprovalSlice.js';

const statusTabs = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' }
];

const filterStatusOptions = [
  { label: 'Match tab', value: '' },
  ...statusTabs
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

const AdminVisitorRequestsPage = () => {
  const dispatch = useAppDispatch();
  const {
    requests,
    selectedRequest,
    isLoading,
    isDetailsLoading,
    isMutating,
    actionRequestId,
    error,
    success
  } = useAppSelector((state) => state.visitorApproval);

  const [activeTab, setActiveTab] = useState('pending');
  const [filters, setFilters] = useState({
    searchVisitor: '',
    searchEmployee: '',
    date: '',
    status: ''
  });
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const effectiveStatus = filters.status || activeTab;
  const filteredCount = useMemo(() => requests.length, [requests]);

  const loadRequests = useCallback(() => {
    dispatch(fetchRequests({ ...filters, status: effectiveStatus }));
  }, [dispatch, effectiveStatus, filters]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleTabChange = (_event, nextValue) => {
    setActiveTab(nextValue);
  };

  const handleFilterChange = (event) => {
    setFilters((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const handleOpenDetails = async (requestId) => {
    setDetailsOpen(true);
    await dispatch(fetchRequest(requestId));
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    dispatch(clearSelectedVisitorRequest());
  };

  const handleApprove = async (requestId) => {
    try {
      await dispatch(approveRequest(requestId)).unwrap();
      loadRequests();
    } catch (_error) {
      // Error state is handled by Redux.
    }
  };

  const handleOpenReject = (request) => {
    setRejectTarget(request);
    setRejectionReason('');
  };

  const handleCloseReject = () => {
    setRejectTarget(null);
    setRejectionReason('');
  };

  const handleReject = async (event) => {
    event.preventDefault();

    if (!rejectTarget || !rejectionReason.trim()) {
      return;
    }

    try {
      await dispatch(rejectRequest({ requestId: rejectTarget._id, reason: rejectionReason })).unwrap();
      handleCloseReject();
      loadRequests();
    } catch (_error) {
      // Error state is handled by Redux.
    }
  };

  const handleViewPass = (requestId) => {
    window.open(`/visitor/pass/${requestId}`, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadQr = (request) => {
    if (!request?.qrCodeImage) {
      return;
    }

    const link = document.createElement('a');
    link.href = request.qrCodeImage;
    link.download = `visitor-pass-${request._id}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const canActOnRequest = (request) => request.status === 'pending';
  const canUsePass = (request) => request?.status === 'approved' && Boolean(request.qrCodeImage);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Visitor Approvals
        </Typography>
        <Typography color="text.secondary">
          Review visitor requests and approve or reject pending visits.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => dispatch(clearVisitorApprovalMessages())}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => dispatch(clearVisitorApprovalMessages())}>
          {success}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          {statusTabs.map((tab) => (
            <Tab key={tab.value} label={tab.label} value={tab.value} />
          ))}
        </Tabs>

        <Stack spacing={2} sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Search Visitor"
                name="searchVisitor"
                value={filters.searchVisitor}
                onChange={handleFilterChange}
                fullWidth
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Search Employee"
                name="searchEmployee"
                value={filters.searchEmployee}
                onChange={handleFilterChange}
                fullWidth
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField
                label="Filter By Date"
                name="date"
                type="date"
                value={filters.date}
                onChange={handleFilterChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField
                label="Filter By Status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                select
                fullWidth
              >
                {filterStatusOptions.map((status) => (
                  <MenuItem key={status.value || 'tab'} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Button
                variant="outlined"
                startIcon={isLoading ? <CircularProgress size={16} /> : <RefreshIcon />}
                onClick={loadRequests}
                disabled={isLoading}
                fullWidth
                sx={{ minHeight: 56 }}
              >
                Refresh
              </Button>
            </Grid>
          </Grid>

          <Typography variant="body2" color="text.secondary">
            {filteredCount} request{filteredCount === 1 ? '' : 's'} found
          </Typography>

          <TableContainer>
            <Table sx={{ minWidth: 1080 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Visitor</TableCell>
                  <TableCell>Employee</TableCell>
                  <TableCell>Visit</TableCell>
                  <TableCell>Purpose</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading && requests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                      No visitor requests found
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
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {request.employeeName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {[request.designation, request.department].filter(Boolean).join(' | ') || '-'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Cabin {request.cabinNumber || '-'}
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
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="View details">
                            <IconButton size="small" onClick={() => handleOpenDetails(request._id)}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={canActOnRequest(request) ? 'Approve request' : 'Only pending requests can be approved'}>
                            <span>
                              <IconButton
                                size="small"
                                color="success"
                                disabled={!canActOnRequest(request) || actionRequestId === request._id}
                                onClick={() => handleApprove(request._id)}
                              >
                                {actionRequestId === request._id && isMutating ? (
                                  <CircularProgress size={18} />
                                ) : (
                                  <CheckCircleIcon fontSize="small" />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title={canActOnRequest(request) ? 'Reject request' : 'Only pending requests can be rejected'}>
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                disabled={!canActOnRequest(request) || actionRequestId === request._id}
                                onClick={() => handleOpenReject(request)}
                              >
                                <BlockIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </Paper>

      <Dialog open={detailsOpen} onClose={handleCloseDetails} fullWidth maxWidth="md">
        <DialogTitle>Visitor Request Details</DialogTitle>
        <DialogContent dividers>
          {isDetailsLoading ? (
            <Box sx={{ py: 4, display: 'grid', placeItems: 'center' }}>
              <CircularProgress />
            </Box>
          ) : (
            <Stack spacing={3}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
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
                      Visitor
                    </Typography>
                    <DetailLine label="Name" value={selectedRequest?.visitorName} />
                    <DetailLine label="Email" value={selectedRequest?.visitorEmail} />
                    <DetailLine label="Phone" value={selectedRequest?.visitorPhone} />
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Stack spacing={1.5}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Employee
                    </Typography>
                    <DetailLine label="Name" value={selectedRequest?.employeeName} />
                    <DetailLine label="Designation" value={selectedRequest?.designation} />
                    <DetailLine label="Department" value={selectedRequest?.department} />
                    <DetailLine label="Cabin Number" value={selectedRequest?.cabinNumber} />
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Stack spacing={1.5}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Visit
                    </Typography>
                    <DetailLine label="Date" value={formatDate(selectedRequest?.visitDate)} />
                    <DetailLine label="Time" value={formatSlotLabel(selectedRequest?.visitTime)} />
                    <DetailLine label="Status" value={statusLabels[selectedRequest?.status]} />
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <DetailLine label="Purpose" value={selectedRequest?.purpose} />
                </Grid>
                {selectedRequest?.status === 'rejected' && (
                  <Grid size={{ xs: 12 }}>
                    <DetailLine label="Rejection Reason" value={selectedRequest?.rejectionReason} />
                  </Grid>
                )}
              </Grid>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          {canUsePass(selectedRequest) && (
            <>
              <Button
                startIcon={<OpenInNewIcon />}
                variant="outlined"
                onClick={() => handleViewPass(selectedRequest._id)}
              >
                View Pass
              </Button>
              <Button startIcon={<DownloadIcon />} variant="outlined" onClick={() => handleDownloadQr(selectedRequest)}>
                Download QR
              </Button>
            </>
          )}
          {selectedRequest?.status === 'pending' && (
            <>
              <Button
                color="success"
                variant="contained"
                onClick={() => handleApprove(selectedRequest._id)}
                disabled={isMutating}
              >
                Approve
              </Button>
              <Button color="error" variant="outlined" onClick={() => handleOpenReject(selectedRequest)}>
                Reject
              </Button>
            </>
          )}
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(rejectTarget)} onClose={handleCloseReject} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={handleReject}>
          <DialogTitle>Reject Visitor Request</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Add a reason for rejecting {rejectTarget?.visitorName || 'this visitor request'}.
              </Typography>
              <TextField
                label="Rejection reason"
                value={rejectionReason}
                onChange={(event) => setRejectionReason(event.target.value)}
                required
                fullWidth
                multiline
                minRows={3}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseReject}>Cancel</Button>
            <Button type="submit" color="error" variant="contained" disabled={isMutating || !rejectionReason.trim()}>
              {isMutating ? 'Rejecting...' : 'Reject Request'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Stack>
  );
};

export default AdminVisitorRequestsPage;
