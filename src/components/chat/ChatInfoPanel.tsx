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
  chatName?: string;
  chatAvatar?: string;
}

const ChatInfoPanel: React.FC<ChatInfoPanelProps> = ({
  chat,
  onMute,
  onArchive,
  onBlockReport,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Theme-aware colors
  const cardBg = isDark ? 'bg-[#101828]' : 'bg-white';
  const cardBorder = isDark ? 'border-[rgba(255,255,255,0.09)]' : 'border-[rgba(15,23,42,0.10)]';
  const cardHeaderBg = isDark ? 'bg-[rgba(255,255,255,0.02)]' : 'bg-[rgba(15,23,42,0.02)]';
  const textPrimary = isDark ? 'text-[#e7eefc]' : 'text-[#0f172a]';
  const textMuted = isDark ? 'text-[#9bb0d0]' : 'text-[#475569]';
  const shadow = isDark ? 'shadow-[0_12px_30px_rgba(0,0,0,0.35)]' : 'shadow-[0_10px_25px_rgba(2,6,23,0.08)]';
  const badgeBg = isDark ? 'bg-[rgba(255,255,255,0.02)]' : 'bg-[rgba(15,23,42,0.02)]';
  const badgeBorder = isDark ? 'border-[rgba(255,255,255,0.09)]' : 'border-[rgba(15,23,42,0.10)]';
  const buttonBg = isDark 
    ? 'bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.09)] text-[#e7eefc] hover:bg-[rgba(255,255,255,0.05)]'
    : 'bg-[rgba(15,23,42,0.02)] border-[rgba(15,23,42,0.10)] text-[#0f172a] hover:bg-[rgba(15,23,42,0.05)]';
  const buttonDanger = isDark
    ? 'bg-[rgba(255,107,107,0.12)] border-[rgba(255,107,107,0.35)] text-[#ff6b6b] hover:bg-[rgba(255,107,107,0.20)]'
    : 'bg-[rgba(220,38,38,0.12)] border-[rgba(220,38,38,0.35)] text-[#dc2626] hover:bg-[rgba(220,38,38,0.20)]';
  const divider = isDark ? 'bg-[rgba(255,255,255,0.09)]' : 'bg-[rgba(15,23,42,0.10)]';

  const memberCount = chat?.members?.length || 5;
  const pinnedCount = 2;
  const sharedFilesCount = 14;

  return (
    <section className={`w-80 flex-shrink-0 flex flex-col h-full ${cardBg} border-l ${cardBorder} rounded-none ${shadow} overflow-hidden`}>
      {/* Header */}
      <div className={`px-4 py-3.5 flex items-center justify-between gap-2.5 border-b ${cardBorder} ${cardHeaderBg}`}>
        <h2 className={`text-sm font-medium tracking-wide m-0 ${textPrimary}`}>Info</h2>
        <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full border ${badgeBorder} ${badgeBg} ${textMuted} text-xs`}>
          Members • Files
        </span>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Hint Text */}
          <p className={`text-xs ${textMuted}`}>
            Chat details panel.
          </p>

          {/* Details */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-sm ${textPrimary}`}>Members</span>
              <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full border ${badgeBorder} ${badgeBg} ${textMuted} text-xs`}>
                {memberCount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${textPrimary}`}>Pinned</span>
              <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full border ${badgeBorder} ${badgeBg} ${textMuted} text-xs`}>
                {pinnedCount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${textPrimary}`}>Shared files</span>
              <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full border ${badgeBorder} ${badgeBg} ${textMuted} text-xs`}>
                {sharedFilesCount}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className={`h-px ${divider}`} />

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={onMute}
              className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonBg}`}
            >
              Mute
            </button>
            <button
              onClick={onArchive}
              className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonBg}`}
            >
              Archive
            </button>
            <button
              onClick={onBlockReport}
              className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonDanger}`}
            >
              Block / Report
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatInfoPanel;
