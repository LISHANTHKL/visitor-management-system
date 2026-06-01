import { Box, Grid, Paper, Stack, Typography } from '@mui/material';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import BadgeIcon from '@mui/icons-material/Badge';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

const summaryCards = [
  { label: 'Visitors Today', value: '0', icon: <PeopleAltIcon color="primary" /> },
  { label: 'Checked In', value: '0', icon: <BadgeIcon color="primary" /> },
  { label: 'Scheduled Visits', value: '0', icon: <EventAvailableIcon color="primary" /> }
];

const DashboardPage = () => (
  <Stack spacing={4}>
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <Typography color="text.secondary">
        Initial workspace for visitor operations. Feature modules can be added from here.
      </Typography>
    </Box>

    <Grid container spacing={2}>
      {summaryCards.map((card) => (
        <Grid key={card.label} size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 2 }} variant="outlined">
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {card.label}
                </Typography>
                <Typography variant="h4" sx={{ mt: 1, fontWeight: 700 }}>
                  {card.value}
                </Typography>
              </Box>
              {card.icon}
            </Stack>
          </Paper>
        </Grid>
      ))}
    </Grid>
  </Stack>
);

export default DashboardPage;

