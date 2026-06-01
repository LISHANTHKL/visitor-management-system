import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { searchPublicEmployees } from '../services/visitorRequestService.js';

const getEmployeeLabel = (employee) => {
  if (!employee) return '';

  const detail = [employee.designation, employee.department].filter(Boolean).join(' | ');
  return detail ? `${employee.name} - ${detail}` : employee.name;
};

const EmployeeSearch = ({ value, onChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true);
      setError('');

      try {
        const data = await searchPublicEmployees(inputValue);
        setEmployees(data.employees || []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to load employees');
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [inputValue]);

  const selectedEmployee = useMemo(() => value, [value]);

  return (
    <Stack spacing={2}>
      {error && <Alert severity="error">{error}</Alert>}

      <Autocomplete
        value={value}
        inputValue={inputValue}
        options={employees}
        loading={isLoading}
        onInputChange={(_event, nextValue) => setInputValue(nextValue)}
        onChange={(_event, nextValue) => onChange(nextValue)}
        getOptionLabel={getEmployeeLabel}
        isOptionEqualToValue={(option, selected) => option._id === selected._id}
        filterOptions={(options) => options}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search employee"
            placeholder="Search by name, employee code, or department"
            required
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <>
                  <SearchIcon color="action" sx={{ mr: 1 }} />
                  {params.InputProps.startAdornment}
                </>
              ),
              endAdornment: (
                <>
                  {isLoading ? <CircularProgress color="inherit" size={18} /> : null}
                  {params.InputProps.endAdornment}
                </>
              )
            }}
          />
        )}
      />

      {selectedEmployee && (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {selectedEmployee.name}
              </Typography>
              {selectedEmployee.employeeCode && (
                <Chip size="small" label={selectedEmployee.employeeCode} variant="outlined" />
              )}
            </Stack>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Designation
              </Typography>
              <Typography>{selectedEmployee.designation || '-'}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Department
              </Typography>
              <Typography>{selectedEmployee.department || '-'}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Cabin Number
              </Typography>
              <Typography>{selectedEmployee.cabinNumber || '-'}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Office Location
              </Typography>
              <Typography>{selectedEmployee.officeLocation || '-'}</Typography>
            </Box>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
};

export default EmployeeSearch;

