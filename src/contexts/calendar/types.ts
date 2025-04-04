
import { ReactNode } from 'react';

export interface CalendarContextType {
  calendarConnected: boolean;
  isConnecting: boolean;
  isConfigured: boolean;
  connectCalendar: () => void;
  disconnectCalendar: () => void;
  updateClientId: (clientId: string) => void;
  updateClientSecret: (clientSecret: string) => void;
  events: any[];
  refreshEvents: () => Promise<void>;
}

export interface CalendarProviderProps {
  children: ReactNode;
}
