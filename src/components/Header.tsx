
import React from 'react';
import { Button } from "@/components/ui/button";
import { BrainCog, Calendar, Bot } from 'lucide-react';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-sm border-b bg-background/80">
      <div className="container flex justify-between items-center py-4">
        <div className="flex items-center gap-2">
          <BrainCog className="h-6 w-6 text-focus" />
          <h1 className="text-xl font-bold">Focus Friend</h1>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="hidden sm:inline-flex">
            <Calendar className="h-4 w-4 mr-2" />
            Connect Calendar
          </Button>
          <Button size="sm">
            <Bot className="h-4 w-4 mr-2" />
            Setup Bot
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
