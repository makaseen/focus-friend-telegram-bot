
import { startBot } from './telegramBot';
import { config } from './config';

console.log('---------------------------------------');
console.log('🚀 Starting Focus Friend Telegram Bot...');
console.log(`🌍 Environment: ${config.environment}`);
console.log(`🔄 Mode: ${config.useWebhook ? 'Webhook' : 'Polling'}`);
console.log(`🔑 Bot Token: ${config.telegramToken ? (config.telegramToken.slice(0, 5) + '...' + config.telegramToken.slice(-5)) : '✗ Missing'}`);
console.log(`🔌 Port: ${config.port}`);
console.log('---------------------------------------');

// Don't start the bot automatically in development when imported as a module
// This prevents multiple instances when hot reloading
const isMainModule = require.main === module;

if (isMainModule) {
  // The actual bot starting logic is now handled in telegramBot.ts
  console.log('✅ start.ts is the main module - server startup is handled in telegramBot.ts');
  console.log('---------------------------------------');
}
