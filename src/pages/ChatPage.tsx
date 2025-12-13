import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useTheme } from 'next-themes';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Components
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatList from '@/components/chat/ChatList';
import ChatConversation from '@/components/chat/ChatConversation';
import ChatInfoPanel from '@/components/chat/ChatInfoPanel';
import ChatTopBar from '@/components/chat/ChatTopBar';
import EmptyConversation from '@/components/chat/EmptyConversation';
import NewChatModal from '@/components/chat/NewChatModal';
import SettingsSidebar from '@/components/chat/SettingsSidebar';
import StatusPage from '@/components/chat/StatusPage';
import CallsPage from '@/components/chat/CallsPage';
import ContactsPage from '@/components/chat/ContactsPage';
import LiveStreamPage from '@/components/chat/LiveStreamPage';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  replyToId?: string;
  readBy?: string[];
  createdAt: string;
  sender: User;
  replyTo?: Message;
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
  _count?: {
    messages: number;
  };
}

const ChatPage = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeNav, setActiveNav] = useState('chats');
  const [chatFilter, setChatFilter] = useState<'all' | 'unread' | 'pinned'>('all');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [showSettingsSidebar, setShowSettingsSidebar] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // LocalStorage keys
  const STORAGE_KEYS = {
    MESSAGES: 'iru-chat-messages',
    CHATS: 'iru-chat-chats',
  };

  // Save messages to localStorage
  const saveMessagesToStorage = (chatId: string, messages: Message[]) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      const allMessages: Record<string, Message[]> = stored ? JSON.parse(stored) : {};
      allMessages[chatId] = messages;
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(allMessages));
    } catch (error) {
      console.error('Error saving messages to storage:', error);
    }
  };

  // Save chats to localStorage
  const saveChatsToStorage = (chats: Chat[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
    } catch (error) {
      console.error('Error saving chats to storage:', error);
    }
  };

  // Merge messages, removing duplicates by ID
  const mergeMessages = (existing: Message[], newMessages: Message[]): Message[] => {
    const messageMap = new Map<string, Message>();
    existing.forEach(msg => messageMap.set(msg.id, msg));
    newMessages.forEach(msg => messageMap.set(msg.id, msg));
    return Array.from(messageMap.values()).sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  };

  // Get auth token
  const getAuthToken = () => {
    try {
      const authData = localStorage.getItem('iru-auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.token;
      }
    } catch (e) {
      // Ignore
    }
    return null;
  };

  const getCurrentUserId = () => {
    try {
      const authData = localStorage.getItem('iru-auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.user?.id;
      }
    } catch (e) {
      // Ignore
    }
    return null;
  };

  const getCurrentUser = () => {
    try {
      const authData = localStorage.getItem('iru-auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.user;
      }
    } catch (e) {
      // Ignore
    }
    return {
      id: 'current-user',
      fullName: 'You',
      username: 'you',
      email: 'you@example.com',
      profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
    };
  };

  const currentUserId = getCurrentUserId() || 'current-user';

  // Initialize Socket.IO connection
  useEffect(() => {
    setMounted(true);
    const token = getAuthToken();
    
    const newSocket = io(API_BASE_URL, {
      auth: token ? { token } : undefined,
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    newSocket.on('connect_error', (error) => {
      console.log('Socket connection error (using local state):', error.message);
    });

    newSocket.on('user:online', ({ userId }: { userId: string }) => {
      setOnlineUsers(prev => new Set(prev).add(userId));
    });

    newSocket.on('user:offline', ({ userId }: { userId: string }) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    newSocket.on('message:new', (message: Message) => {
      const formattedMessage: Message = {
        ...message,
        sender: message.sender || {
          id: message.senderId,
          fullName: 'Unknown User',
          username: 'unknown',
          email: '',
          isOnline: false,
        },
      };

      setMessages(prev => {
        if (formattedMessage.chatId !== selectedChat?.id) return prev;
        
        const hasTemp = prev.some(m => m.id.startsWith('temp-'));
        let updated: Message[];
        if (hasTemp) {
          updated = prev.map(m => 
            m.id.startsWith('temp-') && m.content === formattedMessage.content 
              ? formattedMessage 
              : m
          ).filter(m => !m.id.startsWith('temp-') || m.id === formattedMessage.id);
          
          if (!updated.find(m => m.id === formattedMessage.id)) {
            updated.push(formattedMessage);
          }
        } else if (!prev.find(m => m.id === formattedMessage.id)) {
          updated = [...prev, formattedMessage];
        } else {
          updated = prev;
        }
        
        saveMessagesToStorage(formattedMessage.chatId, updated);
        return updated;
      });
      
      setChats(prev => {
        const updated = prev.map(chat => 
          chat.id === formattedMessage.chatId 
            ? { 
                ...chat, 
                messages: [formattedMessage],
                unreadCount: formattedMessage.senderId !== getCurrentUserId() 
                  ? (chat.unreadCount || 0) + 1 
                  : 0
              }
            : chat
        );
        saveChatsToStorage(updated);
        return updated;
      });
    });

    newSocket.on('typing:start', ({ userId, chatId }: { userId: string; chatId: string }) => {
      if (selectedChat && chatId === selectedChat.id && userId !== getCurrentUserId()) {
        setTypingUsers(prev => new Set(prev).add(userId));
      }
    });

    newSocket.on('typing:stop', ({ userId, chatId }: { userId: string; chatId: string }) => {
      if (selectedChat && chatId === selectedChat.id) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      }
    });

    newSocket.on('message:read', ({ userId, messageIds }: { userId: string; messageIds: string[] }) => {
      setMessages(prev => {
        const updated = prev.map(msg => 
          messageIds.includes(msg.id)
            ? { ...msg, readBy: [...(msg.readBy || []), userId] }
            : msg
        );
        if (selectedChat) {
          saveMessagesToStorage(selectedChat.id, updated);
        }
        return updated;
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Load chats
  useEffect(() => {
    const loadChats = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          setChats([]);
          return;
        }
        
        const response = await fetch(`${API_BASE_URL}/api/chats`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          const formattedChats: Chat[] = (data || []).map((chat: any) => ({
            ...chat,
            messages: chat.messages || [],
            members: chat.members || [],
          }));
          setChats(formattedChats);
          if (formattedChats.length > 0) {
            saveChatsToStorage(formattedChats);
          }
        } else {
          setChats([]);
        }
      } catch (error) {
        console.error('Error loading chats:', error);
        setChats([]);
      }
    };

    loadChats();
  }, []);

  // Load messages when chat is selected
  useEffect(() => {
    if (!selectedChat) return;

    if (socket) {
      socket.emit('chat:join', selectedChat.id);
    }

    const loadMessages = async () => {
      try {
        const token = getAuthToken();
        
        setChats(prev => {
          const updated = prev.map(chat => 
            chat.id === selectedChat.id ? { ...chat, unreadCount: 0 } : chat
          );
          saveChatsToStorage(updated);
          return updated;
        });

        if (token) {
          const response = await fetch(`${API_BASE_URL}/api/chats/${selectedChat.id}/messages`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });

          if (response.ok) {
            const data = await response.json();
            const apiMessages = (data.messages || data).map((msg: any) => ({
              ...msg,
              sender: msg.sender || selectedChat.members.find((m: any) => m.userId === msg.senderId)?.user || {
                id: msg.senderId,
                fullName: 'Unknown User',
                username: 'unknown',
                email: '',
                isOnline: false,
              },
            }));
            setMessages(apiMessages);
            if (apiMessages.length > 0) {
              saveMessagesToStorage(selectedChat.id, apiMessages);
            }
          } else {
            setMessages([]);
          }
        } else {
          setMessages([]);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
        setMessages([]);
      }
    };

    loadMessages();

    return () => {
      if (socket) {
        socket.emit('chat:leave', selectedChat.id);
      }
    };
  }, [selectedChat, socket]);

  // Handle typing indicator
  const handleInputChange = (value: string) => {
    setInputValue(value);

    if (!isTyping && selectedChat && socket) {
      setIsTyping(true);
      socket.emit('typing:start', selectedChat.id);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (selectedChat && socket) {
        setIsTyping(false);
        socket.emit('typing:stop', selectedChat.id);
      }
    }, 1000);
  };

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputValue.trim() && !selectedFile) || !selectedChat) return;

    const messageContent = inputValue.trim();
    const currentUser = getCurrentUser();
    
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      chatId: selectedChat.id,
      senderId: currentUserId,
      content: messageContent || selectedFile?.name || '',
      type: selectedFile ? (
        selectedFile.type.startsWith('image/') ? 'image' : 
        selectedFile.type.startsWith('video/') ? 'video' :
        selectedFile.type.startsWith('audio/') ? 'audio' : 'file'
      ) : 'text',
      fileUrl: selectedFile ? URL.createObjectURL(selectedFile) : undefined,
      fileName: selectedFile?.name,
      createdAt: new Date().toISOString(),
      sender: {
        id: currentUserId,
        fullName: currentUser?.fullName || 'You',
        username: currentUser?.username || 'you',
        email: currentUser?.email || '',
        profilePicture: currentUser?.profilePicture,
        isOnline: true,
      },
      readBy: [],
    };

    setMessages(prev => {
      const updated = [...prev, tempMessage];
      saveMessagesToStorage(selectedChat.id, updated);
      return updated;
    });
    
    setChats(prev => {
      const updated = prev.map(chat => 
        chat.id === selectedChat.id 
          ? { ...chat, messages: [tempMessage], unreadCount: 0 }
          : chat
      );
      saveChatsToStorage(updated);
      return updated;
    });

    setInputValue('');
    setSelectedFile(null);

    if (isTyping && socket) {
      setIsTyping(false);
      socket.emit('typing:stop', selectedChat.id);
    }

    if (socket && socket.connected) {
      socket.emit('message:send', {
        chatId: selectedChat.id,
        content: messageContent,
        type: 'text',
      });
    }
  };

  // Recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const cancelRecording = () => {
    stopRecording();
    setAudioBlob(null);
    setRecordingTime(0);
  };

  const sendVoiceMessage = async () => {
    if (!audioBlob || !selectedChat) return;
    
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      chatId: selectedChat.id,
      senderId: currentUserId,
      content: 'Voice message',
      type: 'audio',
      fileUrl: URL.createObjectURL(audioBlob),
      createdAt: new Date().toISOString(),
      sender: getCurrentUser(),
      readBy: [],
    };

    setMessages(prev => [...prev, tempMessage]);
    setAudioBlob(null);
    setRecordingTime(0);
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper functions
  const getChatName = (chat: Chat) => {
    if (chat.name) return chat.name;
    if (chat.type === 'one-to-one' || chat.type === 'direct') {
      const otherMember = chat.members.find(m => m.userId !== currentUserId);
      return otherMember?.user.fullName || 'Unknown User';
    }
    return 'Group Chat';
  };

  const getChatAvatar = (chat: Chat) => {
    if (chat.avatar) return chat.avatar;
    if (chat.type === 'one-to-one' || chat.type === 'direct') {
      const otherMember = chat.members.find(m => m.userId !== currentUserId);
      return otherMember?.user.profilePicture;
    }
    return undefined;
  };

  const getChatInitials = (chat: Chat) => {
    const name = getChatName(chat);
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const isMessageRead = (message: Message) => {
    return (message.readBy || []).some(id => id !== message.senderId);
  };

  // Filter chats
  const filteredChats = chats.filter(chat => {
    if (chatFilter === 'unread') return (chat.unreadCount || 0) > 0;
    if (chatFilter === 'pinned') return chat.isPinned;
    return true;
  }).filter(chat => {
    if (!searchQuery) return true;
    const name = getChatName(chat).toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  const isDark = theme === 'dark';

  if (!mounted) return null;

  return (
    <div className={`flex h-screen ${isDark ? 'bg-[#070e18]' : 'bg-[#f6f8fd]'}`}>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
        className="hidden"
      />

      {/* Left Sidebar - Navigation */}
      <div className={`hidden lg:flex h-full ${showMobileMenu ? 'flex' : ''}`}>
        <ChatSidebar
          activeNav={activeNav}
          onNavChange={(navId) => {
            setActiveNav(navId);
            if (navId === 'settings') {
              setShowSettingsSidebar(true);
            }
          }}
          userProfile={getCurrentUser()}
          isOnline={true}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        {/* Page Content */}
        {activeNav === 'status' ? (
          <>
            {/* Top Bar for Status */}
            <ChatTopBar
              title="Status"
              subtitle="Presence, privacy, and quick context."
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onNewAction={() => toast.info('New action')}
              onMenuToggle={() => setShowMobileMenu(!showMobileMenu)}
            />
            <StatusPage />
          </>
        ) : activeNav === 'calls' ? (
          <>
            {/* Top Bar for Calls */}
            <ChatTopBar
              title="Calls"
              subtitle="Voice/video calling, meeting links, and device check."
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onNewAction={() => toast.info('New action')}
              onMenuToggle={() => setShowMobileMenu(!showMobileMenu)}
            />
            <CallsPage />
          </>
        ) : activeNav === 'contacts' ? (
          <>
            {/* Top Bar for Contacts */}
            <ChatTopBar
              title="Contacts"
              subtitle="Directory, profiles, notes, import/export."
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onNewAction={() => toast.info('New action')}
              onMenuToggle={() => setShowMobileMenu(!showMobileMenu)}
            />
            <ContactsPage />
          </>
        ) : activeNav === 'live-stream' ? (
          <>
            {/* Top Bar for Live Stream */}
            <ChatTopBar
              title="Live Stream"
              subtitle="Broadcast, moderation, and replay library."
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onNewAction={() => toast.info('New action')}
              onMenuToggle={() => setShowMobileMenu(!showMobileMenu)}
            />
            <LiveStreamPage />
          </>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            {/* Chat List Panel - No top bar above it */}
            <ChatList
              chats={filteredChats}
              selectedChat={selectedChat}
              onChatSelect={setSelectedChat}
              onNewChat={() => setShowNewChatModal(true)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filter={chatFilter}
              onFilterChange={setChatFilter}
              currentUserId={currentUserId}
              getChatName={getChatName}
              getChatAvatar={getChatAvatar}
              getChatInitials={getChatInitials}
            />

            {/* Right side with Top Bar, Conversation, and Info */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Top Bar - Only above conversation and info */}
              <ChatTopBar
                title="Chats"
                subtitle="DMs, groups, threads, and messaging composer."
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onNewAction={() => setShowNewChatModal(true)}
                onMenuToggle={() => setShowMobileMenu(!showMobileMenu)}
              />

              {/* Conversation and Info Panels */}
              <div className="flex-1 flex overflow-hidden">
                {/* Conversation Panel - Always show, with static messages when no chat selected */}
                <ChatConversation
                  messages={selectedChat ? messages : []}
                  currentUserId={currentUserId}
                  inputValue={inputValue}
                  onInputChange={handleInputChange}
                  onSendMessage={handleSendMessage}
                  typingUsers={typingUsers}
                  isRecording={isRecording}
                  recordingTime={recordingTime}
                  onStartRecording={startRecording}
                  onStopRecording={stopRecording}
                  onCancelRecording={cancelRecording}
                  onSendVoice={sendVoiceMessage}
                  audioBlob={audioBlob}
                  onFileSelect={() => fileInputRef.current?.click()}
                  isMessageRead={isMessageRead}
                  formatRecordingTime={formatRecordingTime}
                  chatName={selectedChat ? getChatName(selectedChat) : undefined}
                  chatAvatar={selectedChat ? getChatAvatar(selectedChat) : undefined}
                />

                {/* Info Panel - Always visible */}
                <div className="hidden xl:flex h-full">
                  <ChatInfoPanel
                    chat={selectedChat}
                    onMute={() => toast.info('Mute clicked')}
                    onArchive={() => toast.info('Archive clicked')}
                    onBlockReport={() => toast.info('Block/Report clicked')}
                    chatName={selectedChat ? getChatName(selectedChat) : undefined}
                    chatAvatar={selectedChat ? getChatAvatar(selectedChat) : undefined}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onChatCreated={async (chatId) => {
          try {
            const token = getAuthToken();
            if (!token) return;
            
            const response = await fetch(`${API_BASE_URL}/api/chats`, {
              headers: { 'Authorization': `Bearer ${token}` },
            });
            
            if (response.ok) {
              const apiChats = await response.json();
              const chatMap = new Map<string, Chat>();
              chats.forEach(chat => chatMap.set(chat.id, chat));
              
              apiChats.forEach((chat: Chat) => {
                const existing = chatMap.get(chat.id);
                if (existing) {
                  const mergedMessages = mergeMessages(existing.messages, chat.messages);
                  chatMap.set(chat.id, { ...existing, ...chat, messages: mergedMessages });
                } else {
                  chatMap.set(chat.id, chat);
                }
              });
              
              const updatedChats = Array.from(chatMap.values());
              setChats(updatedChats);
              saveChatsToStorage(updatedChats);
              
              const newChat = updatedChats.find((c: Chat) => c.id === chatId);
              if (newChat) {
                setSelectedChat(newChat);
              }
            }
          } catch (error) {
            console.error('Error loading chats:', error);
          }
        }}
      />

      <SettingsSidebar
        isOpen={showSettingsSidebar}
        onClose={() => setShowSettingsSidebar(false)}
        isDark={isDark}
      />
    </div>
  );
};

export default ChatPage;
