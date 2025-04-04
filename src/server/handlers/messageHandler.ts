
import { Context } from 'telegraf';
import { formatDistance } from 'date-fns';
import { sessionManager } from '../sessionManager';
import { TelegramCalendarManager } from '../telegramCalendarManager';

export class MessageHandler {
  private calendarManager: TelegramCalendarManager;
  
  constructor(calendarManager: TelegramCalendarManager) {
    this.calendarManager = calendarManager;
  }
  
  async handleTextMessage(ctx: Context, userId: number, messageText: string): Promise<void> {
    // Update last interaction time
    if (sessionManager.getSession(userId)) {
      sessionManager.updateSession(userId, { lastInteraction: new Date() });
    } else {
      sessionManager.createSession(userId);
    }
    
    // Handle different message intents based on keywords
    const lowerInput = messageText.toLowerCase();
    let responseText = "";
    
    try {
      // Calendar-specific responses
      if (lowerInput.includes("calendar") || lowerInput.includes("schedule") || 
          lowerInput.includes("events") || lowerInput.includes("appointment")) {
        responseText = await this.handleCalendarRelatedMessage(userId);
      }
      // Handle what's next or today's schedule
      else if (lowerInput.includes("what's next") || lowerInput.includes("whats next") || 
               lowerInput.includes("next event") || lowerInput.includes("today") || 
               lowerInput.includes("upcoming")) {
        responseText = await this.handleUpcomingEventsMessage(userId);
      }
      // Handle stress/overwhelm
      else if (lowerInput.includes("overwhelm") || lowerInput.includes("stress")) {
        responseText = await this.handleStressMessage(userId);
      } 
      // Handle focus/concentration
      else if (lowerInput.includes("focus") || lowerInput.includes("concentrate") || 
               lowerInput.includes("attention") || lowerInput.includes("distracted")) {
        responseText = "Focus difficulties often stem from dopamine-seeking behavior and prefrontal cortex fatigue. Research shows three effective strategies: 1) Time-blocking with the Pomodoro technique (25 min focus/5 min break), 2) Reducing environmental distractions to minimize attentional shifts, and 3) Pre-committing to tasks with implementation intentions ('When X happens, I will do Y'). Which would you like to explore?";
      }
      // Default response
      else {
        responseText = "I understand. From a neurophysiological perspective, organizing thoughts activates your brain's executive function network. Let's create an action plan aligned with your brain's natural attention cycles. Most people have 2-3 high-focus periods daily (typically mid-morning and late afternoon). Would you like me to help you structure your tasks around these optimal cognitive windows?";
      }
      
      await ctx.reply(responseText);
    } catch (error) {
      console.error('Error handling message:', error);
      await ctx.reply('I apologize, but I encountered an error while processing your message. Please try again later.');
    }
  }
  
  private async handleCalendarRelatedMessage(userId: number): Promise<string> {
    const userSession = sessionManager.getSession(userId);
    
    if (!userSession?.calendarConnected) {
      return "I'd love to help with your calendar, but you haven't connected your Google Calendar yet. Based on neurophysiology research, external scheduling systems reduce cognitive load and free up mental resources. Use /connect_calendar to set it up.";
    }
    
    const events = await this.calendarManager.getEventsForUser(userId);
    
    if (!events || events.length === 0) {
      return "Your Google Calendar is connected, but I don't see any upcoming events. Studies show that having a clear schedule can reduce anxiety, but it's also important to structure your time intentionally to maintain focus. Would you like some tips on effective time blocking?";
    }
    
    const formattedEvents = events.slice(0, 3).map((event, index) => {
      const start = event.start.dateTime ? new Date(event.start.dateTime) : new Date(event.start.date);
      const timeUntil = formatDistance(start, new Date(), { addSuffix: true });
      
      return `${index + 1}. ${event.summary} - ${start.toLocaleDateString()} ${
        event.start.dateTime 
          ? `at ${start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
          : 'All day'
      } (${timeUntil})`;
    }).join('\n');
    
    return `Here are your upcoming events:\n\n${formattedEvents}\n\nBased on your schedule, I can help you implement optimal focus periods between these commitments. The brain's prefrontal cortex functions best when we alternate between 90-minute focus sessions and short breaks. Which event would you like to prepare for?`;
  }
  
  private async handleUpcomingEventsMessage(userId: number): Promise<string> {
    const userSession = sessionManager.getSession(userId);
    
    if (!userSession?.calendarConnected) {
      return "I'd need access to your calendar to tell you what's coming up next. Research shows that externalizing your schedule reduces the cognitive load on your working memory. Use /connect_calendar to get started.";
    }
    
    const events = await this.calendarManager.getEventsForUser(userId);
    
    if (!events || events.length === 0) {
      return "I don't see any upcoming events in your calendar. This is an excellent opportunity to engage in deep work. The brain needs approximately 23 minutes to reach a flow state after interruptions - would you like me to help you schedule an optimal focus session?";
    }
    
    const nextEvent = events[0];
    const start = nextEvent.start.dateTime ? new Date(nextEvent.start.dateTime) : new Date(nextEvent.start.date);
    const timeUntil = formatDistance(start, new Date(), { addSuffix: true });
    
    let response = `Your next event is "${nextEvent.summary}" ${timeUntil} (${start.toLocaleDateString()} ${
      nextEvent.start.dateTime 
        ? `at ${start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
        : 'All day'
    }).\n\nTo prepare optimally, I recommend a focus session now, followed by a 10-minute transition period before the event. This aligns with research on context-switching, which shows that planned transitions reduce cognitive strain.`;
    
    if (events.length > 1) {
      response += "\n\nWould you like to see more of your upcoming events and plan your focus blocks?";
    }
    
    return response;
  }
  
  private async handleStressMessage(userId: number): Promise<string> {
    const userSession = sessionManager.getSession(userId);
    
    if (userSession?.calendarConnected) {
      const events = await this.calendarManager.getEventsForUser(userId);
      
      if (events && events.length > 0) {
        const formattedEvents = events.slice(0, 3).map((event, index) => {
          const start = event.start.dateTime ? new Date(event.start.dateTime) : new Date(event.start.date);
          const timeUntil = formatDistance(start, new Date(), { addSuffix: true });
          
          return `${index + 1}. ${event.summary} - ${start.toLocaleDateString()} ${
            event.start.dateTime 
              ? `at ${start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
              : 'All day'
          } (${timeUntil})`;
        }).join('\n');
        
        return `I understand you're feeling overwhelmed. This activates your amygdala and can impair prefrontal cortex function. Let's examine your schedule strategically:\n\n${formattedEvents}\n\nNeurophysiology research suggests breaking these down into smaller tasks can reduce cognitive load and cortisol levels. Which event causes the most stress? We can create a structured approach.`;
      }
    }
    
    return "When you're overwhelmed, your brain's stress response can impair executive function. Let's apply the 'cognitive offloading' technique: First, let's write down everything that's on your mind. Studies show that externalizing your thoughts reduces amygdala activation and allows your prefrontal cortex to engage in more effective problem-solving. What specific tasks are causing your stress?";
  }
}
