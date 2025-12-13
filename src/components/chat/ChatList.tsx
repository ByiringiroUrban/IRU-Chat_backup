import React from 'react';
import { useTheme } from 'next-themes';
import { Search, Plus, Pin } from 'lucide-react';
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
  currentUserId,
  getChatName,
  getChatAvatar,
  getChatInitials,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'pinned', label: 'Pinned' },
  ] as const;

  return (
    <section className={`w-80 flex-shrink-0 flex flex-col border-r ${
      isDark ? 'bg-card border-border' : 'bg-white border-border'
    }`}>
      {/* Header */}
      <div className={`p-4 border-b ${isDark ? 'border-border' : 'border-border'}`}>
        <div className="flex items-center justify-between mb-3">
          <h2 className={`font-semibold text-lg ${isDark ? 'text-foreground' : 'text-foreground'}`}>
            Chat List
          </h2>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            isDark ? 'bg-muted text-muted-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            DMs • Groups
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-3">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => onFilterChange(f.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f.id
                  ? isDark 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-primary text-primary-foreground'
                  : isDark
                    ? 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isDark 
              ? 'bg-muted hover:bg-muted/80 text-foreground' 
              : 'bg-muted hover:bg-muted/80 text-foreground'
          }`}
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      {/* Chat Items */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {chats.length === 0 ? (
            <div className={`p-4 text-center text-sm ${isDark ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
              No chats yet. Start a new conversation!
            </div>
          ) : (
            chats.map((chat) => {
              const lastMessage = chat.messages[0];
              const isSelected = selectedChat?.id === chat.id;
              const avatar = getChatAvatar(chat);
              const initials = getChatInitials(chat);
              const chatName = getChatName(chat);

              return (
                <button
                  key={chat.id}
                  onClick={() => onChatSelect(chat)}
                  className={`w-full p-3 rounded-lg transition-colors text-left ${
                    isSelected
                      ? isDark 
                        ? 'bg-accent text-accent-foreground' 
                        : 'bg-accent text-accent-foreground'
                      : isDark
                        ? 'hover:bg-muted/50'
                        : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ${
                        chat.type === 'one-to-one' ? 'bg-primary/20' :
                        chat.type === 'group' ? 'bg-green-500/20' :
                        'bg-purple-500/20'
                      }`}>
                        {avatar ? (
                          <img src={avatar} alt={chatName} className="w-full h-full object-cover" />
                        ) : (
                          <span className={`font-semibold text-sm ${
                            chat.type === 'one-to-one' ? 'text-primary' :
                            chat.type === 'group' ? 'text-green-600' :
                            'text-purple-600'
                          }`}>{initials}</span>
                        )}
                      </div>
                      {chat.isPinned && (
                        <Pin className="absolute -bottom-1 -right-1 w-3 h-3 text-muted-foreground bg-background rounded-full p-0.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`font-medium text-sm truncate ${
                          isDark ? 'text-foreground' : 'text-foreground'
                        }`}>
                          {chatName}
                        </span>
                        {chat.unreadCount && chat.unreadCount > 0 && (
                          <span className="ml-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold text-primary-foreground">{chat.unreadCount}</span>
                          </span>
                        )}
                      </div>
                      {lastMessage && (
                        <div className="flex items-center justify-between">
                          <p className={`text-xs truncate ${
                            isDark ? 'text-muted-foreground' : 'text-muted-foreground'
                          }`}>
                            {lastMessage.content}
                          </p>
                          <span className={`text-xs ml-2 flex-shrink-0 ${
                            isDark ? 'text-muted-foreground' : 'text-muted-foreground'
                          }`}>
                            {format(new Date(lastMessage.createdAt), 'HH:mm')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
          <p className={`text-xs p-3 ${isDark ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
            Replace these with a virtualized list (large chats).
          </p>
        </div>
      </ScrollArea>
    </section>
  );
};

export default ChatList;
