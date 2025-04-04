import React, { useState, useRef, useEffect } from 'react';
import { BotMessage, UserMessage } from './ChatBubble';
import { BrainIcon, SendIcon } from './ChatIcons';
import { useCalendar } from "@/hooks/useCalendarContext";
import { formatDistance } from 'date-fns';
import { toast } from "@/hooks/use-toast";

type Message = {
  text: string;
  isBot: boolean;
};

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! I'm your Focus Friend, a time management expert and neurophysiology specialist. I can help you optimize your focus, manage your schedule effectively, and provide science-backed strategies for better concentration. How can I assist you today?", isBot: true },
  ]);
  const [userInput, setUserInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { calendarConnected, events, refreshEvents } = useCalendar();
  
  // Auto-scroll to the bottom when new messages appear
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Refresh calendar events when component mounts if calendar is connected
  useEffect(() => {
    const loadEvents = async () => {
      if (calendarConnected) {
        console.log("Chat interface: Calendar connected, refreshing events");
        try {
          await refreshEvents();
        } catch (err) {
          console.error("Error refreshing events in chat interface:", err);
        }
      } else {
        console.log("Chat interface: Calendar not connected, skipping event refresh");
      }
    };
    
    loadEvents();
  }, [calendarConnected, refreshEvents]);

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Format calendar events for display in chat
  const formatEvents = (eventsList: any[]) => {
    if (!eventsList || eventsList.length === 0) {
      return "You don't have any upcoming events scheduled.";
    }

    return eventsList.slice(0, 3).map((event, index) => {
      const start = event.start.dateTime ? new Date(event.start.dateTime) : new Date(event.start.date);
      const timeUntil = formatDistance(start, new Date(), { addSuffix: true });
      
      return `${index + 1}. ${event.summary} - ${start.toLocaleDateString()} ${
        event.start.dateTime 
          ? `at ${start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
          : 'All day'
      } (${timeUntil})`;
    }).join('\n');
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
      if (lowerInput.includes("calendar") || lowerInput.includes("schedule") || lowerInput.includes("events") || lowerInput.includes("appointment")) {
        if (!calendarConnected) {
          botResponse.text = "I'd love to help with your calendar, but you haven't connected your Google Calendar yet. Based on neurophysiology research, external scheduling systems reduce cognitive load and free up mental resources. Would you like to connect your calendar now?";
        } else if (events.length === 0) {
          botResponse.text = "Your Google Calendar is connected, but I don't see any upcoming events. Studies show that having a clear schedule can reduce anxiety, but it's also important to structure your time intentionally to maintain focus. Would you like some tips on effective time blocking?";
          // Trigger a refresh to make sure we have the latest events
          refreshEvents();
        } else {
          botResponse.text = `Here are your upcoming events:\n\n${formatEvents(events)}\n\nBased on your schedule, I can help you implement optimal focus periods between these commitments. The brain's prefrontal cortex functions best when we alternate between 90-minute focus sessions and short breaks. Which event would you like to prepare for?`;
        }
      }
      // Handle what's next or today's schedule
      else if (lowerInput.includes("what's next") || lowerInput.includes("whats next") || lowerInput.includes("next event") || 
               lowerInput.includes("today") || lowerInput.includes("upcoming")) {
        if (!calendarConnected) {
          botResponse.text = "I'd need access to your calendar to tell you what's coming up next. Research shows that externalizing your schedule reduces the cognitive load on your working memory. Would you like to connect your Google Calendar?";
        } else if (events.length === 0) {
          botResponse.text = "I don't see any upcoming events in your calendar. This is an excellent opportunity to engage in deep work. The brain needs approximately 23 minutes to reach a flow state after interruptions - would you like me to help you schedule an optimal focus session?";
        } else {
          const nextEvent = events[0];
          const start = nextEvent.start.dateTime ? new Date(nextEvent.start.dateTime) : new Date(nextEvent.start.date);
          const timeUntil = formatDistance(start, new Date(), { addSuffix: true });
          
          botResponse.text = `Your next event is "${nextEvent.summary}" ${timeUntil} (${start.toLocaleDateString()} ${
            nextEvent.start.dateTime 
              ? `at ${start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
              : 'All day'
          }).\n\nTo prepare optimally, I recommend a focus session now, followed by a 10-minute transition period before the event. This aligns with research on context-switching, which shows that planned transitions reduce cognitive strain.`;
          
          if (events.length > 1) {
            botResponse.text += "\n\nWould you like to see more of your upcoming events and plan your focus blocks?";
          }
        }
      }
      // Handle stress/overwhelm
      else if (lowerInput.includes("overwhelm") || lowerInput.includes("stress")) {
        if (calendarConnected && events.length > 0) {
          botResponse.text = `I understand you're feeling overwhelmed. This activates your amygdala and can impair prefrontal cortex function. Let's examine your schedule strategically:\n\n${formatEvents(events)}\n\nNeurophysiology research suggests breaking these down into smaller tasks can reduce cognitive load and cortisol levels. Which event causes the most stress? We can create a structured approach.`;
        } else {
          botResponse.text = "When you're overwhelmed, your brain's stress response can impair executive function. Let's apply the 'cognitive offloading' technique: First, let's write down everything that's on your mind. Studies show that externalizing your thoughts reduces amygdala activation and allows your prefrontal cortex to engage in more effective problem-solving. What specific tasks are causing your stress?";
        }
      } 
      // Handle focus/concentration
      else if (lowerInput.includes("focus") || lowerInput.includes("concentrate") || lowerInput.includes("attention") || lowerInput.includes("distracted")) {
        botResponse.text = "Focus difficulties often stem from dopamine-seeking behavior and prefrontal cortex fatigue. Research shows three effective strategies: 1) Time-blocking with the Pomodoro technique (25 min focus/5 min break), 2) Reducing environmental distractions to minimize attentional shifts, and 3) Pre-committing to tasks with implementation intentions ('When X happens, I will do Y'). Which would you like to explore?";
      }
      // Handle anxiety/worry
      else if (lowerInput.includes("worry") || lowerInput.includes("anxious") || lowerInput.includes("project") || lowerInput.includes("deadline")) {
        botResponse.text = "Anxiety about deadlines activates your brain's threat detection system. Neurophysiology research shows that breaking projects into smaller components reduces cognitive load and anxiety. I recommend the 'next physical action' approach: identify the very next tangible step you can take. This shifts brain activity from the amygdala (threat) to the prefrontal cortex (planning). What's the project you're working on?";
      } 
      // Handle procrastination
      else if (lowerInput.includes("procrastinate") || lowerInput.includes("putting off") || lowerInput.includes("can't start")) {
        botResponse.text = "Procrastination often stems from the brain's limbic system overriding the prefrontal cortex. Recent studies show that the '2-minute rule' can be effective - commit to just 2 minutes of work to overcome initial resistance. This engages your dopamine reward system and can trigger task continuation. The other approach is 'temptation bundling' - pairing something you enjoy with the task you're avoiding. Would you like to try one of these methods?";
      }
      // Handle telegram bot
      else if (lowerInput.includes("telegram") || lowerInput.includes("bot")) {
        botResponse.text = "I'm currently running as a web demo. The Telegram bot integration is coming soon! For now, I can help you optimize your brain's executive function and time management directly through this interface. Based on neurophysiology research, having consistent check-ins with an accountability system increases prefrontal cortex activation and goal attainment by 33%.";
      }
      // Handle greetings
      else if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
        botResponse.text = "Hello! As a time management and neurophysiology expert, I'm here to help optimize your focus and productivity. Your brain's prefrontal cortex manages executive functions like planning and attention, while your circadian rhythm affects your energy levels throughout the day. How can I help you leverage your brain's natural patterns today?";
      } 
      // Handle help requests
      else if (lowerInput.includes("help") || lowerInput.includes("can you")) {
        botResponse.text = "I can help you with evidence-based strategies for time management and concentration. This includes circadian rhythm optimization, attention management techniques, strategic planning based on cognitive load theory, and personalized focus routines. Research shows that working with your brain's natural cycles can increase productivity by up to 40%. What specific challenge would you like to address?";
      } 
      // Default response
      else {
        botResponse.text = "I understand. From a neurophysiological perspective, organizing thoughts activates your brain's executive function network. Let's create an action plan aligned with your brain's natural attention cycles. Most people have 2-3 high-focus periods daily (typically mid-morning and late afternoon). Would you like me to help you structure your tasks around these optimal cognitive windows?";
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
              <p className="text-xs text-muted-foreground">Neuroscience Expert</p>
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
