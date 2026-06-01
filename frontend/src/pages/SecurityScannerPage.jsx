import { Paper, Stack, Typography } from '@mui/material';

const SecurityScannerPage = () => (
  <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
    <Stack spacing={1}>
      <Typography variant="h4" component="h1">
        QR Scanner
      </Typography>
      <Typography color="text.secondary">
        Security scanner workflow will be available here.
      </Typography>
    </Stack>
  </Paper>
);

export default SecurityScannerPage;
