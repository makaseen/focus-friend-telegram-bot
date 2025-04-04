
import { Telegraf, Context } from 'telegraf';
import { message } from 'telegraf/filters';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { formatDistance } from 'date-fns';
import { googleCalendarApi } from '../utils/googleCalendar';
import { TelegramCalendarManager } from './telegramCalendarManager';
import { handleCalendarCommand, handleNextEventCommand, handleScheduleCommand } from './commands/calendarCommands';
import { handleFocusCommand, handleBreakCommand, handleProcrastinationCommand } from './commands/focusCommands';

// Load environment variables
dotenv.config();

// Initialize the bot with token from environment variables
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || '');
const calendarManager = new TelegramCalendarManager();

// Set up Express server
const app = express();
app.use(cors());
app.use(express.json());

// Simple in-memory user state storage - in production use a proper database
const userSessions: Record<number, {
  userId: number,
  state: string,
  calendarConnected: boolean,
  lastInteraction: Date
}> = {};

// Bot welcome message
bot.start(async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;
  
  // Initialize user session
  userSessions[userId] = {
    userId,
    state: 'idle',
    calendarConnected: false,
    lastInteraction: new Date()
  };
  
  await ctx.reply(
    "Hello! I'm your Focus Friend, a time management expert and neurophysiology specialist. I can help you optimize your focus, manage your schedule effectively, and provide science-backed strategies for better concentration. How can I assist you today?\n\n" +
    "Try these commands:\n" +
    "/connect_calendar - Connect your Google Calendar\n" +
    "/schedule - See today's events\n" +
    "/next - See your next upcoming event\n" +
    "/focus - Get personalized focus techniques\n" +
    "/break - Get a structured break suggestion\n" +
    "/help - See all available commands"
  );
});

// Help command
bot.help((ctx) => {
  ctx.reply(
    "Here's how I can help you:\n\n" +
    "/connect_calendar - Connect your Google Calendar\n" +
    "/schedule - See today's events\n" +
    "/next - See your next upcoming event\n" +
    "/focus - Get personalized focus techniques\n" +
    "/break - Get a structured break suggestion\n" +
    "/procrastination - Tips to overcome procrastination\n\n" +
    "You can also ask me questions about focus, productivity, and time management!"
  );
});

// Handle calendar connection
bot.command('connect_calendar', async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;
  
  await handleCalendarCommand(ctx, userId, calendarManager, userSessions);
});

// Handle schedule command
bot.command('schedule', async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;
  
  await handleScheduleCommand(ctx, userId, calendarManager, userSessions);
});

// Handle next event command
bot.command('next', async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;
  
  await handleNextEventCommand(ctx, userId, calendarManager, userSessions);
});

// Focus techniques command
bot.command('focus', async (ctx) => {
  await handleFocusCommand(ctx);
});

// Break suggestion command
bot.command('break', async (ctx) => {
  await handleBreakCommand(ctx);
});

// Procrastination help command
bot.command('procrastination', async (ctx) => {
  await handleProcrastinationCommand(ctx);
});

// Handle text messages using similar logic to web chat
bot.on(message('text'), async (ctx) => {
  const userId = ctx.from?.id;
  const messageText = ctx.message.text;
  
  if (!userId || !messageText) return;
  
  // Update last interaction time
  if (userSessions[userId]) {
    userSessions[userId].lastInteraction = new Date();
  } else {
    userSessions[userId] = {
      userId,
      state: 'idle',
      calendarConnected: false,
      lastInteraction: new Date()
    };
  }
  
  // Handle different message intents based on keywords
  // Similar to the web chat implementation
  const lowerInput = messageText.toLowerCase();
  let responseText = "";
  
  // Calendar-specific responses
  if (lowerInput.includes("calendar") || lowerInput.includes("schedule") || lowerInput.includes("events") || lowerInput.includes("appointment")) {
    if (!userSessions[userId].calendarConnected) {
      responseText = "I'd love to help with your calendar, but you haven't connected your Google Calendar yet. Based on neurophysiology research, external scheduling systems reduce cognitive load and free up mental resources. Use /connect_calendar to set it up.";
    } else {
      const events = await calendarManager.getEventsForUser(userId);
      if (!events || events.length === 0) {
        responseText = "Your Google Calendar is connected, but I don't see any upcoming events. Studies show that having a clear schedule can reduce anxiety, but it's also important to structure your time intentionally to maintain focus. Would you like some tips on effective time blocking?";
      } else {
        const formattedEvents = events.slice(0, 3).map((event, index) => {
          const start = event.start.dateTime ? new Date(event.start.dateTime) : new Date(event.start.date);
          const timeUntil = formatDistance(start, new Date(), { addSuffix: true });
          
          return `${index + 1}. ${event.summary} - ${start.toLocaleDateString()} ${
            event.start.dateTime 
              ? `at ${start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
              : 'All day'
          } (${timeUntil})`;
        }).join('\n');
        
        responseText = `Here are your upcoming events:\n\n${formattedEvents}\n\nBased on your schedule, I can help you implement optimal focus periods between these commitments. The brain's prefrontal cortex functions best when we alternate between 90-minute focus sessions and short breaks. Which event would you like to prepare for?`;
      }
    }
  }
  // Handle what's next or today's schedule
  else if (lowerInput.includes("what's next") || lowerInput.includes("whats next") || lowerInput.includes("next event") || 
           lowerInput.includes("today") || lowerInput.includes("upcoming")) {
    if (!userSessions[userId].calendarConnected) {
      responseText = "I'd need access to your calendar to tell you what's coming up next. Research shows that externalizing your schedule reduces the cognitive load on your working memory. Use /connect_calendar to get started.";
    } else {
      const events = await calendarManager.getEventsForUser(userId);
      if (!events || events.length === 0) {
        responseText = "I don't see any upcoming events in your calendar. This is an excellent opportunity to engage in deep work. The brain needs approximately 23 minutes to reach a flow state after interruptions - would you like me to help you schedule an optimal focus session?";
      } else {
        const nextEvent = events[0];
        const start = nextEvent.start.dateTime ? new Date(nextEvent.start.dateTime) : new Date(nextEvent.start.date);
        const timeUntil = formatDistance(start, new Date(), { addSuffix: true });
        
        responseText = `Your next event is "${nextEvent.summary}" ${timeUntil} (${start.toLocaleDateString()} ${
          nextEvent.start.dateTime 
            ? `at ${start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
            : 'All day'
        }).\n\nTo prepare optimally, I recommend a focus session now, followed by a 10-minute transition period before the event. This aligns with research on context-switching, which shows that planned transitions reduce cognitive strain.`;
        
        if (events.length > 1) {
          responseText += "\n\nWould you like to see more of your upcoming events and plan your focus blocks?";
        }
      }
    }
  }
  // Handle stress/overwhelm
  else if (lowerInput.includes("overwhelm") || lowerInput.includes("stress")) {
    if (userSessions[userId].calendarConnected) {
      const events = await calendarManager.getEventsForUser(userId);
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
        
        responseText = `I understand you're feeling overwhelmed. This activates your amygdala and can impair prefrontal cortex function. Let's examine your schedule strategically:\n\n${formattedEvents}\n\nNeurophysiology research suggests breaking these down into smaller tasks can reduce cognitive load and cortisol levels. Which event causes the most stress? We can create a structured approach.`;
      } else {
        responseText = "When you're overwhelmed, your brain's stress response can impair executive function. Let's apply the 'cognitive offloading' technique: First, let's write down everything that's on your mind. Studies show that externalizing your thoughts reduces amygdala activation and allows your prefrontal cortex to engage in more effective problem-solving. What specific tasks are causing your stress?";
      }
    } else {
      responseText = "When you're overwhelmed, your brain's stress response can impair executive function. Let's apply the 'cognitive offloading' technique: First, let's write down everything that's on your mind. Studies show that externalizing your thoughts reduces amygdala activation and allows your prefrontal cortex to engage in more effective problem-solving. What specific tasks are causing your stress?";
    }
  } 
  // Handle focus/concentration
  else if (lowerInput.includes("focus") || lowerInput.includes("concentrate") || lowerInput.includes("attention") || lowerInput.includes("distracted")) {
    responseText = "Focus difficulties often stem from dopamine-seeking behavior and prefrontal cortex fatigue. Research shows three effective strategies: 1) Time-blocking with the Pomodoro technique (25 min focus/5 min break), 2) Reducing environmental distractions to minimize attentional shifts, and 3) Pre-committing to tasks with implementation intentions ('When X happens, I will do Y'). Which would you like to explore?";
  }
  // Default response
  else {
    responseText = "I understand. From a neurophysiological perspective, organizing thoughts activates your brain's executive function network. Let's create an action plan aligned with your brain's natural attention cycles. Most people have 2-3 high-focus periods daily (typically mid-morning and late afternoon). Would you like me to help you structure your tasks around these optimal cognitive windows?";
  }
  
  await ctx.reply(responseText);
});

// Set up webhook or polling based on environment
if (process.env.NODE_ENV === 'production') {
  // Webhook for production
  app.post(`/telegram-webhook/${process.env.WEBHOOK_SECRET}`, (req, res) => {
    bot.handleUpdate(req.body);
    res.status(200).json({ success: true });
  });
  
  // Set webhook
  bot.telegram.setWebhook(`${process.env.WEBHOOK_URL}/telegram-webhook/${process.env.WEBHOOK_SECRET}`);
} else {
  // Polling for development
  bot.launch();
  console.log('Bot is running in polling mode');
}

// Express server endpoints
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

export { bot, app };
