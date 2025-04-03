
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { QuoteIcon } from 'lucide-react';

const testimonials = [
  {
    quote: "Focus Friend has been a game-changer for my ADHD management. The timely reminders and schedule breakdowns help me stay on track without feeling overwhelmed.",
    name: "Alex Johnson",
    role: "Web Developer",
    avatar: "AJ"
  },
  {
    quote: "The calendar integration is fantastic! I no longer miss appointments, and the bot helps me prepare for meetings with plenty of time to spare.",
    name: "Sam Rodriguez",
    role: "Marketing Manager",
    avatar: "SR"
  },
  {
    quote: "As someone who struggles with time blindness, having a bot that gently nudges me about upcoming events has made my work life so much more manageable.",
    name: "Taylor Chen",
    role: "Graphic Designer",
    avatar: "TC"
  }
];

const TestimonialsSection = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-white to-slate-50" id="testimonials">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">What Our Users Say</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Hear from people who have improved their focus and productivity with Focus Friend.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="h-full">
              <CardContent className="p-6 flex flex-col h-full">
                <QuoteIcon className="h-8 w-8 text-focus/20 mb-4" />
                <p className="flex-grow text-muted-foreground italic mb-6">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center">
                  <Avatar>
                    <AvatarFallback className="bg-focus/10 text-focus">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

const QuoteIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
  </svg>
);

export default TestimonialsSection;
