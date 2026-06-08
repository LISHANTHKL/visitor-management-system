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
import BusinessIcon from '@mui/icons-material/Business';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import VerifiedIcon from '@mui/icons-material/Verified';
import { getVisitorPassById } from '../services/visitorRequestService.js';

const formatDate = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'long',
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

const PassDetail = ({ icon, label, value }) => (
  <Stack direction="row" spacing={1.5} alignItems="flex-start">
    <Box sx={{ color: 'primary.main', mt: 0.15, flexShrink: 0 }}>{icon}</Box>
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', mt: 0.15 }}>{value || '-'}</Typography>
    </Box>
  </Stack>
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
        if (isActive) setPass(data.pass);
      } catch (requestError) {
        if (isActive) {
          setPass(null);
          setError(requestError.response?.data?.message || 'Unable to load visitor pass');
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    };
    loadPass();
    return () => { isActive = false; };
  }, [id]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f1f5f9', py: { xs: 3, md: 6 } }}>
      <Container maxWidth="md">
        {isLoading ? (
          <Paper variant="outlined" sx={{ p: 5, borderRadius: 3, display: 'grid', placeItems: 'center' }}>
            <CircularProgress />
          </Paper>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
        ) : (
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3, justifyContent: 'center' }}>
              <ShieldOutlinedIcon sx={{ color: 'primary.main', fontSize: 22 }} />
              <Typography sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.125rem' }}>
                Visitor Management System — Official Entry Pass
              </Typography>
            </Stack>

            <Paper
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                border: '1px solid #e2e8f0'
              }}
            >
              <Box
                sx={{
                  p: { xs: 3, md: 4 },
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%)',
                  color: '#fff',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: -40,
                    right: -40,
                    width: 180,
                    height: 180,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.06)'
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -20,
                    left: 120,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.04)'
                  }}
                />
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ position: 'relative' }}>
                  <Box>
                    <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', mb: 0.75 }}>
                      Visitor Pass
                    </Typography>
                    <Typography
                      variant="h4"
                      component="h1"
                      sx={{ fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, mb: 0.5 }}
                    >
                      {pass.visitorName}
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
                      {pass.visitorEmail}
                    </Typography>
                  </Box>
                  <Stack spacing={1} alignItems="flex-end">
                    <Chip
                      icon={<VerifiedIcon sx={{ color: '#16a34a !important', fontSize: '16px !important' }} />}
                      label="Approved"
                      sx={{
                        bgcolor: 'rgba(22,163,74,0.2)',
                        color: '#86efac',
                        fontWeight: 700,
                        border: '1px solid rgba(22,163,74,0.4)',
                        '& .MuiChip-icon': { color: '#86efac' }
                      }}
                    />
                  </Stack>
                </Stack>
              </Box>

              <Grid container>
                <Grid size={{ xs: 12, md: 7 }}>
                  <Box sx={{ p: { xs: 3, md: 4 } }}>
                    <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '0.08em', mb: 2.5, display: 'block' }}>
                      Visit Information
                    </Typography>
                    <Stack spacing={2.5}>
                      <PassDetail
                        icon={<BadgeIcon fontSize="small" />}
                        label="Meeting With"
                        value={pass.employeeName}
                      />
                      <PassDetail
                        icon={<BusinessIcon fontSize="small" />}
                        label="Department"
                        value={pass.department}
                      />
                      <PassDetail
                        icon={<MeetingRoomIcon fontSize="small" />}
                        label="Cabin / Room"
                        value={pass.cabinNumber}
                      />
                      <Divider />
                      <PassDetail
                        icon={<CalendarTodayIcon fontSize="small" />}
                        label="Visit Date"
                        value={formatDate(pass.visitDate)}
                      />
                      <PassDetail
                        icon={<ScheduleIcon fontSize="small" />}
                        label="Scheduled Time"
                        value={formatSlotLabel(pass.visitTime)}
                      />
                    </Stack>

                    <Box
                      sx={{
                        mt: 3,
                        p: 2,
                        borderRadius: 2,
                        bgcolor: '#fff9db',
                        border: '1px solid #fef08a'
                      }}
                    >
                      <Typography variant="caption" sx={{ color: '#854d0e', fontWeight: 600, display: 'block', mb: 0.5 }}>
                        Important
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        Present this QR code at the security checkpoint for contactless entry.
                      </Typography>
                    </Box>
                  </Box>
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
                      borderLeft: { md: '1px solid #e2e8f0' },
                      borderTop: { xs: '1px solid #e2e8f0', md: 0 },
                      bgcolor: '#f8fafc'
                    }}
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        bgcolor: '#eff6ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <QrCode2Icon sx={{ color: 'primary.main', fontSize: 22 }} />
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary', textAlign: 'center' }}>
                      Scan to verify entry
                    </Typography>
                    <Box
                      component="img"
                      src={pass.qrCodeImage}
                      alt="Visitor pass QR code"
                      sx={{
                        width: 'min(100%, 220px)',
                        aspectRatio: '1 / 1',
                        borderRadius: 2,
                        border: '2px solid #e2e8f0',
                        bgcolor: '#fff',
                        p: 1.5
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', lineHeight: 1.6 }}>
                      Valid for {formatDate(pass.visitDate)}
                      <br />
                      at {formatSlotLabel(pass.visitTime)}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default VisitorPassPage;
