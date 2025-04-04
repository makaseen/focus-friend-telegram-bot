import { Context } from 'telegraf';
import { formatDistance } from 'date-fns';
import { TelegramCalendarManager } from '../telegramCalendarManager';
import { UserSession } from '../sessionManager';
import { config } from '../config';

export async function handleCalendarCommand(
  ctx: Context, 
  userId: number, 
  calendarManager: TelegramCalendarManager,
  userSessions: Record<number, UserSession>
) {
  if (calendarManager.isCalendarConnected(userId)) {
    await ctx.reply("Your Google Calendar is already connected! Here are some commands you can use:\n\n/schedule - See today's events\n/next - See your next upcoming event");
    return;
  }
  
  try {
    const authUrl = calendarManager.getAuthUrl(userId);
    
    // Validate URL before sending it
    if (!authUrl.startsWith('http')) {
      console.error(`Invalid URL generated: ${authUrl}`);
      await ctx.reply("Sorry, I couldn't generate a valid authentication URL. Please try again later or contact support.");
      return;
    }
    
    await ctx.reply(
      "To connect your Google Calendar, please click the link below and follow the authentication process. This will allow me to access your calendar events and provide you with personalized scheduling assistance.\n\n" +
      "Based on neuroscience research, externalizing your schedule reduces cognitive load and improves executive function.",
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Connect Google Calendar", url: authUrl }]
          ]
        }
      }
    );
    
    if (userSessions[userId]) {
      userSessions[userId].state = 'awaiting_calendar_auth';
    }
  } catch (error) {
    console.error(`Error generating auth URL for user ${userId}:`, error);
    await ctx.reply("Sorry, I encountered an error while setting up Google Calendar authentication. Please try again later.");
  }
}

export async function handleScheduleCommand(
  ctx: Context, 
  userId: number, 
  calendarManager: TelegramCalendarManager,
  userSessions: Record<number, UserSession>
) {
  if (!calendarManager.isCalendarConnected(userId)) {
    await ctx.reply(
      "You haven't connected your Google Calendar yet. To see your schedule, I'll need access to your calendar.\n\n" +
      "Use /connect_calendar to get started."
    );
    return;
  }
  
  await ctx.reply("Fetching your schedule...");
  
  const events = await calendarManager.getEventsForUser(userId);
  
  if (!events || events.length === 0) {
    await ctx.reply(
      "You don't have any upcoming events scheduled. This is a perfect opportunity to schedule some focused work time.\n\n" +
      "Would you like me to suggest an optimal focus schedule based on neuroscience research?"
    );
    return;
  }
  
  const formattedEvents = events.map((event, index) => {
    const start = event.start.dateTime ? new Date(event.start.dateTime) : new Date(event.start.date);
    const timeUntil = formatDistance(start, new Date(), { addSuffix: true });
    
    return `${index + 1}. ${event.summary} - ${start.toLocaleDateString()} ${
      event.start.dateTime 
        ? `at ${start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
        : 'All day'
    } (${timeUntil})`;
  }).join('\n');
  
  await ctx.reply(
    `Here's your schedule:\n\n${formattedEvents}\n\n` +
    "Neurophysiology research suggests that planning buffer time between events can reduce stress and improve cognitive performance. Try to have at least 15 minutes between meetings to allow your brain to context-switch effectively."
  );
}

export async function handleNextEventCommand(
  ctx: Context, 
  userId: number, 
  calendarManager: TelegramCalendarManager,
  userSessions: Record<number, UserSession>
) {
  if (!calendarManager.isCalendarConnected(userId)) {
    await ctx.reply(
      "You haven't connected your Google Calendar yet. To see your next event, I'll need access to your calendar.\n\n" +
      "Use /connect_calendar to get started."
    );
    return;
  }
  
  await ctx.reply("Checking your next event...");
  
  const events = await calendarManager.getEventsForUser(userId);
  
  if (!events || events.length === 0) {
    await ctx.reply(
      "You don't have any upcoming events scheduled. This is a perfect opportunity to engage in deep work.\n\n" +
      "Research shows that uninterrupted blocks of 90-120 minutes allow your brain to reach optimal flow states. Would you like some tips on how to make the most of this time?"
    );
    return;
  }
  
  const nextEvent = events[0];
  const start = nextEvent.start.dateTime ? new Date(nextEvent.start.dateTime) : new Date(nextEvent.start.date);
  const timeUntil = formatDistance(start, new Date(), { addSuffix: true });
  
  await ctx.reply(
    `Your next event is "${nextEvent.summary}" ${timeUntil} (${start.toLocaleDateString()} ${
      nextEvent.start.dateTime 
        ? `at ${start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
        : 'All day'
    }).\n\n` +
    "To prepare optimally, I recommend a focus session now, followed by a 10-minute transition period before the event. This aligns with research on context-switching, which shows that planned transitions reduce cognitive strain."
  );
}
