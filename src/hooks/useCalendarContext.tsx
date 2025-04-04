
import { useContext } from 'react';
import { CalendarContext } from '@/contexts/calendar/CalendarContext';

// Export the useCalendar hook
export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};
