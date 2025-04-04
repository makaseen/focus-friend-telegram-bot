
import { bot, app } from './telegramBot';
import { config } from './config';

console.log('Starting Focus Friend Telegram Bot...');
console.log(`Environment: ${config.environment}`);
console.log(`Port: ${config.port}`);

// This file is only used when starting the server directly (not through telegramBot.ts)
// It ensures all exports and setup from telegramBot.ts are properly initialized
