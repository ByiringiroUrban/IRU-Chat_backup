import React from 'react';
import { useTheme } from 'next-themes';

interface Chat {
  id: string;
  name?: string;
  type: string;
  members: Array<{
    userId: string;
    role: string;
    user: {
      id: string;
      fullName: string;
      profilePicture?: string;
      isOnline: boolean;
    };
  }>;
}

interface ChatInfoPanelProps {
  chat: Chat | null;
  onMute: () => void;
  onArchive: () => void;
  onBlockReport: () => void;
}

const ChatInfoPanel: React.FC<ChatInfoPanelProps> = ({
  chat,
  onMute,
  onArchive,
  onBlockReport,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const memberCount = chat?.members?.length || 0;
  const pinnedCount = 2; // Mock data
  const sharedFilesCount = 14; // Mock data

  return (
    <section className={`w-72 flex-shrink-0 flex flex-col border-l ${
      isDark ? 'bg-card border-border' : 'bg-white border-border'
    }`}>
      {/* Header */}
      <div className={`p-4 border-b ${isDark ? 'border-border' : 'border-border'}`}>
        <div className="flex items-center justify-between">
          <h2 className={`font-semibold text-lg ${isDark ? 'text-foreground' : 'text-foreground'}`}>
            Info
          </h2>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            isDark ? 'bg-muted text-muted-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            Members • Files
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-4">
        <p className={`text-sm ${isDark ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
          Chat details panel.
        </p>

        {/* Stats */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={`text-sm ${isDark ? 'text-foreground' : 'text-foreground'}`}>
              Members
            </span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              isDark ? 'bg-muted text-muted-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              {memberCount}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${isDark ? 'text-foreground' : 'text-foreground'}`}>
              Pinned
            </span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              isDark ? 'bg-muted text-muted-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              {pinnedCount}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${isDark ? 'text-foreground' : 'text-foreground'}`}>
              Shared files
            </span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              isDark ? 'bg-muted text-muted-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              {sharedFilesCount}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className={`h-px ${isDark ? 'bg-border' : 'bg-border'}`} />

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={onMute}
            className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
              isDark 
                ? 'bg-muted hover:bg-muted/80 text-foreground' 
                : 'bg-muted hover:bg-muted/80 text-foreground'
            }`}
          >
            Mute
          </button>
          <button
            onClick={onArchive}
            className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
              isDark 
                ? 'bg-muted hover:bg-muted/80 text-foreground' 
                : 'bg-muted hover:bg-muted/80 text-foreground'
            }`}
          >
            Archive
          </button>
          <button
            onClick={onBlockReport}
            className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
              isDark 
                ? 'bg-destructive/10 hover:bg-destructive/20 text-destructive' 
                : 'bg-destructive/10 hover:bg-destructive/20 text-destructive'
            }`}
          >
            Block / Report
          </button>
        </div>
      </div>
    </section>
  );
};

export default ChatInfoPanel;
