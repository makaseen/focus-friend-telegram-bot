
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  telegramToken: process.env.TELEGRAM_BOT_TOKEN || '',
  webhookUrl: process.env.WEBHOOK_URL || '',
  webhookSecret: process.env.WEBHOOK_SECRET || '',
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3001,
  apiBaseUrl: process.env.API_BASE_URL || '',
  stagingUrl: process.env.STAGING_URL || '', // New config for staging/development HTTPS URL
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
  
  return isValid;
};
