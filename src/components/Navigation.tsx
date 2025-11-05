import { Camera, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from './ui/sheet';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const links = [
    { name: 'Homepage', page: 'home' },
    { name: 'About Us', page: 'about' },
    { name: 'FAQ', page: 'faq' },
    { name: 'Contact', page: 'contact' },
  ];

  const handleNavigation = (page: string) => {
    onNavigate(page);
    setIsOpen(false);
  };

  return (
    <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => handleNavigation('home')}
            className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity"
          >
            <Camera className="w-8 h-8" />
            <span className="text-2xl" style={{ fontFamily: 'Pacifico, cursive' }}>Fotoboo</span>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <button
                key={link.page}
                onClick={() => handleNavigation(link.page)}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  currentPage === link.page
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.name}
              </button>
            ))}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Menu className="w-6 h-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-[#44318D]/95 backdrop-blur-md border-white/20 w-64">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SheetDescription className="sr-only">
                Navigate through different pages of Fotoboo
              </SheetDescription>
              <div className="flex flex-col gap-4 mt-8">
                {links.map((link) => (
                  <button
                    key={link.page}
                    onClick={() => handleNavigation(link.page)}
                    className={`px-4 py-3 rounded-lg transition-colors text-left ${
                      currentPage === link.page
                        ? 'bg-white/20 text-white'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {link.name}
                  </button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
