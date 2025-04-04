
import React from 'react';
import { Button } from "@/components/ui/button";
import { BotIcon, CalendarCheck, BrainCircuit, ArrowRight } from 'lucide-react';

const steps = [
  {
    number: "01",
    icon: <BotIcon className="h-6 w-6 text-white" />,
    title: "Set Up Your Bot",
    description: "Add Focus Friend to Telegram and complete a quick ADHD assessment to personalize your experience."
  },
  {
    number: "02",
    icon: <CalendarCheck className="h-6 w-6 text-white" />,
    title: "Connect Your Calendar",
    description: "Link your Google Calendar so Focus Friend can review your schedule and help with time management."
  },
  {
    number: "03",
    icon: <BrainCircuit className="h-6 w-6 text-white" />,
    title: "Get Daily Support",
    description: "Receive personalized recommendations, schedule reviews, and focused support throughout your day."
  }
];

const HowItWorksSection = () => {
  const handleGetStarted = () => {
    // Scroll to setup section when button is clicked
    const setupSection = document.getElementById('setup');
    if (setupSection) {
      setupSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 bg-white" id="how-it-works">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">How It Works</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Getting started with Focus Friend is easy. Follow these simple steps to have your ADHD mentor ready to support you.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-full w-full h-[2px] bg-gradient-to-r from-focus to-transparent -translate-x-8">
                  <ArrowRight className="absolute right-0 top-1/2 h-4 w-4 text-focus -translate-y-1/2" />
                </div>
              )}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <div className="absolute -top-2 -right-2 bg-white text-focus text-xs font-bold px-1 rounded">
                    {step.number}
                  </div>
                  <div className="w-16 h-16 rounded-full bg-focus flex items-center justify-center">
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-xl font-medium">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Button 
            className="bg-focus hover:bg-focus-dark" 
            size="lg"
            onClick={handleGetStarted}
          >
            Get Started with Focus Friend
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
