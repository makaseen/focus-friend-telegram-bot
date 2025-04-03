
import React from 'react';
import { Calendar, Clock, BrainCircuit, ListChecks, Bell, Sparkles } from 'lucide-react';

const features = [
  {
    icon: <BrainCircuit className="h-8 w-8 text-focus" />,
    title: "ADHD Management",
    description: "Get personalized strategies and tips to manage ADHD symptoms and improve focus."
  },
  {
    icon: <Calendar className="h-8 w-8 text-focus" />,
    title: "Calendar Integration",
    description: "Connect your Google Calendar for schedule reviews and better time management."
  },
  {
    icon: <ListChecks className="h-8 w-8 text-focus" />,
    title: "Task Breakdown",
    description: "Break down overwhelming tasks into manageable steps with guided support."
  },
  {
    icon: <Bell className="h-8 w-8 text-focus" />,
    title: "Smart Reminders",
    description: "Get timely reminders that understand the ADHD brain and how to motivate action."
  },
  {
    icon: <Clock className="h-8 w-8 text-focus" />,
    title: "Time Perception Aids",
    description: "Tools to improve time awareness and combat time blindness with gentle nudges."
  },
  {
    icon: <Sparkles className="h-8 w-8 text-focus" />,
    title: "Motivation Boosters",
    description: "Receive motivation when you need it most, using techniques crafted for ADHD brains."
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-12 bg-slate-50" id="features">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold">How Focus Friend Helps You</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Designed specifically for ADHD challenges, our Telegram bot provides the support you need to stay on track.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
