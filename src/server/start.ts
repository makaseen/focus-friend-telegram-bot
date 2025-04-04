
import { bot, app, startBot } from './telegramBot';
import { config } from './config';

console.log('---------------------------------------');
console.log('Starting Focus Friend Telegram Bot...');
console.log(`Environment: ${config.environment}`);
console.log(`Mode: ${config.useWebhook ? 'Webhook' : 'Polling'}`);
console.log(`Bot Token: ${config.telegramToken ? (config.telegramToken.slice(0, 5) + '...' + config.telegramToken.slice(-5)) : '✗ Missing'}`);
console.log(`Port: ${config.port}`);
console.log('---------------------------------------');

// Start the bot
startBot()
  .then(() => {
    console.log('Bot started successfully!');
    console.log('---------------------------------------');
  })
  .catch((error) => {
    console.error('Failed to start bot:', error);
    process.exit(1);
  });

// Force Telegraf to handle the update
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
