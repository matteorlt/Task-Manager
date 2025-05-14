import { FC } from 'react';

interface CalendarProps {
  onSelectDate: (date: Date) => void;
}

declare const Calendar: FC<CalendarProps>;
export default Calendar; 