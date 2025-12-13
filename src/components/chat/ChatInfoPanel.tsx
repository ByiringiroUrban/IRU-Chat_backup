import React from 'react';
import { Users, Pin, Folder, Bell, Archive, ShieldAlert, ChevronRight, Image } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  chatName = 'Chat',
  chatAvatar,
}) => {
  const memberCount = chat?.members?.length || 0;
  const pinnedCount = 2;
  const sharedFilesCount = 14;

  const statItems = [
    { label: 'Members', value: memberCount, icon: Users },
    { label: 'Pinned Messages', value: pinnedCount, icon: Pin },
    { label: 'Shared Files', value: sharedFilesCount, icon: Folder },
  ];

  return (
    <section className="w-72 flex-shrink-0 flex flex-col h-full bg-[#0d1f35] border-l border-[#1e3a5f]">
      {/* Header */}
      <div className="p-4 border-b border-[#1e3a5f]">
        <h2 className="font-semibold text-lg text-white">Details</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Profile */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center overflow-hidden ring-4 ring-cyan-500/20 mb-3">
              {chatAvatar ? (
                <img src={chatAvatar} alt={chatName} className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold text-2xl text-white">{chatName.slice(0, 2).toUpperCase()}</span>
              )}
            </div>
            <h3 className="font-semibold text-white text-lg">{chatName}</h3>
            <p className="text-xs text-emerald-400 mt-1">● Online now</p>
          </div>

          {/* Stats */}
          <div className="space-y-2">
            {statItems.map((item) => (
              <button
                key={item.label}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#162d4a] hover:bg-[#1e3a5f] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#0a1628] flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-cyan-400" />
                  </div>
                  <span className="text-sm text-slate-300">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{item.value}</span>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </div>
              </button>
            ))}
          </div>

          {/* Media Preview */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Shared Media</span>
              <button className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">View All</button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square rounded-lg bg-[#162d4a] flex items-center justify-center hover:bg-[#1e3a5f] transition-all cursor-pointer">
                  <Image className="w-5 h-5 text-slate-500" />
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-[#1e3a5f]" />

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={onMute}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#162d4a] hover:bg-[#1e3a5f] transition-all text-left"
            >
              <Bell className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-300">Mute Notifications</span>
            </button>
            <button
              onClick={onArchive}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#162d4a] hover:bg-[#1e3a5f] transition-all text-left"
            >
              <Archive className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-300">Archive Chat</span>
            </button>
            <button
              onClick={onBlockReport}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-all text-left border border-red-500/20"
            >
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-400">Block / Report</span>
            </button>
          </div>
        </div>
      </ScrollArea>
    </section>
  );
};

export default ChatInfoPanel;
