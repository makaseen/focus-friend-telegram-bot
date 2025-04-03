
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bot, Code, ArrowRight } from 'lucide-react';

const SetupGuideSection = () => {
  return (
    <section className="py-16" id="setup">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold">Set Up Your Bot</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Follow these instructions to set up your ADHD mentor bot on Telegram and connect your Google Calendar.
          </p>
        </div>
        
        <Card className="mx-auto max-w-3xl">
          <CardContent className="p-6">
            <Tabs defaultValue="user" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="user">
                  <Bot className="h-4 w-4 mr-2" />
                  For Users
                </TabsTrigger>
                <TabsTrigger value="developer">
                  <Code className="h-4 w-4 mr-2" />
                  For Developers
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="user" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-focus text-white text-xs mr-2">1</span>
                    Find the bot on Telegram
                  </h3>
                  <p className="text-muted-foreground pl-8">
                    Open Telegram and search for <span className="font-mono bg-slate-100 px-1 rounded">@focus_friend_bot</span> or click the button below.
                  </p>
                  <div className="pl-8">
                    <Button className="bg-focus hover:bg-focus-dark">
                      Open in Telegram
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-focus text-white text-xs mr-2">2</span>
                    Start the bot
                  </h3>
                  <p className="text-muted-foreground pl-8">
                    Start a conversation with the bot by clicking the "Start" button or typing <span className="font-mono bg-slate-100 px-1 rounded">/start</span>.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-focus text-white text-xs mr-2">3</span>
                    Connect Google Calendar
                  </h3>
                  <p className="text-muted-foreground pl-8">
                    Type <span className="font-mono bg-slate-100 px-1 rounded">/connect_calendar</span> in the chat and follow the authentication steps to connect your Google Calendar.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="developer" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Configure Your Own Instance</h3>
                  <p className="text-muted-foreground">
                    Developers can configure their own instance of the Focus Friend bot using the Telegram Bot API and our GitHub repository.
                  </p>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bot-token">Telegram Bot Token</Label>
                    <Input id="bot-token" placeholder="Enter your Telegram bot token" />
                    <p className="text-xs text-muted-foreground">
                      Create a new bot and get a token from <a href="https://t.me/BotFather" className="text-focus hover:underline" target="_blank" rel="noopener noreferrer">BotFather</a>
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="webhook-url">Webhook URL</Label>
                    <Input id="webhook-url" placeholder="https://your-server.com/webhook" />
                    <p className="text-xs text-muted-foreground">
                      The URL where Telegram will send updates to your bot
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="google-credentials">Google API Credentials</Label>
                    <Input id="google-credentials" type="file" />
                    <p className="text-xs text-muted-foreground">
                      OAuth 2.0 credentials from <a href="https://console.cloud.google.com/" className="text-focus hover:underline" target="_blank" rel="noopener noreferrer">Google Cloud Console</a>
                    </p>
                  </div>
                  
                  <Button className="w-full">
                    Download Configuration Guide
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default SetupGuideSection;
