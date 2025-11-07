import { Camera, Heart, Users, Sparkles } from 'lucide-react';
import { Card } from './ui/card';

export function AboutPage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl text-white mb-6">About Fotoboo</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Bringing people together, one photo strip at a time
          </p>
        </div>

        {/* Story Section */}
        <Card className="p-8 bg-white/10 backdrop-blur-md border-white/20 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Camera className="w-8 h-8 text-white" />
            <h2 className="text-3xl text-white">Our Story</h2>
          </div>
          <p className="text-white/90 mb-4 leading-relaxed font-semibold" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            Fotoboo was created with a simple mission: to bring back the joy and nostalgia of classic photo booth experiences in a modern, accessible way. We believe that the best memories are captured spontaneously, and there's something magical about a classic photo strip that digital photos just can't replicate.
          </p>
          <p className="text-white/90 leading-relaxed font-semibold" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            Whether you're at a party, hanging out with friends, or celebrating a special moment, Fotoboo makes it easy to create and share these timeless keepsakes.
          </p>
        </Card>

        {/* Values */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-4 bg-white/20 rounded-full">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl text-white">Passion</h3>
              <p className="text-white/80 text-m leading-relaxed font-semibold" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                We're passionate about preserving memories and making photo experiences fun and accessible for everyone
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-4 bg-white/20 rounded-full">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl text-white">Community</h3>
              <p className="text-white/80 text-m leading-relaxed font-semibold" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                Built by people who love photo booths, for people who want to create unforgettable moments together
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-4 bg-white/20 rounded-full">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl text-white">Innovation</h3>
              <p className="text-white/80 text-m leading-relaxed font-semibold" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                Combining classic photo booth nostalgia with modern technology for the best of both worlds
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
