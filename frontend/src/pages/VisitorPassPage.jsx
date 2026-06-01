import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import BadgeIcon from '@mui/icons-material/Badge';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import { getVisitorPassById } from '../services/visitorRequestService.js';

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

const PassDetail = ({ label, value }) => (
  <Box>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography sx={{ fontWeight: 700 }}>{value || '-'}</Typography>
  </Box>
);

const VisitorPassPage = () => {
  const { id } = useParams();
  const [pass, setPass] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    const loadPass = async () => {
      setIsLoading(true);
      setError('');

      try {
        const data = await getVisitorPassById(id);

        if (isActive) {
          setPass(data.pass);
        }
      } catch (requestError) {
        if (isActive) {
          setPass(null);
          setError(requestError.response?.data?.message || 'Unable to load visitor pass');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadPass();

    return () => {
      isActive = false;
    };
  }, [id]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: { xs: 3, md: 6 } }}>
      <Container maxWidth="md">
        {isLoading ? (
          <Paper variant="outlined" sx={{ p: 5, borderRadius: 2, display: 'grid', placeItems: 'center' }}>
            <CircularProgress />
          </Paper>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ p: { xs: 3, md: 4 }, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
              <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="flex-start">
                <Box>
                  <Typography variant="overline" sx={{ color: 'inherit', opacity: 0.8 }}>
                    Visitor Pass
                  </Typography>
                  <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
                    {pass.visitorName}
                  </Typography>
                </Box>
                <Chip label="Approved" color="success" sx={{ fontWeight: 700 }} />
              </Stack>
            </Box>

            <Grid container>
              <Grid size={{ xs: 12, md: 7 }}>
                <Stack spacing={3} sx={{ p: { xs: 3, md: 4 } }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <BadgeIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Visit Details
                    </Typography>
                  </Stack>

                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <PassDetail label="Visitor Name" value={pass.visitorName} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <PassDetail label="Employee Name" value={pass.employeeName} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <PassDetail label="Department" value={pass.department} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <PassDetail label="Cabin Number" value={pass.cabinNumber} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <PassDetail label="Visit Date" value={formatDate(pass.visitDate)} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <PassDetail label="Visit Time" value={formatSlotLabel(pass.visitTime)} />
                    </Grid>
                  </Grid>

                  <Divider />

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                    <Chip icon={<EventAvailableIcon />} label={formatDate(pass.visitDate)} variant="outlined" />
                    <Chip icon={<MeetingRoomIcon />} label={`Cabin ${pass.cabinNumber || '-'}`} variant="outlined" />
                  </Stack>
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, md: 5 }}>
                <Stack
                  spacing={2}
                  alignItems="center"
                  justifyContent="center"
                  sx={{
                    height: '100%',
                    minHeight: 320,
                    p: { xs: 3, md: 4 },
                    borderLeft: { md: 1 },
                    borderTop: { xs: 1, md: 0 },
                    borderColor: 'divider',
                    bgcolor: 'grey.50'
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <QrCode2Icon color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      QR Code
                    </Typography>
                  </Stack>
                  <Box
                    component="img"
                    src={pass.qrCodeImage}
                    alt="Visitor pass QR code"
                    sx={{
                      width: 'min(100%, 260px)',
                      aspectRatio: '1 / 1',
                      borderRadius: 2,
                      border: 1,
                      borderColor: 'divider',
                      bgcolor: 'common.white',
                      p: 1
                    }}
                  />
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default VisitorPassPage;
