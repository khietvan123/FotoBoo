import { Camera, Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white/10 backdrop-blur-md border-t border-white/20 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          {/* Logo */}
          <div className="flex items-center gap-2 text-white">
            <Camera className="w-6 h-6" />
            <span className="text-xl">Fotoboo</span>
          </div>

          {/* Copyright */}
          <div className="text-white/80 text-sm">
            <p className="flex items-center gap-2 flex-wrap justify-center" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              © {currentYear} Fotoboo. All rights reserved.
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                Made with <Heart className="w-4 h-4 fill-current" style={{ color: '#D83F87' }} /> for capturing memories
              </span>
            </p>
          </div>

          {/* Additional Links */}
          <div className="flex items-center gap-4 text-white/60 text-xs" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
