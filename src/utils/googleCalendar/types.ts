
export interface TokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  expiry_date?: number;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  [key: string]: any;
}

export interface CalendarEventListParams {
  calendarId: string;
  timeMin: string;
  timeMax?: string;
  showDeleted: boolean;
  singleEvents: boolean;
  maxResults: number;
  orderBy: string;
}
