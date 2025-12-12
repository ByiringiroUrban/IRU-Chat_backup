import React, { useState, useEffect } from 'react';
import { 
  Star, Clock, Settings as SettingsIcon, HelpCircle, LogOut, 
  ChevronRight, ExternalLink, FileText, Flag, Download, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface User {
  id: string;
  fullName: string;
  username?: string;
  email: string;
  profilePicture?: string;
  role?: string;
  plan?: string;
}

interface SettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ isOpen, onClose, isDark }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHelpSubmenu, setShowHelpSubmenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      loadUserProfile();
    }
  }, [isOpen]);

  // Close submenu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const helpContainer = target.closest('.help-menu-container');
      const sidebar = target.closest('[data-settings-sidebar]');
      
      if (showHelpSubmenu && !helpContainer && !sidebar) {
        setShowHelpSubmenu(false);
      }
    };

    if (showHelpSubmenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showHelpSubmenu]);

  const loadUserProfile = async () => {
    try {
      const authData = localStorage.getItem('iru-auth');
      if (!authData) {
        navigate('/auth');
        return;
      }

      const parsed = JSON.parse(authData);
      const token = parsed.token;

      // Try to fetch from backend
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser({
            id: userData.id,
            fullName: userData.fullName || userData.name || 'User',
            username: userData.username || userData.email?.split('@')[0],
            email: userData.email,
            profilePicture: userData.profilePicture,
            role: userData.role || 'user',
            plan: userData.plan || 'Free',
          });
        } else {
          // Fallback to localStorage data
          setUser({
            id: parsed.user?.id || 'user',
            fullName: parsed.user?.name || parsed.user?.fullName || 'User',
            username: parsed.user?.email?.split('@')[0] || 'user',
            email: parsed.user?.email || '',
            profilePicture: parsed.user?.profilePicture,
            role: parsed.user?.role || 'user',
            plan: 'Free',
          });
        }
      } catch (error) {
        // Fallback to localStorage data
        const parsed = JSON.parse(authData);
        setUser({
          id: parsed.user?.id || 'user',
          fullName: parsed.user?.name || parsed.user?.fullName || 'User',
          username: parsed.user?.email?.split('@')[0] || 'user',
          email: parsed.user?.email || '',
          profilePicture: parsed.user?.profilePicture,
          role: parsed.user?.role || 'user',
          plan: 'Free',
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('iru-auth');
    navigate('/auth');
  };

  const getInitials = (name: string) => {
    const words = name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getShortName = (name: string) => {
    if (name.length > 20) {
      return name.substring(0, 17) + '...';
    }
    return name;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={`fixed left-20 top-0 bottom-0 w-80 ${isDark ? 'bg-[#1e293b]' : 'bg-gray-800'} z-50 flex flex-col shadow-2xl overflow-visible`} data-settings-sidebar>
        {/* Header */}
        <div className={`p-6 ${isDark ? 'bg-[#1e293b]' : 'bg-gray-800'} border-b ${isDark ? 'border-gray-700' : 'border-gray-700'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-white'}`}>Settings</h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-700'} transition-colors`}
            >
              <X className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-300'}`} />
            </button>
          </div>

          {/* User Profile Section */}
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-600 animate-pulse" />
              <div className="flex-1">
                <div className="h-4 bg-gray-600 rounded w-24 mb-2 animate-pulse" />
                <div className="h-3 bg-gray-600 rounded w-32 animate-pulse" />
              </div>
            </div>
          ) : user ? (
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                user.profilePicture ? '' : 'bg-gradient-to-br from-pink-500 to-purple-600'
              } overflow-hidden`}>
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt={user.fullName} className="w-full h-full object-cover" />
                ) : (
                  <span>{getInitials(user.fullName)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-white'} truncate`}>
                  {user.fullName}
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-400'} truncate`}>
                  @{user.username || user.email?.split('@')[0]}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto overflow-x-visible py-4">
          <div className="px-4 space-y-1 relative">
            <button
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-700'
              }`}
            >
              <Star className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-300'}`} />
              <span className={`flex-1 text-left ${isDark ? 'text-gray-200' : 'text-gray-200'}`}>Upgrade plan</span>
            </button>

            <button
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-700'
              }`}
            >
              <Clock className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-300'}`} />
              <span className={`flex-1 text-left ${isDark ? 'text-gray-200' : 'text-gray-200'}`}>Personalization</span>
            </button>

            <button
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-700'
              }`}
            >
              <SettingsIcon className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-300'}`} />
              <span className={`flex-1 text-left ${isDark ? 'text-gray-200' : 'text-gray-200'}`}>Settings</span>
            </button>

            {/* Help with Submenu */}
            <div className="relative help-menu-container">
              <button
                onClick={() => setShowHelpSubmenu(!showHelpSubmenu)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  showHelpSubmenu 
                    ? isDark ? 'bg-gray-700' : 'bg-gray-700'
                    : isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-700'
                }`}
              >
                <HelpCircle className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-300'}`} />
                <span className={`flex-1 text-left ${isDark ? 'text-gray-200' : 'text-gray-200'}`}>Help</span>
                <ChevronRight className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-400'} transition-transform ${showHelpSubmenu ? 'rotate-90' : ''}`} />
              </button>

              {/* Help Submenu */}
              {showHelpSubmenu && (
                <div 
                  className={`absolute left-full top-0 ml-2 w-64 ${isDark ? 'bg-[#1e293b]' : 'bg-gray-800'} rounded-lg shadow-2xl border ${isDark ? 'border-gray-700' : 'border-gray-700'} py-2 z-[60] help-menu-container`}
                  style={{ minWidth: '256px' }}
                >
                  <button
                    className={`w-full flex items-center gap-3 px-4 py-2.5 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-700'} transition-colors`}
                  >
                    <HelpCircle className={`w-4 h-4 ${isDark ? 'text-gray-300' : 'text-gray-300'}`} />
                    <span className={`flex-1 text-left text-sm ${isDark ? 'text-gray-200' : 'text-gray-200'}`}>Help center</span>
                    <ExternalLink className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                  </button>
                  <button
                    className={`w-full flex items-center gap-3 px-4 py-2.5 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-700'} transition-colors`}
                  >
                    <FileText className={`w-4 h-4 ${isDark ? 'text-gray-300' : 'text-gray-300'}`} />
                    <span className={`flex-1 text-left text-sm ${isDark ? 'text-gray-200' : 'text-gray-200'}`}>Release notes</span>
                    <ExternalLink className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                  </button>
                  <button
                    className={`w-full flex items-center gap-3 px-4 py-2.5 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-700'} transition-colors`}
                  >
                    <FileText className={`w-4 h-4 ${isDark ? 'text-gray-300' : 'text-gray-300'}`} />
                    <span className={`flex-1 text-left text-sm ${isDark ? 'text-gray-200' : 'text-gray-200'}`}>Terms & policies</span>
                    <ExternalLink className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                  </button>
                  <button
                    className={`w-full flex items-center gap-3 px-4 py-2.5 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-700'} transition-colors`}
                  >
                    <Flag className={`w-4 h-4 ${isDark ? 'text-gray-300' : 'text-gray-300'}`} />
                    <span className={`flex-1 text-left text-sm ${isDark ? 'text-gray-200' : 'text-gray-200'}`}>Report Bug</span>
                    <ExternalLink className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                  </button>
                  <button
                    className={`w-full flex items-center gap-3 px-4 py-2.5 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-700'} transition-colors`}
                  >
                    <Download className={`w-4 h-4 ${isDark ? 'text-gray-300' : 'text-gray-300'}`} />
                    <span className={`flex-1 text-left text-sm ${isDark ? 'text-gray-200' : 'text-gray-200'}`}>Download apps</span>
                    <ExternalLink className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-700'
              }`}
            >
              <LogOut className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-300'}`} />
              <span className={`flex-1 text-left ${isDark ? 'text-gray-200' : 'text-gray-200'}`}>Log out</span>
            </button>
          </div>
        </div>

        {/* Account Status Section */}
        {user && (
          <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-700'} ${isDark ? 'bg-[#1e293b]' : 'bg-gray-800'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                user.profilePicture ? '' : 'bg-gradient-to-br from-pink-500 to-purple-600'
              } overflow-hidden`}>
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt={user.fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm">{getInitials(user.fullName)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium ${isDark ? 'text-white' : 'text-white'} truncate`}>
                  {getShortName(user.fullName)}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>
                  {user.plan || 'Free'}
                </p>
              </div>
              <button
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                Upgrade
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SettingsSidebar;

