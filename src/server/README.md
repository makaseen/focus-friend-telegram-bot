
# Focus Friend Telegram Bot

This is the backend server for the Focus Friend Telegram bot, which provides science-backed advice on focus, productivity, and time management based on neurophysiology research.

## Features

- **Calendar Integration**: Connects with user's Google Calendar to provide schedule awareness
- **Focus Techniques**: Offers evidence-based strategies for improving concentration
- **Break Suggestions**: Provides scientifically-optimized break activities
- **Procrastination Help**: Offers strategies based on the neuroscience of motivation
- **Personalized Scheduling**: Helps users optimize their day around their brain's natural rhythms

## Setup Instructions

1. **Create a Telegram Bot**:
   - Message @BotFather on Telegram
   - Use the `/newbot` command and follow prompts to create your bot
   - Save the bot token provided by BotFather

2. **Set Up Google OAuth**:
   - Create a project in Google Cloud Console
   - Enable Google Calendar API
   - Create OAuth credentials
   - Set up authorized redirect URIs

3. **Environment Variables**:
   - Copy `.env.example` to `.env`
   - Fill in all required environment variables

4. **Running the Bot**:
   - For development: `npm run dev`
   - For production: `npm start`

5. **Webhook Setup (Production)**:
   - Ensure your server has HTTPS
   - Set the WEBHOOK_URL in .env to your server's domain
   - The bot will automatically register the webhook on startup

## Commands

- `/start` - Initialize the bot
- `/help` - Show available commands
- `/connect_calendar` - Connect Google Calendar
- `/schedule` - See today's events
- `/next` - See your next upcoming event
- `/focus` - Get focus techniques
- `/break` - Get break suggestions
- `/procrastination` - Get help with procrastination

## Architecture

The bot uses a modular architecture with:
- Main bot logic in `telegramBot.ts`
- Calendar integration in `telegramCalendarManager.ts`
- Command handlers in the `commands` directory

## Deployment

For production deployment, set up:
- A server with HTTPS support
- Proper environment variables
- Process management (PM2 recommended)
- Monitoring and logging

## License

MIT
