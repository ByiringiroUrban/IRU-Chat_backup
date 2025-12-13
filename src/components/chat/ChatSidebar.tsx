import React from 'react';
import { useTheme } from 'next-themes';
import { 
  Clock, MessageSquare, Phone, Users, Video, History, 
  ClipboardCheck, FileText, Sparkles, Zap, Command,
  Heart, Lock, BadgeCheck, Shield, EyeOff,
  Camera, UserPlus, CreditCard, Folder, BarChart3,
  Settings, Building2, Megaphone, Sun, Moon
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  isOnline = true,
}) => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col h-full bg-[#0a1628] border-r border-[#1e3a5f]">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#1e3a5f]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center font-bold text-sm text-white shadow-lg shadow-cyan-500/20">
            IRU
          </div>
          <div>
            <h1 className="font-semibold text-base text-white">
              IRU Chat
            </h1>
            <small className="text-xs text-slate-400">
              OneHealthLine Connect
            </small>
          </div>
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <ScrollArea className="flex-1 overflow-y-auto">
        <nav className="p-2" aria-label="Sidebar">
          {navSections.map((section) => (
            <div key={section.title} className="mb-3">
              <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {section.title}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavChange(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border-l-2 border-cyan-400' 
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : ''}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-[#1e3a5f]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
              isOnline
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-slate-500/20 text-slate-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-2 rounded-lg transition-colors hover:bg-white/10 text-slate-400 hover:text-white"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
        <div className="text-[11px] text-slate-500">
          Tip: <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300">K</kbd> for quick search
        </div>
      </div>
    </aside>
  );
};

export default ChatSidebar;
