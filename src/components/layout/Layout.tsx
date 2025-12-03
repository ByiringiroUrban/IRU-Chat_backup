import { ReactNode, useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import FloatingButtons from './FloatingButtons';
import ChatbotSidebar from '@/components/chatbot/ChatbotSidebar';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  useEffect(() => {
    // Listen for custom event to open chatbot with feature
    const handleOpenChatbot = () => {
      setIsChatbotOpen(true);
    };

    window.addEventListener('openChatbotWithFeature', handleOpenChatbot);

    return () => {
      window.removeEventListener('openChatbotWithFeature', handleOpenChatbot);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        {children}
      </main>
      <Footer />
      <FloatingButtons onOpenChatbot={() => setIsChatbotOpen(true)} />
      <ChatbotSidebar isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
    </div>
  );
};

export default Layout;