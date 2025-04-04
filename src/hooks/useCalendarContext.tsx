
import { useContext } from 'react';
import { CalendarContext } from '@/contexts/calendar/CalendarContext';
import { CalendarContextType } from '@/contexts/calendar/types';

/**
 * Hook for accessing the calendar context
 * @returns Calendar context values and functions
 * @throws Error if used outside of CalendarProvider
 */
export const useCalendar = (): CalendarContextType => {
  const context = useContext(CalendarContext);
  
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  
  return context;
};
