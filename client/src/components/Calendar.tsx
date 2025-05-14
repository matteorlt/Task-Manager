import React from 'react';
import { Box } from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import frLocale from 'date-fns/locale/fr';

interface CalendarProps {
  onSelectDate: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ onSelectDate }) => {
  return (
    <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={frLocale}>
        <DateCalendar
          onChange={(date: Date | null) => {
            if (date) {
              onSelectDate(date);
            }
          }}
          sx={{
            width: '100%',
            '& .MuiPickersCalendarHeader-root': {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            },
            '& .MuiPickersDay-root': {
              margin: '2px',
            },
          }}
        />
      </LocalizationProvider>
    </Box>
  );
};

export default Calendar; 