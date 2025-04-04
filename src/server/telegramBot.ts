
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

// Debug middleware to log all updates - place BEFORE command handlers
bot.use((ctx, next) => {
  const user = ctx.from?.username || ctx.from?.id || 'unknown';
  console.log(`[${new Date().toISOString()}] Received ${ctx.updateType} from ${user}`);
  return next();
});

// Bot welcome message
bot.start(async (ctx) => {
  try {
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
    console.log("Start message sent successfully");
  } catch (error) {
    console.error("Error in start handler:", error);
  }
});

// Help command
bot.help((ctx) => {
  try {
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
  } catch (error) {
    console.error("Error in help handler:", error);
  }
});

// Handle calendar connection
bot.command('connect_calendar', async (ctx) => {
  try {
    const userId = ctx.from?.id;
    if (!userId) return;
    
    console.log(`User ${userId} requested calendar connection`);
    await handleCalendarCommand(ctx, userId, calendarManager, sessionManager.getAllSessions());
  } catch (error) {
    console.error("Error in connect_calendar handler:", error);
  }
});

// Handle schedule command
bot.command('schedule', async (ctx) => {
  try {
    const userId = ctx.from?.id;
    if (!userId) return;
    
    console.log(`User ${userId} requested schedule`);
    await handleScheduleCommand(ctx, userId, calendarManager, sessionManager.getAllSessions());
  } catch (error) {
    console.error("Error in schedule handler:", error);
  }
});

// Handle next event command
bot.command('next', async (ctx) => {
  try {
    const userId = ctx.from?.id;
    if (!userId) return;
    
    console.log(`User ${userId} requested next event`);
    await handleNextEventCommand(ctx, userId, calendarManager, sessionManager.getAllSessions());
  } catch (error) {
    console.error("Error in next event handler:", error);
  }
});

// Focus techniques command
bot.command('focus', async (ctx) => {
  try {
    console.log(`User ${ctx.from?.id} requested focus techniques`);
    await handleFocusCommand(ctx);
  } catch (error) {
    console.error("Error in focus handler:", error);
  }
});

// Break suggestion command
bot.command('break', async (ctx) => {
  try {
    console.log(`User ${ctx.from?.id} requested break suggestion`);
    await handleBreakCommand(ctx);
  } catch (error) {
    console.error("Error in break handler:", error);
  }
});

// Procrastination help command
bot.command('procrastination', async (ctx) => {
  try {
    console.log(`User ${ctx.from?.id} requested procrastination help`);
    await handleProcrastinationCommand(ctx);
  } catch (error) {
    console.error("Error in procrastination handler:", error);
  }
});

// Add simple text command for testing
bot.hears('ping', (ctx) => {
  console.log('Received ping command');
  ctx.reply('pong');
});

// Add debug command
bot.command('debug', async (ctx) => {
  try {
    const botInfo = await bot.telegram.getMe();
    await ctx.reply(`Bot info: ${JSON.stringify(botInfo, null, 2)}`);
    console.log('Debug info sent');
  } catch (error) {
    console.error('Error in debug command:', error);
    await ctx.reply('Error fetching bot info');
  }
});

// Handle text messages using MessageHandler
bot.on(message('text'), async (ctx) => {
  try {
    const userId = ctx.from?.id;
    const messageText = ctx.message.text;
    
    if (!userId || !messageText) return;
    
    console.log(`User ${userId} sent message: ${messageText}`);
    await messageHandler.handleTextMessage(ctx, userId, messageText);
  } catch (error) {
    console.error("Error in message handler:", error);
  }
});

// Function to start the bot
const startBot = async () => {
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
    
    try {
      await bot.telegram.setWebhook(webhookUrl);
      console.log('Webhook set successfully');
      
      // Verify the webhook is set correctly
      const info = await bot.telegram.getWebhookInfo();
      console.log('Webhook info:', info);
    } catch (error) {
      console.error('Failed to set webhook:', error);
      throw new Error('Failed to set webhook');
    }
  } else {
    // Polling mode (development)
    console.log('Starting bot in polling mode...');
    
    try {
      // Make sure we're not using webhooks
      await bot.telegram.deleteWebhook({ drop_pending_updates: true });
      console.log('Webhook deleted successfully');
      
      // Launch the bot in polling mode
      await bot.launch();
      console.log('Bot is running successfully in polling mode');
    } catch (error) {
      console.error('Failed to start bot in polling mode:', error);
      throw new Error('Failed to start bot in polling mode');
    }
  }
};

// Express server endpoints

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// New endpoint to check environment variables
app.get('/env-check', (req, res) => {
  // Create a safe copy of config with sensitive data masked
  const safeConfig = {
    telegramToken: config.telegramToken ? 
      `${config.telegramToken.slice(0, 5)}...${config.telegramToken.slice(-5)}` : 'Not set',
    webhookUrl: config.webhookUrl || 'Not set',
    webhookSecret: config.webhookSecret ? '********' : 'Not set',
    port: config.port,
    apiBaseUrl: config.apiBaseUrl || 'Not set',
    environment: config.environment,
    useWebhook: config.useWebhook,
    dotEnvLoaded: process.env.TELEGRAM_BOT_TOKEN ? 'Yes' : 'No',
    nodeEnv: process.env.NODE_ENV || 'Not set'
  };
  
  res.status(200).json({
    message: 'Environment variables check',
    config: safeConfig,
    loadedFrom: '.env file status',
    processEnvKeys: Object.keys(process.env).filter(key => 
      !key.includes('SECRET') && 
      !key.includes('TOKEN') && 
      !key.includes('PASSWORD'))
  });
});

// Start the server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT}/env-check to verify environment variables`);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

export { bot, app, startBot };
