import { useState } from 'react';
import { HomePage } from './components/HomePage';
import { PhotoBooth } from './components/PhotoBooth';
import { CustomPhotoStrip } from './components/CustomPhotoStrip';
import { AnimatedBackground } from './components/AnimatedBackground';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { AboutPage } from './components/AboutPage';
import { FAQPage } from './components/FAQPage';
import { ContactPage } from './components/ContactPage';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'booth' | 'custom' | 'about' | 'faq' | 'contact'>('home');

  const handleNavigate = (page: string) => {
    setCurrentView(page as typeof currentView);
  };

  // Don't show navigation and footer when in booth or custom mode
  const showNavigationAndFooter = !['booth', 'custom'].includes(currentView);

  return (
    <div className="min-h-screen relative flex flex-col" style={{ background: 'linear-gradient(to bottom right, #A4B3B6, #E98074, #D83F87, #44318D)' }}>
      <AnimatedBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        {showNavigationAndFooter && (
          <Navigation currentPage={currentView} onNavigate={handleNavigate} />
        )}
        
        <div className="flex-1">
          {currentView === 'home' ? (
            <HomePage 
              onStartBooth={() => setCurrentView('booth')}
              onStartCustom={() => setCurrentView('custom')}
            />
          ) : currentView === 'booth' ? (
            <PhotoBooth onBackHome={() => setCurrentView('home')} />
          ) : currentView === 'custom' ? (
            <CustomPhotoStrip onBackHome={() => setCurrentView('home')} />
          ) : currentView === 'about' ? (
            <AboutPage />
          ) : currentView === 'faq' ? (
            <FAQPage />
          ) : (
            <ContactPage />
          )}
        </div>

        {showNavigationAndFooter && <Footer />}
      </div>
    </div>
  );
}
