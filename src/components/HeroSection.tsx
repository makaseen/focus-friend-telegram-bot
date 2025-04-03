
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { BotIcon, CalendarIcon } from 'lucide-react';
import { Modal } from "@/components/ui/modal";
import { toast } from "@/hooks/use-toast";

const HeroSection = () => {
  const [showBotModal, setShowBotModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleGetStarted = () => {
    console.log("Get Started button clicked");
    setShowBotModal(true);
  };

  const handleConnectCalendar = () => {
    console.log("Connect Google Calendar button clicked");
    setShowCalendarModal(true);
  };

  const initiateCalendarConnection = () => {
    console.log("Calendar connection initiated");
    setIsConnecting(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setIsConnecting(false);
      setShowCalendarModal(false);
      toast({
        title: "Calendar Connected",
        description: "Your Google Calendar has been successfully connected.",
      });
    }, 2000);
  };

  return (
    <section className="py-12 md:py-24 lg:py-32 overflow-hidden">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="flex flex-col justify-center space-y-4">
            <div className="inline-block rounded-lg bg-focus/10 px-3 py-1 text-sm text-focus mb-2">
              Introducing Focus Friend
            </div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Your ADHD Mentor in Telegram
            </h1>
            <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              A personal bot that helps you manage ADHD, stay on track with your schedule, 
              and provides timely recommendations tailored just for you.
            </p>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button 
                className="bg-focus hover:bg-focus-dark" 
                size="lg"
                onClick={handleGetStarted}
              >
                <BotIcon className="mr-2 h-4 w-4" />
                Get Started
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleConnectCalendar}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                Connect Google Calendar
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative h-[400px] w-[320px] rounded-xl bg-gradient-to-b from-focus to-calm p-1 shadow-xl">
              <div className="absolute inset-0 rounded-xl bg-white p-2">
                <div className="flex h-full flex-col rounded-lg bg-slate-50">
                  <div className="flex items-center border-b p-3">
                    <div className="h-8 w-8 rounded-full bg-focus flex items-center justify-center">
                      <BrainIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">Focus Friend</p>
                      <p className="text-xs text-muted-foreground">Active now</p>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <BotMessage message="Hi there! I'm your Focus Friend bot. How can I help you today?" />
                    <UserMessage message="I'm feeling overwhelmed with my tasks today" />
                    <BotMessage message="Let's look at your schedule and break things down. I see you have 3 main tasks today. Let's prioritize them:" />
                    <BotMessage message="1. Meeting at 2pm (high priority)
2. Project deadline at 5pm (high priority)
3. Email responses (medium priority)" />
                    <UserMessage message="I'm worried about the project deadline" />
                    <BotMessage message="Let's create a step-by-step plan. Would you like to use the Pomodoro technique to tackle it?" />
                  </div>
                  <div className="border-t p-3">
                    <div className="flex rounded-full border bg-background px-3 py-2 text-sm items-center">
                      <input
                        className="flex-1 bg-transparent outline-none"
                        placeholder="Type a message..."
                      />
                      <button className="ml-2 rounded-full bg-focus p-1.5">
                        <SendIcon className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showBotModal}
        onClose={() => setShowBotModal(false)}
        title="Setup Telegram Bot"
      >
        <p>To set up your Focus Friend bot on Telegram:</p>
        <ol className="list-decimal pl-5 mt-2 space-y-2 mb-4">
          <li>Open Telegram app on your device</li>
          <li>Search for @FocusFriendBot in the search bar</li>
          <li>Start a conversation with the bot by clicking "Start"</li>
          <li>Follow the setup instructions provided by the bot</li>
        </ol>
      </Modal>

      <Modal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        title="Connect Google Calendar"
      >
        <p>To connect your Google Calendar:</p>
        <ol className="list-decimal pl-5 mt-2 space-y-2 mb-4">
          <li>We'll need access to your Google Calendar</li>
          <li>Your events will sync with Focus Friend</li>
          <li>You'll receive timely reminders and schedule assistance</li>
          <li>Your data is kept private and secure</li>
        </ol>
        <Button 
          className="w-full mt-4 bg-focus hover:bg-focus-dark"
          onClick={initiateCalendarConnection}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              Connecting...
            </>
          ) : (
            <>
              <CalendarIcon className="mr-2 h-4 w-4" />
              Connect Calendar
            </>
          )}
        </Button>
      </Modal>
    </section>
  );
};

const BotMessage = ({ message }: { message: string }) => (
  <div className="flex items-start">
    <div className="h-8 w-8 rounded-full bg-focus flex items-center justify-center">
      <BotIcon className="h-5 w-5 text-white" />
    </div>
    <div className="ml-2 max-w-[80%] rounded-tr-lg rounded-br-lg rounded-bl-lg bg-slate-100 p-3">
      <p className="text-sm">{message}</p>
    </div>
  </div>
);

const UserMessage = ({ message }: { message: string }) => (
  <div className="flex items-start justify-end">
    <div className="mr-2 max-w-[80%] rounded-tl-lg rounded-tr-lg rounded-bl-lg bg-focus p-3">
      <p className="text-sm text-white">{message}</p>
    </div>
    <div className="h-8 w-8 rounded-full bg-slate-300"></div>
  </div>
);

const BrainIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 4.5a2.5 2.5 0 0 0-4.96-.46 2.5 2.5 0 0 0-1.98 3 2.5 2.5 0 0 0-1.32 4.24 3 3 0 0 0 .34 5.58 2.5 2.5 0 0 0 2.96 3.08A2.5 2.5 0 0 0 12 19.5a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 12 4.5" />
    <path d="m15.7 10.4-.9.4" />
    <path d="m9.2 13.2.9-.4" />
    <path d="m12.8 7.7-.4.9" />
    <path d="m11.6 15.4.4-.9" />
    <path d="M12 8v8" />
    <path d="M8 12h8" />
  </svg>
);

const SendIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
);

export default HeroSection;
