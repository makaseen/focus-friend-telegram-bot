
import React from 'react';
import { BotIcon } from 'lucide-react';

type BotMessageProps = {
  message: string;
};

export const BotMessage = ({ message }: BotMessageProps) => (
  <div className="flex items-start">
    <div className="h-8 w-8 rounded-full bg-focus flex items-center justify-center">
      <BotIcon className="h-5 w-5 text-white" />
    </div>
    <div className="ml-2 max-w-[80%] rounded-tr-lg rounded-br-lg rounded-bl-lg bg-slate-100 p-3">
      <p className="text-sm whitespace-pre-line">{message}</p>
    </div>
  </div>
);

export const UserMessage = ({ message }: BotMessageProps) => (
  <div className="flex items-start justify-end">
    <div className="mr-2 max-w-[80%] rounded-tl-lg rounded-tr-lg rounded-bl-lg bg-focus p-3">
      <p className="text-sm text-white">{message}</p>
    </div>
    <div className="h-8 w-8 rounded-full bg-slate-300"></div>
  </div>
);
