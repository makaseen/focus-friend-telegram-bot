
import React from 'react';
import { Button } from "@/components/ui/button";
import { BotIcon, CalendarCheck } from 'lucide-react';

const CTASection = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-focus to-calm">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Focus Better?</h2>
          <p className="mb-8 text-white/90 text-lg">
            Start using Focus Friend today and transform how you manage your ADHD symptoms and daily schedule.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="font-medium">
              <BotIcon className="mr-2 h-5 w-5" />
              Setup Telegram Bot
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
              <CalendarCheck className="mr-2 h-5 w-5" />
              Connect Google Calendar
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
