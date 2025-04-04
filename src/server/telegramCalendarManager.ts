
import { Context } from 'telegraf';
import { googleCalendarApi } from '../utils/googleCalendar/index.js';
import { CalendarEvent, TokenResponse } from '../utils/googleCalendar/types.js';
import { MAX_TIME_RANGE_MS } from '../utils/googleCalendar/constants.js';

interface UserCalendarToken extends TokenResponse {
  userId: number;
}

export class TelegramCalendarManager {
  private userTokens: Record<number, UserCalendarToken> = {};
  private pendingAuths: Record<string, number> = {};
  private authStateExpiryMs: number = 10 * 60 * 1000; // 10 minutes
  
  // Generate a unique OAuth state for security
  generateOAuthState(userId: number): string {
    const state = this.createUniqueState(userId);
    this.storePendingAuth(state, userId);
    return state;
  }
  
  // Creates a unique state string
  private createUniqueState(userId: number): string {
    return `telegram-${userId}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
  
  // Store the pending auth and set expiry
  private storePendingAuth(state: string, userId: number): void {
    this.pendingAuths[state] = userId;
    
    // Clean up old pending auths after expiry time
    setTimeout(() => {
      delete this.pendingAuths[state];
    }, this.authStateExpiryMs);
  }
  
  // Get the authorization URL for a user
  getAuthUrl(userId: number): string {
    const state = this.generateOAuthState(userId);
    // Use /auth/google for consistency with the frontend routes
    return `${process.env.API_BASE_URL || 'https://focus-friend-telegram-bot.lovable.app'}/auth/google?state=${state}`;
  }
  
  // Process OAuth callback and store the token
  processAuthCallback(state: string, token: TokenResponse): boolean {
    const userId = this.pendingAuths[state];
    
    if (!userId) {
      return false;
    }
    
    this.storeUserToken(userId, token);
    
    // Clean up the pending auth
    delete this.pendingAuths[state];
    return true;
  }
  
  // Store a user's token
  private storeUserToken(userId: number, token: TokenResponse): void {
    this.userTokens[userId] = {
      ...token,
      userId
    };
  }
  
  // Check if a user has connected their calendar
  isCalendarConnected(userId: number): boolean {
    const token = this.userTokens[userId];
    return !!token && 
           !!token.access_token &&
           (token.expiry_date || 0) > Date.now();
  }
  
  // Get events for a user
  async getEventsForUser(userId: number, maxResults: number = 10): Promise<CalendarEvent[] | null> {
    if (!this.isCalendarConnected(userId)) {
      return null;
    }
    
    try {
      const token = this.userTokens[userId];
      const events = await this.fetchEventsWithToken(token, maxResults);
      return events;
    } catch (error) {
      console.error(`Error fetching events for user ${userId}:`, error);
      return null;
    }
  }
  
  // Adapter function to fetch events with a specific token
  private async fetchEventsWithToken(token: TokenResponse, maxResults: number): Promise<CalendarEvent[]> {
    // In a real implementation, this would use the Google Calendar API directly
    // For now, we'll return mock data
    
    const now = new Date();
    const tomorrow = this.createDateForTomorrow(now);
    const nextWeek = this.createDateForNextWeek(now);
    
    // Limit to one month from now
    const oneMonthFromNow = new Date(now.getTime() + MAX_TIME_RANGE_MS);
    
    // Mock events - ensure none are beyond the one month window
    return this.createMockEvents(now, tomorrow, nextWeek, oneMonthFromNow);
  }
  
  // Create a date for tomorrow
  private createDateForTomorrow(now: Date): Date {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }
  
  // Create a date for next week
  private createDateForNextWeek(now: Date): Date {
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek;
  }
  
  // Create mock events
  private createMockEvents(
    now: Date, 
    tomorrow: Date, 
    nextWeek: Date, 
    oneMonthFromNow: Date
  ): CalendarEvent[] {
    return [
      {
        id: '1',
        summary: 'Team Meeting',
        description: 'Weekly sync with the team',
        start: {
          dateTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 2, 0).toISOString(),
        },
        end: {
          dateTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 3, 0).toISOString(),
        }
      },
      {
        id: '2',
        summary: 'Project Deadline',
        description: 'Complete phase 1 of the project',
        start: {
          dateTime: tomorrow.toISOString(),
        },
        end: {
          dateTime: tomorrow.toISOString(),
        }
      },
      {
        id: '3',
        summary: 'Weekly Review',
        description: 'Review progress and plan next week',
        start: {
          dateTime: new Date(Math.min(nextWeek.getTime(), oneMonthFromNow.getTime())).toISOString(),
        },
        end: {
          dateTime: new Date(Math.min(nextWeek.getTime(), oneMonthFromNow.getTime())).toISOString(),
        }
      }
    ];
  }
}
