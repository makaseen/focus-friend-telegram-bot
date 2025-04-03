
import React, { useState, useRef, useEffect } from 'react';
import { BotMessage, UserMessage } from './ChatBubble';
import { BrainIcon } from './ChatIcons';

type Message = {
  text: string;
  isBot: boolean;
};

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hi there! I'm your Focus Friend bot. How can I help you today?", isBot: true },
  ]);
  const [userInput, setUserInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to the bottom when new messages appear
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (userInput.trim() === "") return;
    
    // Add user message
    const newUserMessage = { text: userInput, isBot: false };
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput("");
    
    // Simulate bot thinking
    setTimeout(() => {
      let botResponse = { text: "", isBot: true };
      
      // Enhanced pattern matching for demo purposes
      const lowerInput = userInput.toLowerCase();
      
      // Calendar-specific responses
      if (lowerInput.includes("calendar") || lowerInput.includes("schedule") || lowerInput.includes("check my google calendar")) {
        botResponse.text = "I can help you manage your calendar. Would you like me to check your schedule?";
      }
      // Handle stress/overwhelm
      else if (lowerInput.includes("overwhelm") || lowerInput.includes("stress")) {
        botResponse.text = "Let's look at your schedule and break things down. I see you have 3 main tasks today. Let's prioritize them:\n\n1. Meeting at 2pm (high priority)\n2. Project deadline at 5pm (high priority)\n3. Email responses (medium priority)";
      } 
      // Handle anxiety/worry
      else if (lowerInput.includes("worry") || lowerInput.includes("anxious") || lowerInput.includes("project")) {
        botResponse.text = "Let's create a step-by-step plan. Would you like to use the Pomodoro technique to tackle it?";
      } 
      // Handle greetings
      else if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
        botResponse.text = "Hello! How can I assist you with your focus and productivity today?";
      } 
      // Handle help requests
      else if (lowerInput.includes("help") || lowerInput.includes("can you")) {
        botResponse.text = "I can help you manage your schedule, break down tasks, provide motivation, and suggest focus techniques. What specific challenge are you facing today?";
      } 
      // Default response
      else {
        botResponse.text = "I understand. Let me help you organize your thoughts and create an action plan. Would you like to start by breaking down your tasks or setting up some focus time?";
      }
      
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  return (
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
            {messages.map((msg, index) => (
              msg.isBot ? (
                <BotMessage key={index} message={msg.text} />
              ) : (
                <UserMessage key={index} message={msg.text} />
              )
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="border-t p-3">
            <div className="flex rounded-full border bg-background px-3 py-2 text-sm items-center">
              <input
                className="flex-1 bg-transparent outline-none"
                placeholder="Type a message..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyPress}
              />
              <button 
                className="ml-2 rounded-full bg-focus p-1.5"
                onClick={handleSendMessage}
                aria-label="Send message"
              >
                <SendIcon className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
