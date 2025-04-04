
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Determine the directory name for the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find the root directory (where the .env file should be)
const rootDir = path.resolve(__dirname, '../../');
const envPath = path.resolve(rootDir, '.env');

// Check if .env file exists and log information
console.log(`Looking for .env file at: ${envPath}`);
if (fs.existsSync(envPath)) {
  console.log('.env file found, loading environment variables');
} else {
  console.log('.env file not found, will rely on process.env values');
}

// Load environment variables with path to ensure we find the .env file
const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error('Error loading .env file:', result.error);
} else {
  console.log('Environment variables loaded successfully from dotenv');
}

export const config = {
  telegramToken: process.env.TELEGRAM_BOT_TOKEN || '',
  webhookUrl: process.env.WEBHOOK_URL || '',
  webhookSecret: process.env.WEBHOOK_SECRET || '',
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3001,
  apiBaseUrl: process.env.API_BASE_URL || '',
  stagingUrl: process.env.STAGING_URL || 'https://guiding-resolved-mite.ngrok-free.app', // Default to your ngrok URL
  environment: process.env.NODE_ENV || 'development',
  // Default to polling mode unless explicitly set to use webhook
  useWebhook: process.env.USE_WEBHOOK === 'true',
  // Google Calendar API credentials
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
};

// Validate critical configuration
export const validateConfig = (): boolean => {
  let isValid = true;
  
  if (!config.telegramToken) {
    console.error('ERROR: TELEGRAM_BOT_TOKEN is missing in environment variables');
    isValid = false;
  } else if (config.telegramToken.indexOf(':') === -1) {
    console.error('ERROR: TELEGRAM_BOT_TOKEN appears to be invalid (missing colon separator)');
    console.error('Token format should be: <numbers>:<alphanumeric string>');
    isValid = false;
  } else {
    const tokenPreview = config.telegramToken.slice(0, 5) + '...' + config.telegramToken.slice(-5);
    console.log(`Token appears to be set: ${tokenPreview}`);
    console.log(`Token length: ${config.telegramToken.length}`);
    
    // More detailed token validation
    const [botId, botToken] = config.telegramToken.split(':');
    if (!botId || !botToken) {
      console.error('ERROR: Token parts could not be separated');
      isValid = false;
    } else {
      console.log(`Token parts: ID=${botId} (${botId.length} chars), Token=${botToken.slice(0, 3)}... (${botToken.length} chars)`);
      if (!/^\d+$/.test(botId)) {
        console.error('ERROR: Bot ID part is not numeric');
        isValid = false;
      }
      if (botToken.length < 30) {
        console.error('WARNING: Bot token part seems too short');
      }
    }
  }
  
  // Only validate webhook config if we're using webhooks
  if (config.useWebhook) {
    if (!config.webhookUrl) {
      console.error('ERROR: WEBHOOK_URL is missing in environment variables');
      isValid = false;
    }
    
    if (!config.webhookSecret) {
      console.error('ERROR: WEBHOOK_SECRET is missing in environment variables');
      isValid = false;
    }
  }

  // Validate Google Calendar API configuration
  if (!config.googleClientId) {
    console.error('WARNING: GOOGLE_CLIENT_ID is missing in environment variables');
    console.error('Calendar functionality will not work correctly');
  }

  if (!config.googleClientSecret) {
    console.error('WARNING: GOOGLE_CLIENT_SECRET is missing in environment variables');
    console.error('Calendar functionality will not work correctly');
  }
  
  return isValid;
};
