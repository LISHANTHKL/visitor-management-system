import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SendIcon from '@mui/icons-material/Send';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
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
  { icon: <AccessTimeIcon fontSize="small" />, text: 'Office Timings: 9:00 AM to 6:00 PM' },
  { icon: <CheckCircleOutlineIcon fontSize="small" />, text: 'Visit Duration: 15 Minutes per slot' },
  { icon: <InfoOutlinedIcon fontSize="small" />, text: 'Employee cannot attend multiple visitors simultaneously' },
  { icon: <ShieldOutlinedIcon fontSize="small" />, text: 'Security verification required at entry' },
  { icon: <CheckCircleOutlineIcon fontSize="small" />, text: 'QR code must be presented during entry' },
  { icon: <InfoOutlinedIcon fontSize="small" />, text: 'Visitor may need to wait if employee is in another meeting' }
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9+\-\s()]{7,20}$/;

const formatSlotLabel = (slot) => {
  const [h, m] = slot.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  return `${String(h % 12 || 12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`;
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
  const slotOptions = useMemo(() => [...new Set([...availableSlots, ...bookedSlots])].sort(), [availableSlots, bookedSlots]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, visitTime: '' }));
    if (!selectedEmployee || !formData.visitDate) {
      setAvailableSlots([]);
      setBookedSlots([]);
      setIsLoadingSlots(false);
      setSlotError('');
      return undefined;
    }
    let active = true;
    const load = async () => {
      setIsLoadingSlots(true);
      setSlotError('');
      try {
        const data = await getAvailableSlots({ employeeId: selectedEmployee._id, date: formData.visitDate });
        if (active) {
          setAvailableSlots(data.availableSlots || []);
          setBookedSlots(data.bookedSlots || []);
          setSlotError(data.employeeStatus === 'occupied' ? 'Employee is currently occupied' : '');
        }
      } catch (err) {
        if (active) {
          setAvailableSlots([]);
          setBookedSlots([]);
          setSlotError(err.response?.data?.message || 'Unable to load slots');
        }
      } finally {
        if (active) setIsLoadingSlots(false);
      }
    };
    load();
    return () => { active = false; };
  }, [selectedEmployee, formData.visitDate]);

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const validateForm = () => {
    if (!selectedEmployee) return 'Please select an employee';
    if (!formData.visitorName.trim()) return 'Visitor name is required';
    if (!emailPattern.test(formData.visitorEmail)) return 'A valid email is required';
    if (!phonePattern.test(formData.visitorPhone)) return 'A valid phone number is required';
    if (!formData.purpose.trim()) return 'Purpose is required';
    if (!formData.visitDate) return 'Visit date is required';
    if (!formData.visitTime) return 'Visit time is required';
    if (bookedSlotSet.has(formData.visitTime)) return 'Selected slot is no longer available';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) { setError(validationError); setSuccess(''); return; }
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await createVisitorRequest({ ...formData, employeeId: selectedEmployee._id });
      setSuccess('Request submitted successfully. You will be notified once the administrator reviews it.');
      setSelectedEmployee(null);
      setFormData(initialForm);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0d1117 0%, #0f172a 50%, #1a237e 100%)',
        py: { xs: 4, md: 6 }
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={3.5}>
          <Box sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                boxShadow: '0 8px 20px rgba(37,99,235,0.4)'
              }}
            >
              <ShieldOutlinedIcon sx={{ color: '#fff', fontSize: 26 }} />
            </Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 800, color: '#f1f5f9', mb: 0.75, letterSpacing: '-0.02em' }}
            >
              Request a Visit
            </Typography>
            <Typography sx={{ color: '#64748b', fontSize: '0.9375rem' }}>
              Select an employee and submit your visit request
            </Typography>
          </Box>

          {error && <Alert severity="error" onClose={() => setError('')} sx={{ borderRadius: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ borderRadius: 2 }}>{success}</Alert>}

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}
              >
                <Box
                  sx={{
                    p: 2.25,
                    background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25
                  }}
                >
                  <InfoOutlinedIcon sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 18 }} />
                  <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.875rem' }}>
                    Visitor Guidelines
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: '#0d1117' }}>
                  {guidelines.map((g, idx) => (
                    <Stack
                      key={idx}
                      direction="row"
                      spacing={1.5}
                      alignItems="flex-start"
                      sx={{
                        px: 2.5,
                        py: 1.75,
                        borderBottom: idx < guidelines.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' }
                      }}
                    >
                      <Box sx={{ color: '#3b82f6', mt: 0.1, flexShrink: 0 }}>{g.icon}</Box>
                      <Typography sx={{ color: '#64748b', fontSize: '0.8125rem', lineHeight: 1.6 }}>
                        {g.text}
                      </Typography>
                    </Stack>
                  ))}
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Paper
                component="form"
                onSubmit={handleSubmit}
                sx={{
                  p: 3.5,
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  bgcolor: 'rgba(255,255,255,0.97)'
                }}
              >
                <Stack spacing={3}>
                  <Box>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8', mb: 1.5 }}>
                      Select Employee
                    </Typography>
                    <EmployeeSearch value={selectedEmployee} onChange={setSelectedEmployee} />
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8', mb: 1.5 }}>
                      Your Details
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField label="Your Full Name" name="visitorName" value={formData.visitorName} onChange={handleChange} required fullWidth />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField label="Email Address" name="visitorEmail" type="email" value={formData.visitorEmail} onChange={handleChange} required fullWidth />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField label="Phone Number" name="visitorPhone" value={formData.visitorPhone} onChange={handleChange} required fullWidth />
                      </Grid>
                    </Grid>
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8', mb: 1.5 }}>
                      Visit Details
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <TextField label="Visit Date" name="visitDate" type="date" value={formData.visitDate} onChange={handleChange} required fullWidth InputLabelProps={{ shrink: true }} inputProps={{ min: today }} />
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                          label="Time Slot"
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
                            (!selectedEmployee || !formData.visitDate ? 'Select employee and date first' :
                              isLoadingSlots ? 'Loading slots...' :
                                availableSlots.length === 0 ? 'No slots available' : '')
                          }
                        >
                          <MenuItem value="" disabled>Select a slot</MenuItem>
                          {slotOptions.map((slot) => (
                            <MenuItem key={slot} value={slot} disabled={bookedSlotSet.has(slot)}>
                              {formatSlotLabel(slot)}{bookedSlotSet.has(slot) && ' (Booked)'}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          label="Purpose of Visit"
                          name="purpose"
                          value={formData.purpose}
                          onChange={handleChange}
                          required
                          fullWidth
                          multiline
                          minRows={3}
                          inputProps={{ maxLength: 500 }}
                          helperText={`${formData.purpose.length}/500 characters`}
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={isSubmitting ? <CircularProgress color="inherit" size={16} /> : <SendIcon />}
                    disabled={isSubmitting || isLoadingSlots}
                    sx={{
                      alignSelf: 'flex-start',
                      px: 4,
                      py: 1.375,
                      borderRadius: 2.5,
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
                      boxShadow: '0 6px 20px rgba(37,99,235,0.4)',
                      '&:hover': { background: 'linear-gradient(135deg, #1e40af, #1d4ed8)' }
                    }}
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
