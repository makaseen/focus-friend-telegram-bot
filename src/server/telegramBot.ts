
import { Telegraf, Context } from 'telegraf';
import { message } from 'telegraf/filters';
import express from 'express';
import cors from 'cors';

import { config, validateConfig } from './config';
import { sessionManager } from './sessionManager';
import { TelegramCalendarManager } from './telegramCalendarManager';
import { MessageHandler } from './handlers/messageHandler';
import { handleCalendarCommand, handleNextEventCommand, handleScheduleCommand } from './commands/calendarCommands';
import { handleFocusCommand, handleBreakCommand, handleProcrastinationCommand } from './commands/focusCommands';

// Validate critical configuration
if (!validateConfig()) {
  console.error('Critical configuration missing. Check your .env file.');
  process.exit(1);
}

// Initialize the bot with token from config
const bot = new Telegraf(config.telegramToken);
const calendarManager = new TelegramCalendarManager();
const messageHandler = new MessageHandler(calendarManager);

// Set up Express server
const app = express();
app.use(cors());
app.use(express.json());

// Debug middleware to log all updates
bot.use((ctx, next) => {
  console.log(`[${new Date().toISOString()}] Received update from ${ctx.from?.username || ctx.from?.id || 'unknown'}:`, 
    ctx.updateType);
  return next();
});

// Bot welcome message
bot.start(async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;
  
  console.log(`User ${userId} started the bot`);
  
  // Initialize user session
  sessionManager.createSession(userId);
  
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
  console.log(`User ${ctx.from?.id} requested help`);
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
  
  console.log(`User ${userId} requested calendar connection`);
  await handleCalendarCommand(ctx, userId, calendarManager, sessionManager.getAllSessions());
});

// Handle schedule command
bot.command('schedule', async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;
  
  console.log(`User ${userId} requested schedule`);
  await handleScheduleCommand(ctx, userId, calendarManager, sessionManager.getAllSessions());
});

// Handle next event command
bot.command('next', async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;
  
  console.log(`User ${userId} requested next event`);
  await handleNextEventCommand(ctx, userId, calendarManager, sessionManager.getAllSessions());
});

// Focus techniques command
bot.command('focus', async (ctx) => {
  console.log(`User ${ctx.from?.id} requested focus techniques`);
  await handleFocusCommand(ctx);
});

// Break suggestion command
bot.command('break', async (ctx) => {
  console.log(`User ${ctx.from?.id} requested break suggestion`);
  await handleBreakCommand(ctx);
});

// Procrastination help command
bot.command('procrastination', async (ctx) => {
  console.log(`User ${ctx.from?.id} requested procrastination help`);
  await handleProcrastinationCommand(ctx);
});

// Handle text messages using MessageHandler
bot.on(message('text'), async (ctx) => {
  const userId = ctx.from?.id;
  const messageText = ctx.message.text;
  
  if (!userId || !messageText) return;
  
  console.log(`User ${userId} sent message: ${messageText}`);
  await messageHandler.handleTextMessage(ctx, userId, messageText);
});

// Set up webhook or polling based on configuration
if (config.useWebhook) {
  // Webhook mode
  const webhookPath = `/telegram-webhook/${config.webhookSecret}`;
  
  app.post(webhookPath, (req, res) => {
    console.log('Received webhook request:', JSON.stringify(req.body, null, 2));
    bot.handleUpdate(req.body);
    res.status(200).json({ success: true });
  });
  
  // Set webhook
  const webhookUrl = `${config.webhookUrl}${webhookPath}`;
  console.log(`Setting webhook URL to: ${webhookUrl}`);
  
  bot.telegram.setWebhook(webhookUrl)
    .then(() => {
      console.log('Webhook set successfully');
      // Verify the webhook is set correctly
      return bot.telegram.getWebhookInfo();
    })
    .then((info) => {
      console.log('Webhook info:', info);
    })
    .catch((error) => {
      console.error('Failed to set webhook:', error);
      console.log('Attempting to launch in polling mode as fallback...');
      return bot.launch().catch(e => {
        console.error('Failed to launch in polling mode:', e);
        process.exit(1);
      });
    });
} else {
  // Polling mode (development)
  console.log('Starting bot in polling mode...');
  
  // Make sure we're not using webhooks
  bot.telegram.deleteWebhook()
    .then(() => {
      console.log('Webhook deleted successfully');
      return bot.launch();
    })
    .then(() => {
      console.log('Bot is running successfully in polling mode');
    })
    .catch((error) => {
      console.error('Failed to start bot in polling mode:', error);
      process.exit(1);
    });
}

// Express server endpoints
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start the server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

export { bot, app };
