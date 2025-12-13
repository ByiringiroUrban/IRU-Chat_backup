import React from 'react';
import { useTheme } from 'next-themes';
import { 
  Clock, MessageSquare, Phone, Users, Video, History, 
  ClipboardCheck, FileText, Sparkles, Zap, Command,
  Heart, Lock, BadgeCheck, Shield, EyeOff,
  Camera, UserPlus, CreditCard, Folder, BarChart3,
  Settings, Building2, Megaphone, Sun, Moon, User
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Workspace',
    items: [
      { id: 'status', label: 'Status', icon: Clock },
      { id: 'chats', label: 'Chats', icon: MessageSquare },
      { id: 'calls', label: 'Calls', icon: Phone },
      { id: 'contacts', label: 'Contacts', icon: Users },
      { id: 'live-stream', label: 'Live Stream', icon: Video },
      { id: 'histories', label: 'Histories', icon: History },
    ]
  },
  {
    title: 'Smart Tools',
    items: [
      { id: 'action-board', label: 'Action Board', icon: ClipboardCheck },
      { id: 'thread-doc', label: 'Thread → Doc Studio', icon: FileText },
      { id: 'summaries', label: 'Smart Summaries', icon: Sparkles },
      { id: 'automations', label: 'Workflow Automations', icon: Zap },
      { id: 'command-center', label: 'Command Center', icon: Command },
    ]
  },
  {
    title: 'Trust & Safety',
    items: [
      { id: 'dignity-mode', label: 'Dignity Mode', icon: Heart },
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
  userProfile,
  isOnline = true,
}) => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <aside className={`w-64 flex-shrink-0 flex flex-col border-r ${
      isDark ? 'bg-sidebar border-sidebar-border' : 'bg-white border-border'
    }`}>
      {/* Brand Header */}
      <div className={`p-4 border-b ${isDark ? 'border-sidebar-border' : 'border-border'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
            isDark ? 'bg-primary text-primary-foreground' : 'bg-primary text-primary-foreground'
          }`}>
            IRU
          </div>
          <div>
            <h1 className={`font-semibold text-base ${isDark ? 'text-sidebar-foreground' : 'text-foreground'}`}>
              IRU Chat
            </h1>
            <small className={`text-xs ${isDark ? 'text-sidebar-foreground/60' : 'text-muted-foreground'}`}>
              /chat • UI skeleton
            </small>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="p-2" aria-label="Sidebar">
          {navSections.map((section) => (
            <div key={section.title} className="mb-4">
              <div className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider ${
                isDark ? 'text-sidebar-foreground/50' : 'text-muted-foreground'
              }`}>
                {section.title}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavChange(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? isDark 
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                          : 'bg-accent text-accent-foreground'
                        : isDark
                          ? 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                          : 'text-foreground/80 hover:bg-accent/50 hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className={`p-4 border-t ${isDark ? 'border-sidebar-border' : 'border-border'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
              isOnline
                ? isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                : isDark ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-600'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`} />
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-sidebar-accent' : 'hover:bg-accent'
            }`}
            title="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-sidebar-foreground/80" />
            ) : (
              <Moon className="w-4 h-4 text-foreground/80" />
            )}
          </button>
        </div>
        <div className={`h-px mb-3 ${isDark ? 'bg-sidebar-border' : 'bg-border'}`} />
        <div className={`text-xs ${isDark ? 'text-sidebar-foreground/50' : 'text-muted-foreground'}`}>
          Tip: <kbd className={`px-1.5 py-0.5 rounded text-xs ${
            isDark ? 'bg-sidebar-accent text-sidebar-foreground' : 'bg-muted text-muted-foreground'
          }`}>Ctrl</kbd> + <kbd className={`px-1.5 py-0.5 rounded text-xs ${
            isDark ? 'bg-sidebar-accent text-sidebar-foreground' : 'bg-muted text-muted-foreground'
          }`}>K</kbd> for quick search.
        </div>
      </div>
    </aside>
  );
};

export default ChatSidebar;
