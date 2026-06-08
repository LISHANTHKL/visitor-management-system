import { Box, Divider, Stack, Typography } from '@mui/material';

const PageHeader = ({ title, subtitle, action }) => (
  <Box>
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      alignItems={{ sm: 'flex-start' }}
      spacing={2}
      sx={{ mb: 2 }}
    >
      <Box>
        <Typography
          variant="h5"
          component="h1"
          sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.01em' }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography color="text.secondary" sx={{ mt: 0.5, fontSize: '0.9rem' }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
    </Stack>
    <Divider />
  </Box>
);

export default PageHeader;
