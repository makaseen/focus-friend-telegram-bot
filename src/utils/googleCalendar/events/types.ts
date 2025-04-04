
import { CalendarEvent, CalendarEventListParams } from '../types';

export {
  CalendarEvent,
  CalendarEventListParams
};

export interface EventsAPIError {
  result?: {
    error?: {
      code: number;
      message: string;
    };
  };
  status?: number;
  message?: string;
}

export interface TimeRange {
  now: Date;
  oneMonthFromNow: Date;
}
