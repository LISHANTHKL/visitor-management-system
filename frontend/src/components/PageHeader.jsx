import { Stack, Typography } from '@mui/material';

const PageHeader = ({ title, subtitle }) => (
  <Stack spacing={0.5}>
    <Typography variant="h4" component="h1">
      {title}
    </Typography>
    {subtitle && <Typography color="text.secondary">{subtitle}</Typography>}
  </Stack>
);

export default PageHeader;

