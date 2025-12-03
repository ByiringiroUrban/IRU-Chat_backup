import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquare, ArrowUp } from 'lucide-react';

interface FloatingButtonsProps {
  onOpenChatbot: () => void;
}

const FloatingButtons = ({ onOpenChatbot }: FloatingButtonsProps) => {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Don't show chatbot button on support or chatbot pages
  const isSupportPage = location.pathname === '/support' || location.pathname === '/chatbot';

  return (
    <>
      {/* Chatbot Button */}
      {!isSupportPage && (
        <button
          onClick={onOpenChatbot}
          className="fixed bottom-24 right-4 md:right-6 z-50 group"
          aria-label="Open Chatbot"
        >
          <div className="relative">
            {/* Pulsing glow effect */}
            <div className="absolute inset-0 bg-brand-blue rounded-full animate-ping opacity-20" style={{ animationDuration: '2s' }}></div>
            <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-brand-blue to-brand-cyan flex items-center justify-center shadow-lg shadow-brand-blue/50 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-brand-blue/70 group-hover:rotate-3">
              <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-white transition-transform duration-300 group-hover:scale-110" />
            </div>
            {/* Tooltip */}
            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="bg-bg-card text-text px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg border border-border">
                Customer Support
              </div>
              <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-bg-card"></div>
            </div>
          </div>
        </button>
      )}

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 md:bottom-6 right-4 md:right-6 z-50 w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-brand-blue to-brand-cyan flex items-center justify-center shadow-lg shadow-brand-blue/50 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-brand-blue/70 animate-scale-in"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5 md:w-6 md:h-6 text-white transition-transform duration-300 hover:translate-y-[-2px]" />
        </button>
      )}
    </>
  );
};

export default FloatingButtons;

