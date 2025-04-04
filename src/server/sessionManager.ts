
// Interface for user session data
export interface UserSession {
  userId: number;
  state: string;
  calendarConnected: boolean;
  lastInteraction: Date;
}

export class SessionManager {
  private sessions: Record<number, UserSession> = {};
  
  getSession(userId: number): UserSession | null {
    return this.sessions[userId] || null;
  }
  
  createSession(userId: number): UserSession {
    const session: UserSession = {
      userId,
      state: 'idle',
      calendarConnected: false,
      lastInteraction: new Date()
    };
    
    this.sessions[userId] = session;
    return session;
  }
  
  updateSession(userId: number, data: Partial<UserSession>): UserSession {
    if (!this.sessions[userId]) {
      return this.createSession(userId);
    }
    
    this.sessions[userId] = {
      ...this.sessions[userId],
      ...data,
      lastInteraction: new Date() // Always update last interaction time
    };
    
    return this.sessions[userId];
  }
  
  getAllSessions(): Record<number, UserSession> {
    return this.sessions;
  }
}

// Create a singleton instance
export const sessionManager = new SessionManager();
