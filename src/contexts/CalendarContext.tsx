
// This file is now just re-exporting from the new structure
// to maintain backward compatibility during the refactoring

import { CalendarProvider } from './calendar/CalendarContext';
import { useCalendar } from '@/hooks/useCalendarContext';
import { CalendarConfigAlert } from '@/components/calendar/CalendarConfigAlert';

export { CalendarProvider, useCalendar, CalendarConfigAlert };
