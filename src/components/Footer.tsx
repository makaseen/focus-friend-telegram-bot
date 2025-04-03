
import React from 'react';
import { BrainCog } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BrainCog className="h-6 w-6 text-focus-light" />
              <h2 className="text-xl font-bold text-white">Focus Friend</h2>
            </div>
            <p className="text-slate-400">
              Your ADHD mentor in Telegram. Helping you stay focused, manage time, and achieve your goals.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-white mb-4">Features</h3>
            <ul className="space-y-2">
              <li><a href="#features" className="hover:text-focus-light transition-colors">ADHD Management</a></li>
              <li><a href="#features" className="hover:text-focus-light transition-colors">Calendar Integration</a></li>
              <li><a href="#features" className="hover:text-focus-light transition-colors">Task Breakdown</a></li>
              <li><a href="#features" className="hover:text-focus-light transition-colors">Smart Reminders</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-white mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-focus-light transition-colors">Blog</a></li>
              <li><a href="#how-it-works" className="hover:text-focus-light transition-colors">How It Works</a></li>
              <li><a href="#faq" className="hover:text-focus-light transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-focus-light transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-white mb-4">Contact</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-focus-light transition-colors">Support</a></li>
              <li><a href="#" className="hover:text-focus-light transition-colors">Feedback</a></li>
              <li><a href="#" className="hover:text-focus-light transition-colors">Telegram Community</a></li>
              <li><a href="#" className="hover:text-focus-light transition-colors">Email Us</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} Focus Friend. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-slate-400 hover:text-focus-light transition-colors">
              <TwitterIcon className="h-5 w-5" />
            </a>
            <a href="#" className="text-slate-400 hover:text-focus-light transition-colors">
              <GithubIcon className="h-5 w-5" />
            </a>
            <a href="#" className="text-slate-400 hover:text-focus-light transition-colors">
              <TelegramIcon className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const GithubIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
);

export default Footer;
