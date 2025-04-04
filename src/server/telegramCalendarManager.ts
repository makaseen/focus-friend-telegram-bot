
import { Context } from 'telegraf';
import { googleCalendarApi } from '../utils/googleCalendar/index.js';
import { CalendarEvent, TokenResponse } from '../utils/googleCalendar/types.js';

interface UserCalendarToken extends TokenResponse {
  userId: number;
}

export class TelegramCalendarManager {
  private userTokens: Record<number, UserCalendarToken> = {};
  private pendingAuths: Record<string, number> = {};
  
  // Generate a unique OAuth state for security
  generateOAuthState(userId: number): string {
    const state = `telegram-${userId}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    this.pendingAuths[state] = userId;
    // Clean up old pending auths after 10 minutes
    setTimeout(() => {
      delete this.pendingAuths[state];
    }, 10 * 60 * 1000);
    return state;
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
    
    this.userTokens[userId] = {
      ...token,
      userId
    };
    
    // Clean up the pending auth
    delete this.pendingAuths[state];
    return true;
  }
  
  // Check if a user has connected their calendar
  isCalendarConnected(userId: number): boolean {
    return !!this.userTokens[userId] && 
           !!this.userTokens[userId].access_token &&
           (this.userTokens[userId].expiry_date || 0) > Date.now();
  }
  
  // Get events for a user
  async getEventsForUser(userId: number, maxResults: number = 10): Promise<CalendarEvent[] | null> {
    if (!this.isCalendarConnected(userId)) {
      return null;
    }
    
    try {
      // Use existing googleCalendarApi but with the user's token
      const token = this.userTokens[userId];
      
      // Implementation would depend on how googleCalendarApi is structured
      // In a real implementation, we'd either:
      // 1. Modify the googleCalendarApi to accept a token parameter
      // 2. Create a new instance of the API with the user's token
      // 3. Use a different API entirely that's designed for server-side use
      
      // For this demo, let's assume we have an adapter function:
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
    
    // In production, you'd make an actual API call here using the token
    // and parse the response into CalendarEvent objects
    
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    // Mock events
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
          dateTime: nextWeek.toISOString(),
        },
        end: {
          dateTime: nextWeek.toISOString(),
        }
      }
    ];
  }
}
