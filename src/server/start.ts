
import { bot, app } from './telegramBot';
import { config } from './config';

console.log('---------------------------------------');
console.log('Starting Focus Friend Telegram Bot...');
console.log(`Environment: ${config.environment}`);
console.log(`Mode: ${config.useWebhook ? 'Webhook' : 'Polling'}`);
console.log(`Bot Token: ${config.telegramToken ? '✓ Set' : '✗ Missing'}`);
console.log(`Port: ${config.port}`);
console.log('---------------------------------------');

// Force Telegraf to handle the update
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

console.log('Bot startup completed. Ready to handle messages.');
console.log('---------------------------------------');
