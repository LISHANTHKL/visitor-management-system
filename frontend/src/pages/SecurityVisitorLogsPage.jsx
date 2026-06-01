import { Paper, Stack, Typography } from '@mui/material';

const SecurityVisitorLogsPage = () => (
  <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
    <Stack spacing={1}>
      <Typography variant="h4" component="h1">
        Visitor Logs
      </Typography>
      <Typography color="text.secondary">
        Security visitor log workflow will be available here.
      </Typography>
    </Stack>
  </Paper>
);

export default SecurityVisitorLogsPage;
