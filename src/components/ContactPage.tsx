import { Mail, MessageSquare, Send } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { useState } from 'react';
import { toast } from 'sonner';

export function ContactPage() {
  const [result, setResult] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult('Sending...');
    
    // Store form reference before async operations
    const form = e.currentTarget;
    const formData = new FormData(form);
    // Replace this with your actual web3forms access key
    formData.append('access_key', '75fd1140-44b5-4760-9a4f-3a506fbe86a5');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        setResult('Message sent successfully!');
        toast.success('Thank you for your message! We\'ll get back to you soon.');
        form.reset();
      } else {
        console.error('Form submission error:', data);
        setResult('Error submitting form');
        toast.error('Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Network error:', error);
      setResult('Error submitting form');
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setResult(''), 5000);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <MessageSquare className="w-10 h-10 text-white" />
            <h1 className="text-5xl text-white">Contact Us</h1>
          </div>
          <p className="text-xl text-white/90">
            We'd love to hear from you! Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card className="p-8 bg-white/10 backdrop-blur-md border-white/20">
            <h2 className="text-2xl text-white mb-6">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-white mb-2 block font-semibold text-sm" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>Name</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  disabled={isSubmitting}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                  placeholder="Your name"
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-white mb-2 block text-sm font-semibold" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  disabled={isSubmitting}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                  placeholder="your@email.com"
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                />
              </div>

              <div>
                <Label htmlFor="subject" className="text-white mb-2 block text-sm font-semibold" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  required
                  disabled={isSubmitting}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                  placeholder="What's this about?"
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                />
              </div>

              <div>
                <Label htmlFor="message" className="text-white mb-2 block text-sm font-semibold" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  disabled={isSubmitting}
                  rows={5}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/50 resize-none"
                  placeholder="Your message..."
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-white hover:bg-white/90 w-full gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ color: '#44318D' }}
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
              
              {result && (
                <p className="text-center text-white/90 text-sm">
                  {result}
                </p>
              )}
            </form>
          </Card>

          {/* Contact Info */}
          <div className="space-y-6">
            <Card className="p-8 bg-white/10 backdrop-blur-md border-white/20">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/20 rounded-full">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl text-white mb-2">Email</h3>
                  <p className="text-white/80" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>joannephan04@gmail.com</p>
                  <p className="text-white/60 text-sm mt-1" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    We typically respond within 24-48 hours
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-white/10 backdrop-blur-md border-white/20">
              <h3 className="text-xl text-white mb-4">Office Hours</h3>
              <div className="space-y-2 text-white/80" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                <p>Saturday: 10:00 AM - 4:00 PM</p>
                <p>Sunday: Closed</p>
                <p className="text-white/60 text-sm mt-4">
                  All times are in EST (Eastern Standard Time)
                </p>
              </div>
            </Card>

            <Card className="p-8 bg-white/10 backdrop-blur-md border-white/20">
              <h3 className="text-xl text-white mb-4">Quick Links</h3>
              <div className="space-y-2 text-white/80" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                <p>• Check our FAQ page for quick answers</p>
                <p>• Follow us on social media for updates</p>
                <p>• Report bugs or suggest features</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
