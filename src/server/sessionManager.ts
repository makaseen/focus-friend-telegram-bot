
import { Context } from 'telegraf';

// User session state
export interface UserSession {
  userId: number;
  state: string;
  lastInteraction: Date;
  calendarConnected?: boolean; // Add this property for calendar connection status
  currentFocusSession?: {
    started: Date;
    duration: number;
    task?: string;
  };
  // Add other session properties as needed
}

// Session manager for tracking user sessions
class SessionManager {
  private sessions: Record<number, UserSession> = {};

  // Create a new user session
  createSession(userId: number, initialData: Partial<UserSession> = {}): UserSession {
    const newSession: UserSession = {
      userId,
      state: 'idle',
      lastInteraction: new Date(),
      ...initialData
    };

    this.sessions[userId] = newSession;
    console.log(`Created new session for user ${userId}`);
    return newSession;
  }

  // Get a user session
  getSession(userId: number): UserSession | undefined {
    return this.sessions[userId];
  }

  // Update a user session
  updateSession(userId: number, data: Partial<UserSession>): UserSession {
    if (!this.sessions[userId]) {
      return this.createSession(userId, data);
    }

    this.sessions[userId] = {
      ...this.sessions[userId],
      ...data
    };

    return this.sessions[userId];
  }

  // Get all sessions
  getAllSessions(): Record<number, UserSession> {
    return this.sessions;
  }
}

export const sessionManager = new SessionManager();
