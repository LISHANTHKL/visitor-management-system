import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import EmployeeSearch from '../components/EmployeeSearch.jsx';
import { createVisitorRequest, getAvailableSlots } from '../services/visitorRequestService.js';

const initialForm = {
  visitorName: '',
  visitorEmail: '',
  visitorPhone: '',
  purpose: '',
  visitDate: '',
  visitTime: ''
};

const guidelines = [
  'Office Timings: 9:00 AM to 6:00 PM',
  'Visit Duration: 15 Minutes',
  'Employee cannot attend multiple visitors at same time.',
  'Security verification required.',
  'QR code mandatory during entry.',
  'Visitor may need to wait if employee is in another meeting.'
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9+\-\s()]{7,20}$/;

const formatSlotLabel = (slot) => {
  const [hourValue, minuteValue] = slot.split(':').map(Number);
  const suffix = hourValue >= 12 ? 'PM' : 'AM';
  const hour = hourValue % 12 || 12;
  return `${String(hour).padStart(2, '0')}:${String(minuteValue).padStart(2, '0')} ${suffix}`;
};

const VisitorRequestPage = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [slotError, setSlotError] = useState('');
  const [success, setSuccess] = useState('');

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const bookedSlotSet = useMemo(() => new Set(bookedSlots), [bookedSlots]);
  const slotOptions = useMemo(
    () => [...new Set([...availableSlots, ...bookedSlots])].sort(),
    [availableSlots, bookedSlots]
  );

  useEffect(() => {
    setFormData((current) => ({
      ...current,
      visitTime: ''
    }));

    if (!selectedEmployee || !formData.visitDate) {
      setAvailableSlots([]);
      setBookedSlots([]);
      setIsLoadingSlots(false);
      setSlotError('');
      return undefined;
    }

    let isActive = true;

    const loadSlots = async () => {
      setIsLoadingSlots(true);
      setSlotError('');

      try {
        const data = await getAvailableSlots({
          employeeId: selectedEmployee._id,
          date: formData.visitDate
        });

        if (isActive) {
          setAvailableSlots(data.availableSlots || []);
          setBookedSlots(data.bookedSlots || []);
          setSlotError(data.employeeStatus === 'occupied' ? 'Selected employee is currently occupied' : '');
        }
      } catch (requestError) {
        if (isActive) {
          setAvailableSlots([]);
          setBookedSlots([]);
          setSlotError(requestError.response?.data?.message || 'Unable to load available slots');
        }
      } finally {
        if (isActive) {
          setIsLoadingSlots(false);
        }
      }
    };

    loadSlots();

    return () => {
      isActive = false;
    };
  }, [selectedEmployee, formData.visitDate]);

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const validateForm = () => {
    if (!selectedEmployee) return 'Please select an employee';
    if (!formData.visitorName.trim()) return 'Visitor name is required';
    if (!emailPattern.test(formData.visitorEmail)) return 'A valid email is required';
    if (!phonePattern.test(formData.visitorPhone)) return 'A valid phone number is required';
    if (!formData.purpose.trim()) return 'Purpose is required';
    if (!formData.visitDate) return 'Visit date is required';
    if (!formData.visitTime) return 'Visit time is required';
    if (bookedSlotSet.has(formData.visitTime)) {
      return 'Selected slot is no longer available. Please choose another slot.';
    }

    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      setSuccess('');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await createVisitorRequest({
        ...formData,
        employeeId: selectedEmployee._id
      });
      setSuccess(
        'Your request has been submitted successfully. You will be notified once the administrator reviews your request.'
      );
      setSelectedEmployee(null);
      setFormData(initialForm);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to submit visitor request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: { xs: 3, md: 5 } }}>
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Visitor Request
            </Typography>
            <Typography color="text.secondary">
              Submit your visit request by selecting the employee you want to meet.
            </Typography>
          </Box>

          {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
          {success && <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>}

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                <Stack spacing={2}>
                  <Typography variant="h6" component="h2">
                    Visitor Guidelines
                  </Typography>
                  <List dense disablePadding>
                    {guidelines.map((guideline) => (
                      <ListItem key={guideline} disablePadding sx={{ py: 0.5 }}>
                        <ListItemText primary={guideline} />
                      </ListItem>
                    ))}
                  </List>
                </Stack>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Paper component="form" variant="outlined" sx={{ p: 3, borderRadius: 2 }} onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <EmployeeSearch value={selectedEmployee} onChange={setSelectedEmployee} />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Visitor Name"
                        name="visitorName"
                        value={formData.visitorName}
                        onChange={handleChange}
                        required
                        fullWidth
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Email"
                        name="visitorEmail"
                        type="email"
                        value={formData.visitorEmail}
                        onChange={handleChange}
                        required
                        fullWidth
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Phone"
                        name="visitorPhone"
                        value={formData.visitorPhone}
                        onChange={handleChange}
                        required
                        fullWidth
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <TextField
                        label="Visit Date"
                        name="visitDate"
                        type="date"
                        value={formData.visitDate}
                        onChange={handleChange}
                        required
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ min: today }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <TextField
                        label="Visit Time"
                        name="visitTime"
                        value={formData.visitTime}
                        onChange={handleChange}
                        required
                        fullWidth
                        select
                        error={Boolean(slotError)}
                        disabled={!selectedEmployee || !formData.visitDate || isLoadingSlots || slotOptions.length === 0}
                        helperText={
                          slotError ||
                          (!selectedEmployee || !formData.visitDate
                            ? 'Select an employee and date first'
                            : isLoadingSlots
                              ? 'Loading available slots...'
                              : availableSlots.length === 0
                                ? 'No available slots for this date'
                                : '')
                        }
                      >
                        <MenuItem value="" disabled>
                          Select a slot
                        </MenuItem>
                        {slotOptions.map((slot) => (
                          <MenuItem key={slot} value={slot} disabled={bookedSlotSet.has(slot)}>
                            {formatSlotLabel(slot)}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        label="Purpose"
                        name="purpose"
                        value={formData.purpose}
                        onChange={handleChange}
                        required
                        fullWidth
                        multiline
                        minRows={3}
                        inputProps={{ maxLength: 500 }}
                      />
                    </Grid>
                  </Grid>

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={isSubmitting ? <CircularProgress color="inherit" size={16} /> : <SendIcon />}
                    disabled={isSubmitting || isLoadingSlots}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
};

export default VisitorRequestPage;
