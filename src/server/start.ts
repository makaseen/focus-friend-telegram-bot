
import { startBot, startServer } from './telegramBot.js';
import { config } from './config.js';

console.log('---------------------------------------');
console.log('🚀 Starting Focus Friend Telegram Bot...');
console.log(`🌍 Environment: ${config.environment}`);
console.log(`🔄 Mode: ${config.useWebhook ? 'Webhook' : 'Polling'}`);
console.log(`🔑 Bot Token: ${config.telegramToken ? (config.telegramToken.slice(0, 5) + '...' + config.telegramToken.slice(-5)) : '✗ Missing'}`);
console.log(`🔌 Port: ${config.port}`);
console.log('---------------------------------------');

// Use import.meta.url to check if this is the main module in ESM
const isMainModule = import.meta.url.endsWith(process.argv[1]);

if (isMainModule) {
  console.log('✅ Starting Telegram bot server...');
  
  const server = startServer();
  
  if (server) {
    startBot()
      .then((success) => {
        if (success) {
          console.log('🎉 Server and bot started successfully!');
        } else {
          console.error('❌ Bot failed to start, but server is running.');
        }
      })
      .catch((error) => {
        console.error('❌ Error during bot startup:', error);
      });
  }
}
