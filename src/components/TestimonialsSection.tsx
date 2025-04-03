
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Quote as QuoteIcon } from 'lucide-react';

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

export default TestimonialsSection;
