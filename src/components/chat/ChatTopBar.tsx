import React from 'react';
import { useTheme } from 'next-themes';
import { Menu, Search, Plus } from 'lucide-react';

interface ChatTopBarProps {
  title: string;
  subtitle: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewAction: () => void;
  onMenuToggle: () => void;
}

const ChatTopBar: React.FC<ChatTopBarProps> = ({
  title,
  subtitle,
  searchQuery,
  onSearchChange,
  onNewAction,
  onMenuToggle,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <header className={`h-16 flex items-center justify-between px-4 border-b ${
      isDark ? 'bg-card border-border' : 'bg-white border-border'
    }`}>
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className={`p-2 rounded-lg transition-colors lg:hidden ${
            isDark ? 'hover:bg-muted' : 'hover:bg-muted'
          }`}
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className={`font-semibold text-lg ${isDark ? 'text-foreground' : 'text-foreground'}`}>
            {title}
          </h1>
          <p className={`text-xs ${isDark ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
            isDark ? 'text-muted-foreground' : 'text-muted-foreground'
          }`} />
          <input
            type="search"
            placeholder="Search (placeholder)…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`w-64 pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring ${
              isDark 
                ? 'bg-muted text-foreground placeholder:text-muted-foreground' 
                : 'bg-muted text-foreground placeholder:text-muted-foreground'
            }`}
          />
        </div>
        <button
          onClick={onNewAction}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          New
        </button>
      </div>
    </header>
  );
};

export default ChatTopBar;
