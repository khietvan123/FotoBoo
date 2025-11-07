import { HelpCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import { Card } from './ui/card';

export function FAQPage() {
  const faqs = [
    {
      question: 'How does Fotoboo work?',
      answer: 'Fotoboo uses your device\'s camera to capture 4 photos with a 10-second countdown between each shot. After capturing, you can select your favorite photos and arrange them in a classic photo strip layout with white borders. Finally, download your photo strip with the Fotoboo watermark!'
    },
    {
      question: 'Do I need to create an account?',
      answer: 'No! Fotoboo is completely free to use and doesn\'t require any account creation. Just visit the website and start creating photo strips immediately.'
    },
    {
      question: 'Can I use my own photos?',
      answer: 'Yes! In addition to the camera booth feature, we also offer a "Upload Your Photos" option where you can upload your own images and create custom photo strips.'
    },
    {
      question: 'What devices are supported?',
      answer: 'Fotoboo works on any device with a camera and a modern web browser - including desktops, laptops, tablets, and smartphones.'
    },
    {
      question: 'How do I download my photo strip?',
      answer: 'After selecting and arranging your 4 favorite photos, simply click the "Download Photo Strip" button. Your photo strip will be saved as a high-quality image file to your device.'
    },
    {
      question: 'Can I remove the Fotoboo watermark?',
      answer: 'The watermark is part of the free service and helps us share Fotoboo with more people. We appreciate you keeping it on your photo strips!'
    },
    {
      question: 'Is my privacy protected?',
      answer: 'Absolutely! All photos are processed locally in your browser. We don\'t store, upload, or have access to any of your photos. Everything stays on your device.'
    },
    {
      question: 'Can I share my photo strips on social media?',
      answer: 'Yes! Once you download your photo strip, you can share it anywhere you like - Instagram, Facebook, Twitter, or send it directly to friends.'
    },
    {
      question: 'How many photos can I capture?',
      answer: 'Each session captures 4 photos with a countdown timer. You can create as many photo strips as you want by starting new sessions!'
    },
    {
      question: 'What if my camera doesn\'t work?',
      answer: 'Make sure you\'ve granted camera permissions when prompted by your browser. If issues persist, try refreshing the page or using a different browser. You can also use the "Upload Your Photos" feature as an alternative.'
    },
  ];

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <HelpCircle className="w-10 h-10 text-white" />
            <h1 className="text-5xl text-white">FAQ</h1>
          </div>
          <p className="text-xl text-white/90">
            Common questions about Fotoboo
          </p>
        </div>

        {/* FAQ Accordion */}
        <Card className="p-8 bg-white/10 backdrop-blur-md border-white/20" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-white/20">
                <AccordionTrigger className="text-white hover:text-white/80 text-left font-semibold text-lg" >
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-white/80">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>

        {/* Still Have Questions */}
        <div className="text-center mt-12">
          <p className="text-white/90 text-lg">
            Still have questions? Feel free to reach out to us through our Contact page!
          </p>
        </div>
      </div>
    </div>
  );
}
