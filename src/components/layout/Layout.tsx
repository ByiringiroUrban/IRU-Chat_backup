import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import FloatingButtons from './FloatingButtons';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();

  const handleOpenChat = () => {
    navigate('/chat');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        {children}
      </main>
      <Footer />
      <FloatingButtons onOpenChatbot={handleOpenChat} />
    </div>
  );
};

export default Layout;