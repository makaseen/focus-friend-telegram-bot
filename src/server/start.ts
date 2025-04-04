
import { startBot, startServer } from './telegramBot';
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
  console.log('✅ Starting Telegram bot server...');
  
  // First start the server
  const server = startServer();
  
  // Then start the bot if server was initialized properly
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

