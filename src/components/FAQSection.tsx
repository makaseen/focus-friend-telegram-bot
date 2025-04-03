
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does Focus Friend help with ADHD?",
    answer: "Focus Friend provides personalized recommendations, schedule management, task breakdown, and timely reminders specifically designed for ADHD brains. It helps with time awareness, task prioritization, and maintaining focus through evidence-based strategies."
  },
  {
    question: "Is my Google Calendar data secure?",
    answer: "Yes. Focus Friend only reads your calendar data to provide recommendations and reminders. We don't store your calendar events on our servers, and all data transmission is encrypted. You can revoke access to your calendar at any time."
  },
  {
    question: "Do I need to pay for Focus Friend?",
    answer: "Focus Friend offers a free tier with basic functionality. Premium features like advanced scheduling analysis, personalized strategy development, and unlimited daily check-ins are available with a subscription."
  },
  {
    question: "Can I use Focus Friend without connecting Google Calendar?",
    answer: "Yes, you can use Focus Friend's ADHD management features without connecting your calendar. However, connecting your calendar enables schedule reviews and time management features for a more complete experience."
  },
  {
    question: "How do I disconnect the bot from my Google Calendar?",
    answer: "You can disconnect your Google Calendar by typing /disconnect_calendar in your Telegram chat with Focus Friend. You can also revoke access through your Google Account security settings."
  },
  {
    question: "Can Focus Friend help with medication reminders?",
    answer: "Yes, Focus Friend can send you medication reminders. Simply set up your medication schedule with the bot using the /medication command and specify when you need to be reminded."
  }
];

const FAQSection = () => {
  return (
    <section className="py-16 bg-white" id="faq">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Have questions about Focus Friend? Find answers to common questions below.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
