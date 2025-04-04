
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  telegramToken: process.env.TELEGRAM_BOT_TOKEN || '',
  webhookUrl: process.env.WEBHOOK_URL || '',
  webhookSecret: process.env.WEBHOOK_SECRET || '',
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3001,
  apiBaseUrl: process.env.API_BASE_URL || '',
  environment: process.env.NODE_ENV || 'development',
  // Default to polling mode unless explicitly set to use webhook
  useWebhook: process.env.USE_WEBHOOK === 'true',
};

// Validate critical configuration
export const validateConfig = (): boolean => {
  let isValid = true;
  
  if (!config.telegramToken) {
    console.error('ERROR: TELEGRAM_BOT_TOKEN is missing in environment variables');
    isValid = false;
  } else {
    console.log('Token appears to be set correctly:', 
      config.telegramToken.substring(0, 5) + '...' + 
      config.telegramToken.substring(config.telegramToken.length - 5));
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
  
  return isValid;
};
