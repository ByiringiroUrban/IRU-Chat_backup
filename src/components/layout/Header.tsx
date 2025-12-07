import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import iruLogo from '@/assets/iruchatlogo.png';
import { isAuthenticated, getUser, logout as logoutUser } from '@/utils/auth';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(isAuthenticated());
      setUser(getUser());
    };
    checkAuth();
    // Listen for storage changes (when user logs in/out in another tab)
    window.addEventListener('storage', checkAuth);
    // Also check on focus
    window.addEventListener('focus', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('focus', checkAuth);
    };
  }, [location]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logoutUser();
    setIsLoggedIn(false);
    setUser(null);
    toast({ title: 'Logged out', description: 'You have been successfully logged out.' });
    navigate('/');
  };

  const navigationLinks = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/features' },
    { name: 'Solutions', path: '/solutions' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/20">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 transition-transform duration-300 hover:scale-105">
          <img src={iruLogo} alt="IRU Chat Logo" className="h-12 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navigationLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors duration-200 hover:text-brand-blue ${isActivePath(link.path)
                ? 'text-brand-blue'
                : 'text-text-secondary hover:text-text'
                }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* CTA Buttons */}
        <div className="hidden lg:flex items-center space-x-4">
          <Link to='/chatbot'>
            <Button variant="ghost" className="w-full justify-start text-text-secondary">
              Chat Now
            </Button>
          </Link>
          {isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              <Button
                variant="ghost"
                className="flex items-center gap-2"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              >
                <User className="w-4 h-4" />
                {user?.name || 'Account'}
                <ChevronDown className="w-4 h-4" />
              </Button>
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-bg-card border border-border rounded-lg shadow-lg z-50">
                  <div className="py-1">
                    <Link
                      to="/account"
                      onClick={() => setShowProfileDropdown(false)}
                      className="block px-4 py-2 text-sm text-text hover:bg-bg-secondary transition-colors flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      My Account
                    </Link>
                    <Link
                      to="/chatbot"
                      onClick={() => {
                        setShowProfileDropdown(false);
                        // Navigate to chatbot and open settings
                        navigate('/chatbot');
                        setTimeout(() => {
                          const event = new CustomEvent('openChatbotSettings');
                          window.dispatchEvent(event);
                        }, 300);
                      }}
                      className="block px-4 py-2 text-sm text-text hover:bg-bg-secondary transition-colors flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <div className="border-t border-border my-1"></div>
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to='/auth'>
              <Button className="w-full btn-hero">
                Get Started
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden p-2 text-text-secondary hover:text-text transition-colors"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden glass border-t border-border/20">
          <nav className="container mx-auto px-4 py-6 space-y-4">
            {navigationLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block py-2 text-sm font-medium transition-colors duration-200 ${isActivePath(link.path)
                  ? 'text-brand-blue'
                  : 'text-text-secondary hover:text-text'
                  }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 space-y-3">
              <Link to='/chatbot' onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-text-secondary">
                  Chat Now
                </Button>
              </Link>
              {isLoggedIn ? (
                <>
                  <Link to='/account' onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start flex items-center gap-2">
                      <User className="w-4 h-4" />
                      My Account
                    </Button>
                  </Link>
                  <Link
                    to="/chatbot"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setTimeout(() => {
                        const event = new CustomEvent('openChatbotSettings');
                        window.dispatchEvent(event);
                      }, 300);
                    }}
                  >
                    <Button variant="ghost" className="w-full justify-start flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Settings
                    </Button>
                  </Link>
                  <Button 
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    variant="outline"
                    className="w-full flex items-center gap-2 border-red-500/50 text-red-500 hover:bg-red-500/10"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <Link to='/auth' onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full btn-hero">
                    Get Started
                  </Button>
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;