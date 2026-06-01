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
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Switch,
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
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LockResetIcon from '@mui/icons-material/LockReset';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useAppDispatch } from '../hooks/useAppDispatch.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import {
  clearSelectedUser,
  clearUserMessages,
  createManagedUser,
  deleteUser,
  fetchUsers,
  getUserDetails,
  resetUserPassword,
  updateManagedUserStatus,
  updateUser
} from '../store/userManagementSlice.js';

const createRoleOptions = [
  { label: 'Employee', value: 'employee' },
  { label: 'Security', value: 'security' }
];

const allRoleOptions = [
  { label: 'Admin', value: 'admin' },
  ...createRoleOptions
];

const filterRoleOptions = [
  { label: 'All roles', value: '' },
  ...allRoleOptions
];

const roleLabels = {
  admin: 'Admin',
  employee: 'Employee',
  security: 'Security'
};

const roleColors = {
  admin: 'primary',
  employee: 'secondary',
  security: 'warning'
};

const initialForm = {
  name: '',
  email: '',
  password: '',
  role: 'employee',
  department: '',
  designation: '',
  cabinNumber: '',
  employeeCode: '',
  officeLocation: '',
  phone: ''
};

const emptyEditForm = {
  _id: '',
  name: '',
  email: '',
  role: 'employee',
  department: '',
  designation: '',
  cabinNumber: '',
  employeeCode: '',
  officeLocation: '',
  phone: '',
  active: true
};

const toEditForm = (user) => ({
  _id: user?._id || '',
  name: user?.name || '',
  email: user?.email || '',
  role: user?.role || 'employee',
  department: user?.department || '',
  designation: user?.designation || '',
  cabinNumber: user?.cabinNumber || '',
  employeeCode: user?.employeeCode || '',
  officeLocation: user?.officeLocation || '',
  phone: user?.phone || '',
  active: Boolean(user?.active)
});

const AdminUsersPage = () => {
  const dispatch = useAppDispatch();
  const loggedInUser = useAppSelector((state) => state.auth.user);
  const {
    users,
    selectedUser,
    isLoading,
    isDetailsLoading,
    isMutating,
    actionUserId,
    error,
    success
  } = useAppSelector((state) => state.userManagement);

  const [filters, setFilters] = useState({ search: '', role: '', department: '', designation: '' });
  const [formData, setFormData] = useState(initialForm);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [resetPassword, setResetPassword] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);

  const hasUsers = users.length > 0;
  const filteredUserCount = useMemo(() => users.length, [users]);

  const loadUsers = useCallback(() => {
    dispatch(fetchUsers(filters));
  }, [dispatch, filters]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleFilterChange = (event) => {
    setFilters((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const handleFormChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const handleEditChange = (event) => {
    const { name, value, checked, type } = event.target;

    setEditForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();

    try {
      await dispatch(createManagedUser(formData)).unwrap();
      setFormData(initialForm);
      loadUsers();
    } catch (_error) {
      // Error state is handled by Redux.
    }
  };

  const handleStatusChange = async (userId, active) => {
    try {
      await dispatch(updateManagedUserStatus({ userId, active })).unwrap();
    } catch (_error) {
      // Error state is handled by Redux.
    }
  };

  const handleOpenDetails = async (userId) => {
    setDetailsOpen(true);
    await dispatch(getUserDetails(userId));
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    dispatch(clearSelectedUser());
  };

  const handleOpenEdit = async (userId) => {
    setEditOpen(true);

    try {
      const data = await dispatch(getUserDetails(userId)).unwrap();
      setEditForm(toEditForm(data.user));
    } catch (_error) {
      setEditForm(emptyEditForm);
    }
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setEditForm(emptyEditForm);
    dispatch(clearSelectedUser());
  };

  const handleUpdateUser = async (event) => {
    event.preventDefault();

    const payload = {
      name: editForm.name,
      email: editForm.email,
      role: editForm.role,
      department: editForm.department,
      designation: editForm.designation,
      cabinNumber: editForm.cabinNumber,
      employeeCode: editForm.employeeCode,
      officeLocation: editForm.officeLocation,
      phone: editForm.phone,
      active: editForm.active
    };

    try {
      await dispatch(updateUser({ userId: editForm._id, payload })).unwrap();
      handleCloseEdit();
      loadUsers();
    } catch (_error) {
      // Error state is handled by Redux.
    }
  };

  const handleOpenDelete = (user) => {
    setDeleteTarget(user);
  };

  const handleCloseDelete = () => {
    setDeleteTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await dispatch(deleteUser(deleteTarget._id)).unwrap();
      handleCloseDelete();
    } catch (_error) {
      // Error state is handled by Redux.
    }
  };

  const handleOpenReset = (user) => {
    setResetTarget(user);
    setResetPassword('');
  };

  const handleCloseReset = () => {
    setResetTarget(null);
    setResetPassword('');
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();

    if (!resetTarget) return;

    try {
      await dispatch(resetUserPassword({ userId: resetTarget._id, password: resetPassword })).unwrap();
      handleCloseReset();
    } catch (_error) {
      // Error state is handled by Redux.
    }
  };

  const isSelf = (userId) => loggedInUser?._id === userId;

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          User Management
        </Typography>
        <Typography color="text.secondary">
          Create accounts, review user details, and manage access.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => dispatch(clearUserMessages())}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => dispatch(clearUserMessages())}>
          {success}
        </Alert>
      )}

      <Paper component="form" variant="outlined" sx={{ p: 3, borderRadius: 2 }} onSubmit={handleCreateUser}>
        <Stack spacing={2}>
          <Typography variant="h6" component="h2">
            Create User
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField label="Name" name="name" value={formData.name} onChange={handleFormChange} required fullWidth />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleFormChange}
                required
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleFormChange}
                required
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField label="Role" name="role" value={formData.role} onChange={handleFormChange} select required fullWidth>
                {createRoleOptions.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    {role.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleFormChange}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField label="Phone" name="phone" value={formData.phone} onChange={handleFormChange} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Designation"
                name="designation"
                value={formData.designation}
                onChange={handleFormChange}
                required={formData.role === 'employee'}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Cabin Number"
                name="cabinNumber"
                value={formData.cabinNumber}
                onChange={handleFormChange}
                required={formData.role === 'employee'}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Employee Code"
                name="employeeCode"
                value={formData.employeeCode}
                onChange={handleFormChange}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Office Location"
                name="officeLocation"
                value={formData.officeLocation}
                onChange={handleFormChange}
                fullWidth
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            variant="contained"
            startIcon={isMutating ? <CircularProgress color="inherit" size={16} /> : <AddIcon />}
            disabled={isMutating}
            sx={{ alignSelf: 'flex-start' }}
          >
            {isMutating ? 'Creating...' : 'Create User'}
          </Button>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
            <TextField
              label="Search users"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              fullWidth
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
              }}
            />
            <TextField
              label="Role"
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              select
              fullWidth
              sx={{ maxWidth: { md: 220 } }}
            >
              {filterRoleOptions.map((role) => (
                <MenuItem key={role.value} value={role.value}>
                  {role.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Department"
              name="department"
              value={filters.department}
              onChange={handleFilterChange}
              fullWidth
              sx={{ maxWidth: { md: 220 } }}
            />
            <TextField
              label="Designation"
              name="designation"
              value={filters.designation}
              onChange={handleFilterChange}
              fullWidth
              sx={{ maxWidth: { md: 220 } }}
            />
            <Button
              variant="outlined"
              startIcon={isLoading ? <CircularProgress size={16} /> : <RefreshIcon />}
              onClick={loadUsers}
              disabled={isLoading}
              sx={{ minWidth: 120 }}
            >
              Refresh
            </Button>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            {filteredUserCount} user{filteredUserCount === 1 ? '' : 's'} found
          </Typography>

          <TableContainer>
            <Table sx={{ minWidth: 1180 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Designation</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Cabin Number</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading && !hasUsers && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                      No users found
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading &&
                  users.map((user) => (
                    <TableRow key={user._id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {user.name}
                        </Typography>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={roleLabels[user.role] || user.role}
                          color={roleColors[user.role] || 'default'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{user.designation || '-'}</TableCell>
                      <TableCell>{user.department || '-'}</TableCell>
                      <TableCell>{user.cabinNumber || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.active ? 'Active' : 'Inactive'}
                          color={user.active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="View details">
                            <IconButton size="small" onClick={() => handleOpenDetails(user._id)}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit user">
                            <IconButton size="small" onClick={() => handleOpenEdit(user._id)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reset password">
                            <IconButton size="small" onClick={() => handleOpenReset(user)}>
                              <LockResetIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Button
                            size="small"
                            variant={user.active ? 'outlined' : 'contained'}
                            color={user.active ? 'error' : 'success'}
                            disabled={actionUserId === user._id || (user.active && isSelf(user._id))}
                            onClick={() => handleStatusChange(user._id, !user.active)}
                          >
                            {actionUserId === user._id
                              ? 'Updating...'
                              : user.active
                                ? 'Deactivate'
                                : 'Activate'}
                          </Button>
                          <Tooltip title={isSelf(user._id) ? 'You cannot delete your own account' : 'Delete user'}>
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                disabled={isSelf(user._id)}
                                onClick={() => handleOpenDelete(user)}
                              >
                                <DeleteIcon fontSize="small" />
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

      <Dialog open={detailsOpen} onClose={handleCloseDetails} fullWidth maxWidth="sm">
        <DialogTitle>User Details</DialogTitle>
        <DialogContent dividers>
          {isDetailsLoading ? (
            <Box sx={{ py: 4, display: 'grid', placeItems: 'center' }}>
              <CircularProgress />
            </Box>
          ) : (
            <Stack spacing={1.5}>
              <Typography><strong>Name:</strong> {selectedUser?.name || '-'}</Typography>
              <Typography><strong>Email:</strong> {selectedUser?.email || '-'}</Typography>
              <Typography><strong>Role:</strong> {roleLabels[selectedUser?.role] || '-'}</Typography>
              <Typography><strong>Designation:</strong> {selectedUser?.designation || '-'}</Typography>
              <Typography><strong>Department:</strong> {selectedUser?.department || '-'}</Typography>
              <Typography><strong>Cabin Number:</strong> {selectedUser?.cabinNumber || '-'}</Typography>
              <Typography><strong>Employee Code:</strong> {selectedUser?.employeeCode || '-'}</Typography>
              <Typography><strong>Office Location:</strong> {selectedUser?.officeLocation || '-'}</Typography>
              <Typography><strong>Phone:</strong> {selectedUser?.phone || '-'}</Typography>
              <Typography><strong>Status:</strong> {selectedUser?.active ? 'Active' : 'Inactive'}</Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={handleCloseEdit} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={handleUpdateUser}>
          <DialogTitle>Edit User</DialogTitle>
          <DialogContent dividers>
            {isDetailsLoading && !editForm._id ? (
              <Box sx={{ py: 4, display: 'grid', placeItems: 'center' }}>
                <CircularProgress />
              </Box>
            ) : (
              <Stack spacing={2} sx={{ pt: 1 }}>
                <TextField label="Name" name="name" value={editForm.name} onChange={handleEditChange} required fullWidth />
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                  required
                  fullWidth
                />
                <TextField label="Role" name="role" value={editForm.role} onChange={handleEditChange} select required fullWidth>
                  {allRoleOptions.map((role) => (
                    <MenuItem key={role.value} value={role.value}>
                      {role.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Department"
                  name="department"
                  value={editForm.department}
                  onChange={handleEditChange}
                  fullWidth
                />
                <TextField
                  label="Designation"
                  name="designation"
                  value={editForm.designation}
                  onChange={handleEditChange}
                  required={editForm.role === 'employee'}
                  fullWidth
                />
                <TextField
                  label="Cabin Number"
                  name="cabinNumber"
                  value={editForm.cabinNumber}
                  onChange={handleEditChange}
                  required={editForm.role === 'employee'}
                  fullWidth
                />
                <TextField
                  label="Employee Code"
                  name="employeeCode"
                  value={editForm.employeeCode}
                  onChange={handleEditChange}
                  fullWidth
                />
                <TextField
                  label="Office Location"
                  name="officeLocation"
                  value={editForm.officeLocation}
                  onChange={handleEditChange}
                  fullWidth
                />
                <TextField label="Phone" name="phone" value={editForm.phone} onChange={handleEditChange} fullWidth />
                <FormControlLabel
                  control={
                    <Switch
                      name="active"
                      checked={editForm.active}
                      onChange={handleEditChange}
                      disabled={isSelf(editForm._id)}
                    />
                  }
                  label="Active"
                />
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEdit}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isMutating || isDetailsLoading || !editForm._id}>
              {isMutating ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onClose={handleCloseDelete} fullWidth maxWidth="xs">
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent dividers>
          <Typography>Are you sure you want to delete this user?</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {deleteTarget?.name} {deleteTarget?.email ? `(${deleteTarget.email})` : ''}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete} disabled={isMutating}>
            {isMutating ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(resetTarget)} onClose={handleCloseReset} fullWidth maxWidth="xs">
        <Box component="form" onSubmit={handleResetPassword}>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Enter a new password for {resetTarget?.name || 'this user'}.
              </Typography>
              <TextField
                label="New password"
                type="password"
                value={resetPassword}
                onChange={(event) => setResetPassword(event.target.value)}
                required
                fullWidth
                inputProps={{ minLength: 8 }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseReset}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isMutating || resetPassword.length < 8}>
              {isMutating ? 'Resetting...' : 'Reset Password'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Stack>
  );
};

export default AdminUsersPage;
