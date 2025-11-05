import { Mail, MessageSquare, Send } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { useState } from 'react';

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This is a mock submission - in a real app, you'd send this to a backend
    alert('Thank you for your message! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
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
                <Label htmlFor="name" className="text-white mb-2 block">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                  placeholder="Your name"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-white mb-2 block">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <Label htmlFor="subject" className="text-white mb-2 block">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                  placeholder="What's this about?"
                />
              </div>

              <div>
                <Label htmlFor="message" className="text-white mb-2 block">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/50 resize-none"
                  placeholder="Your message..."
                />
              </div>

              <Button
                type="submit"
                className="bg-white hover:bg-white/90 w-full gap-2"
                style={{ color: '#44318D' }}
              >
                <Send className="w-4 h-4" />
                Send Message
              </Button>
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
                  <p className="text-white/80">joannephan04@gmail.com</p>
                  <p className="text-white/60 text-sm mt-1">
                    We typically respond within 24-48 hours - Or sooner! OR WHEN I WAKE UP LMAO-
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-white/10 backdrop-blur-md border-white/20">
              <h3 className="text-xl text-white mb-4">Office Hours</h3>
              <div className="space-y-2 text-white/80">
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
              <div className="space-y-2 text-white/80">
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
