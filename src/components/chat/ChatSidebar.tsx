import React from 'react';
import { useTheme } from 'next-themes';
import { 
  CircleDot, MessageSquare, PhoneCall, ContactRound, Radio, History, 
  BarChart3, FileText, Star, Wrench, Settings as SettingsIcon,
  Bell, Lock, BadgeCheck, Shield, EyeOff,
  Camera, UserPlus, CreditCard, Folder,
  Settings, Building2, Megaphone, Sun, Moon
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import iruLogo from '@/assets/iruchatlogo.png';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Workspace',
    items: [
      { id: 'status', label: 'Status', icon: CircleDot },
      { id: 'chats', label: 'Chats', icon: MessageSquare },
      { id: 'calls', label: 'Calls', icon: PhoneCall },
      { id: 'contacts', label: 'Contacts', icon: ContactRound },
      { id: 'live-stream', label: 'Live Stream', icon: Radio },
      { id: 'histories', label: 'Histories', icon: History },
    ]
  },
  {
    title: 'Smart Tools',
    items: [
      { id: 'action-board', label: 'Action Board', icon: BarChart3 },
      { id: 'thread-doc', label: 'Thread → Doc Studio', icon: FileText },
      { id: 'summaries', label: 'Smart Summaries', icon: Star },
      { id: 'automations', label: 'Workflow Automations', icon: Wrench },
      { id: 'command-center', label: 'Command Center', icon: SettingsIcon },
    ]
  },
  {
    title: 'Trust & Safety',
    items: [
      { id: 'dignity-mode', label: 'IRU Dignity Mode', icon: Bell },
      { id: 'consent-controls', label: 'Consent Controls', icon: Lock },
      { id: 'verification', label: 'Identity & Verification', icon: BadgeCheck },
      { id: 'moderation', label: 'Reports & Moderation', icon: Shield },
      { id: 'privacy-center', label: 'Privacy Center', icon: EyeOff },
    ]
  },
  {
    title: 'Creator Tools',
    items: [
      { id: 'live-studio', label: 'Live Studio', icon: Camera },
      { id: 'communities', label: 'Community Builder', icon: UserPlus },
      { id: 'monetization', label: 'Monetization', icon: CreditCard },
      { id: 'content-library', label: 'Content Library', icon: Folder },
      { id: 'creator-analytics', label: 'Creator Analytics', icon: BarChart3 },
    ]
  },
  {
    title: 'Preferences',
    items: [
      { id: 'settings', label: 'Settings', icon: Settings },
    ]
  },
  {
    title: 'Enterprise',
    items: [
      { id: 'enterprise-tools', label: 'Enterprise Tools', icon: Building2 },
    ]
  },
  {
    title: 'Growth',
    items: [
      { id: 'advertise', label: 'Advertise / Marketing', icon: Megaphone },
    ]
  },
];

interface ChatSidebarProps {
  activeNav: string;
  onNavChange: (navId: string) => void;
  userProfile?: {
    name: string;
    avatar?: string;
  };
  isOnline?: boolean;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  activeNav,
  onNavChange,
  isOnline = true,
}) => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  // Theme-aware colors
  const sidebarBg = isDark ? 'bg-[#0a1628]' : 'bg-white';
  const sidebarBorder = isDark ? 'border-[#1e3a5f]' : 'border-gray-200';
  const brandText = isDark ? 'text-white' : 'text-gray-900';
  const brandSubtext = isDark ? 'text-slate-400' : 'text-gray-500';
  const sectionText = isDark ? 'text-slate-500' : 'text-gray-500';
  const navInactiveText = isDark ? 'text-slate-300' : 'text-gray-700';
  const navHoverBg = isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100';
  const navHoverText = isDark ? 'hover:text-white' : 'hover:text-gray-900';
  const activeBg = isDark 
    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20' 
    : 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10';
  const activeText = isDark ? 'text-cyan-400' : 'text-blue-600';
  const activeBorder = isDark ? 'border-cyan-400' : 'border-blue-500';
  const footerBorder = isDark ? 'border-[#1e3a5f]' : 'border-gray-200';
  const footerText = isDark ? 'text-slate-500' : 'text-gray-500';
  const footerKbdBg = isDark ? 'bg-white/10' : 'bg-gray-100';
  const footerKbdText = isDark ? 'text-slate-300' : 'text-gray-700';
  const themeButtonHover = isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100';
  const themeButtonText = isDark ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-900';

  return (
    <aside className={`w-60 flex-shrink-0 flex flex-col h-full ${sidebarBg} border-r ${sidebarBorder}`}>
      {/* Brand Header */}
      <div className={`p-4 border-b ${sidebarBorder}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 transition-all duration-300 ease-out transform hover:scale-110">
            <img 
              src={iruLogo} 
              alt="IRU Chat Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className={`font-semibold text-base ${brandText}`}>
              IRU Chat
            </h1>
            <small className={`text-xs ${brandSubtext}`}>
              /chat • UI skeleton
            </small>
          </div>
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <ScrollArea className="flex-1 overflow-y-auto">
        <nav className="p-2" aria-label="Sidebar">
          {navSections.map((section) => (
            <div key={section.title} className="mb-3">
              <div className={`px-3 py-2 text-[10px] font-semibold uppercase tracking-wider ${sectionText}`}>
                {section.title}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavChange(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-300 ease-out transform hover:scale-[1.02] active:scale-[0.98] ${
                      isActive
                        ? `${activeBg} ${activeText} border-l-2 ${activeBorder}` 
                        : `${navInactiveText} ${navHoverBg} ${navHoverText}`
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? activeText : ''}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className={`p-4 border-t ${footerBorder}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
              isOnline
                ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                : isDark ? 'bg-slate-500/20 text-slate-400' : 'bg-gray-100 text-gray-500'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isOnline ? (isDark ? 'bg-emerald-400' : 'bg-emerald-500') : (isDark ? 'bg-slate-500' : 'bg-gray-400')} ${isOnline ? 'animate-pulse' : ''}`} />
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`p-2 rounded-lg transition-colors ${themeButtonHover} ${themeButtonText}`}
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
        <div className={`text-[11px] ${footerText}`}>
          Tip: <kbd className={`px-1.5 py-0.5 rounded ${footerKbdBg} ${footerKbdText}`}>Ctrl</kbd> + <kbd className={`px-1.5 py-0.5 rounded ${footerKbdBg} ${footerKbdText}`}>K</kbd> for quick search (wireframe).
        </div>
      </div>
    </aside>
  );
};

export default ChatSidebar;
