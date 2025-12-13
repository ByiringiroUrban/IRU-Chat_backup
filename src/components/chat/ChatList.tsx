import React from 'react';
import { Search, Plus, Pin, Filter } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

interface User {
  id: string;
  fullName: string;
  username?: string;
  profilePicture?: string;
  email?: string;
  isOnline: boolean;
  lastSeen?: string;
}

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: string;
  createdAt: string;
  sender: User;
}

interface Chat {
  id: string;
  name?: string;
  type: string;
  description?: string;
  avatar?: string;
  isPinned?: boolean;
  isFavorite?: boolean;
  unreadCount?: number;
  members: Array<{
    userId: string;
    role: string;
    user: User;
  }>;
  messages: Message[];
}

interface ChatListProps {
  chats: Chat[];
  selectedChat: Chat | null;
  onChatSelect: (chat: Chat) => void;
  onNewChat: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filter: 'all' | 'unread' | 'pinned';
  onFilterChange: (filter: 'all' | 'unread' | 'pinned') => void;
  currentUserId: string;
  getChatName: (chat: Chat) => string;
  getChatAvatar: (chat: Chat) => string | undefined;
  getChatInitials: (chat: Chat) => string;
}

const ChatList: React.FC<ChatListProps> = ({
  chats,
  selectedChat,
  onChatSelect,
  onNewChat,
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
  getChatName,
  getChatAvatar,
  getChatInitials,
}) => {
  const filters = [
    { id: 'all', label: 'All Chats' },
    { id: 'unread', label: 'Unread' },
    { id: 'pinned', label: 'Pinned' },
  ] as const;

  return (
    <section className="w-80 flex-shrink-0 flex flex-col h-full bg-[#0d1f35] border-r border-[#1e3a5f]">
      {/* Header */}
      <div className="p-4 border-b border-[#1e3a5f]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg text-white">
            Messages
          </h2>
          <button
            onClick={onNewChat}
            className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:opacity-90 transition-opacity shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#162d4a] border border-[#1e3a5f] text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-[#0a1628] rounded-xl">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => onFilterChange(f.id)}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                filter === f.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Items */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {chats.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#162d4a] flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-slate-500" />
              </div>
              <p className="text-sm text-slate-400">No conversations yet</p>
              <p className="text-xs text-slate-500 mt-1">Start a new chat to begin messaging</p>
            </div>
          ) : (
            chats.map((chat) => {
              const lastMessage = chat.messages[0];
              const isSelected = selectedChat?.id === chat.id;
              const avatar = getChatAvatar(chat);
              const initials = getChatInitials(chat);
              const chatName = getChatName(chat);
              const hasUnread = chat.unreadCount && chat.unreadCount > 0;

              return (
                <button
                  key={chat.id}
                  onClick={() => onChatSelect(chat)}
                  className={`w-full p-3 rounded-xl transition-all duration-200 text-left group ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30' 
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden ring-2 ${
                        isSelected ? 'ring-cyan-400' : 'ring-transparent'
                      } ${
                        chat.type === 'one-to-one' ? 'bg-gradient-to-br from-cyan-500/30 to-blue-500/30' :
                        chat.type === 'group' ? 'bg-gradient-to-br from-emerald-500/30 to-teal-500/30' :
                        'bg-gradient-to-br from-purple-500/30 to-pink-500/30'
                      }`}>
                        {avatar ? (
                          <img src={avatar} alt={chatName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-semibold text-sm text-white">{initials}</span>
                        )}
                      </div>
                      {chat.isPinned && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                          <Pin className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-medium text-sm truncate ${
                          isSelected ? 'text-cyan-300' : 'text-white'
                        }`}>
                          {chatName}
                        </span>
                        {lastMessage && (
                          <span className="text-[10px] text-slate-500 ml-2 flex-shrink-0">
                            {format(new Date(lastMessage.createdAt), 'HH:mm')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        {lastMessage && (
                          <p className="text-xs text-slate-400 truncate pr-2">
                            {lastMessage.content}
                          </p>
                        )}
                        {hasUnread && (
                          <span className="w-5 h-5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/30">
                            <span className="text-[10px] font-bold text-white">{chat.unreadCount}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>
    </section>
  );
};

// Add missing import
import { MessageSquare } from 'lucide-react';

export default ChatList;
