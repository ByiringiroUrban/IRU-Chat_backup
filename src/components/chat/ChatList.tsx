import React from 'react';
import { useTheme } from 'next-themes';
import { format } from 'date-fns';

interface User {
  id: string;
  fullName: string;
  name?: string;
  username?: string;
  profilePicture?: string;
  email?: string;
  isOnline?: boolean;
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
  onUserSelect?: (user: User) => void;
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
  onUserSelect,
  filter,
  onFilterChange,
  getChatName,
  getChatAvatar,
  getChatInitials,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [users, setUsers] = React.useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = React.useState(false);

  // Theme-aware colors
  const cardBg = isDark ? 'bg-[#101828]' : 'bg-white';
  const cardBorder = isDark ? 'border-[rgba(255,255,255,0.09)]' : 'border-[rgba(15,23,42,0.10)]';
  const cardHeaderBg = isDark ? 'bg-[rgba(255,255,255,0.02)]' : 'bg-[rgba(15,23,42,0.02)]';
  const textPrimary = isDark ? 'text-[#e7eefc]' : 'text-[#0f172a]';
  const textMuted = isDark ? 'text-[#9bb0d0]' : 'text-[#475569]';
  const shadow = isDark ? 'shadow-[0_12px_30px_rgba(0,0,0,0.35)]' : 'shadow-[0_10px_25px_rgba(2,6,23,0.08)]';
  const badgeBg = isDark ? 'bg-[rgba(255,255,255,0.02)]' : 'bg-[rgba(15,23,42,0.02)]';
  const badgeBorder = isDark ? 'border-[rgba(255,255,255,0.09)]' : 'border-[rgba(15,23,42,0.10)]';
  const tabActive = isDark 
    ? 'bg-[rgba(110,168,255,0.14)] border-[rgba(110,168,255,0.35)] text-[#e7eefc]'
    : 'bg-[rgba(37,99,235,0.14)] border-[rgba(37,99,235,0.35)] text-[#0f172a]';
  const tabInactive = isDark
    ? 'bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.09)] text-[#9bb0d0] hover:bg-[rgba(255,255,255,0.05)]'
    : 'bg-[rgba(15,23,42,0.02)] border-[rgba(15,23,42,0.10)] text-[#475569] hover:bg-[rgba(15,23,42,0.05)]';
  const buttonBg = isDark 
    ? 'bg-[rgba(110,168,255,0.14)] border-[rgba(110,168,255,0.35)] text-[#e7eefc]'
    : 'bg-[rgba(37,99,235,0.14)] border-[rgba(37,99,235,0.35)] text-[#0f172a]';
  const buttonInactive = isDark
    ? 'bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.09)] text-[#9bb0d0] hover:bg-[rgba(255,255,255,0.05)]'
    : 'bg-[rgba(15,23,42,0.02)] border-[rgba(15,23,42,0.10)] text-[#475569] hover:bg-[rgba(15,23,42,0.05)]';
  const chatSelected = isDark 
    ? 'bg-[rgba(110,168,255,0.10)]' 
    : 'bg-[rgba(37,99,235,0.10)]';
  const chatHover = isDark 
    ? 'hover:bg-[rgba(255,255,255,0.05)]' 
    : 'hover:bg-[rgba(15,23,42,0.05)]';

  const [dmGroupFilter, setDmGroupFilter] = React.useState<'dms' | 'groups'>('dms');

  // Load users from database - always load to show available users
  React.useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const authData = localStorage.getItem('iru-auth');
      if (!authData) {
        console.error('No auth data found in localStorage');
        setLoadingUsers(false);
        return;
      }
      
      const parsed = JSON.parse(authData);
      const token = parsed.token;
      if (!token) {
        console.error('No token found in auth data');
        setLoadingUsers(false);
        return;
      }

      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      console.log('Fetching users from:', `${API_BASE_URL}/api/users`);
      
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Users API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Loaded users from database:', data?.length || 0, data);
        setUsers(Array.isArray(data) ? data : []);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch users:', response.status, errorText);
        
        // Try alternative endpoint
        const altResponse = await fetch(`${API_BASE_URL}/api/calls/users`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (altResponse.ok) {
          const altData = await altResponse.json();
          console.log('Loaded users from calls endpoint:', altData?.length || 0);
          setUsers(Array.isArray(altData) ? altData : []);
        } else {
          console.error('Both endpoints failed');
        }
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  return (
    <section className={`w-80 flex-shrink-0 flex flex-col h-full ${cardBg} border-r ${cardBorder} rounded-none ${shadow} overflow-hidden`}>
      {/* Header */}
      <div className={`px-4 py-3.5 flex items-center justify-between gap-2.5 border-b ${cardBorder} ${cardHeaderBg}`}>
        <h2 className={`text-sm font-medium tracking-wide m-0 ${textPrimary}`}>Chat List</h2>
        <div className="flex gap-1">
          <button
            onClick={() => setDmGroupFilter('dms')}
            className={`px-2 py-1 rounded-full text-xs font-medium transition-colors border ${
              dmGroupFilter === 'dms' ? tabActive : tabInactive
            }`}
          >
            DMs
          </button>
          <button
            onClick={() => setDmGroupFilter('groups')}
            className={`px-2 py-1 rounded-full text-xs font-medium transition-colors border ${
              dmGroupFilter === 'groups' ? tabActive : tabInactive
            }`}
          >
            Groups
          </button>
        </div>
        </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 space-y-3 flex-1 overflow-y-auto">
        {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => onFilterChange('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 border ${
                filter === 'all' ? tabActive : tabInactive
              }`}
              role="tab"
              aria-selected={filter === 'all'}
            >
              All
            </button>
            <button
              onClick={() => onFilterChange('unread')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 border ${
                filter === 'unread' ? tabActive : tabInactive
              }`}
              role="tab"
              aria-selected={filter === 'unread'}
            >
              Unread
            </button>
            <button
              onClick={() => onFilterChange('pinned')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 border ${
                filter === 'pinned' ? tabActive : tabInactive
              }`}
              role="tab"
              aria-selected={filter === 'pinned'}
            >
              Pinned
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={onNewChat}
            className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ease-out transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] border ${buttonBg}`}
          >
            + New Chat
          </button>

          {/* Chat Items */}
          <div className="space-y-1">
            {/* Available Users from Database - Always show */}
            <div className="space-y-1 mb-4">
              {loadingUsers ? (
                <div className={`p-4 text-center ${textMuted} text-sm`}>
                  Loading users...
                </div>
              ) : users.length > 0 ? (
                <>
                  <div className={`px-4 py-2 ${textMuted} text-xs font-medium uppercase tracking-wide border-b ${cardBorder} flex items-center justify-between`}>
                    <span>Available Users ({users.length})</span>
                    <button
                      onClick={loadUsers}
                      disabled={loadingUsers}
                      className={`text-xs ${buttonInactive} px-2 py-1 rounded disabled:opacity-50`}
                      title="Refresh users"
                    >
                      ↻ Refresh
                    </button>
                  </div>
                  {users.map((user) => {
                    if (!user || !user.id || !user.fullName) return null;
                    const initials = user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                    return (
                      <div
                        key={user.id}
                        onClick={() => onUserSelect?.(user)}
                        className={`p-3 rounded-lg cursor-pointer transition-all duration-300 ease-out transform hover:scale-[1.02] hover:shadow-lg animate-slide-in-left ${chatHover}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${
                            isDark ? 'bg-gray-600' : 'bg-gray-300'
                          }`}>
                            {user.profilePicture ? (
                              <img src={user.profilePicture} alt={user.fullName} className="w-full h-full object-cover" />
                            ) : (
                              <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {initials}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-sm font-medium ${textPrimary} truncate`}>
                                {user.fullName}
                              </span>
                              {user.isOnline && (
                                <span className={`w-2 h-2 rounded-full ${
                                  isDark ? 'bg-green-400' : 'bg-green-500'
                                }`} title="Online" />
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <p className={`text-xs ${textMuted} truncate pr-2`}>
                                {user.email || user.username || 'No email'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              ) : (
                <div className={`p-4 text-center ${textMuted} text-sm border-b ${cardBorder}`}>
                  <p className="font-medium mb-1">No users found</p>
                  <p className="text-xs">Please check your connection or try refreshing</p>
                </div>
              )}
            </div>

            {/* Chats List */}
            {chats.length === 0 && users.length > 0 ? (
              <div className={`p-4 text-center ${textMuted} text-sm border-t ${cardBorder} mt-4`}>
                <p className="font-medium mb-1">No chats yet</p>
                <p className="text-xs">Select a user above to start chatting</p>
              </div>
            ) : chats.length > 0 ? (
              chats.map((chat, index) => {
                const lastMessage = chat.messages?.[0];
                const isSelected = selectedChat?.id === chat.id;
                const chatName = getChatName(chat);
                const chatAvatar = getChatAvatar(chat);
                const initials = getChatInitials(chat);

                return (
                  <div
                    key={chat.id}
                    onClick={() => {
                      console.log('Chat clicked:', chat.id, chatName);
                      onChatSelect(chat);
                    }}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-300 ease-out transform hover:scale-[1.02] hover:shadow-lg animate-slide-in-left ${
                      isSelected ? chatSelected : chatHover
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isDark ? 'bg-gray-600' : 'bg-gray-300'
                      }`}>
                        {chatAvatar ? (
                          <img src={chatAvatar} alt={chatName} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {initials}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-medium ${textPrimary} truncate`}>
                            {chatName}
                          </span>
                          {chat.unreadCount && chat.unreadCount > 0 && (
                            <span className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                              isDark ? 'bg-red-500 text-white' : 'bg-red-500 text-white'
                            }`}>
                              {chat.unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className={`text-xs ${textMuted} truncate pr-2`}>
                            {lastMessage 
                              ? lastMessage.content.length > 30 
                                ? lastMessage.content.substring(0, 30) + '...'
                                : lastMessage.content
                              : 'No messages yet'}
                          </p>
                          {lastMessage && (
                            <span className={`text-xs ${textMuted} flex-shrink-0`}>
                              {format(new Date(lastMessage.createdAt), 'HH:mm')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : null}
          </div>
        </div>

        {/* Hint Text */}
        <div className={`px-4 py-3 border-t ${cardBorder} ${textMuted} text-xs`}>
          Replace these with a virtualized list (large chats).
        </div>
      </div>
    </section>
  );
};

export default ChatList;
