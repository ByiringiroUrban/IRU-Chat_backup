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
import HistoriesPage from '@/components/chat/HistoriesPage';
import ActionBoardPage from '@/components/chat/ActionBoardPage';
import EnterpriseToolsPage from '@/components/chat/EnterpriseToolsPage';
import AdvertiseMarketingPage from '@/components/chat/AdvertiseMarketingPage';
import ThreadDocStudioPage from '@/components/chat/ThreadDocStudioPage';
import SmartSummariesPage from '@/components/chat/SmartSummariesPage';
import WorkflowAutomationsPage from '@/components/chat/WorkflowAutomationsPage';
import CommandCenterPage from '@/components/chat/CommandCenterPage';
import DignityModePage from '@/components/chat/DignityModePage';
import ConsentControlsPage from '@/components/chat/ConsentControlsPage';
import IdentityVerificationPage from '@/components/chat/IdentityVerificationPage';
import ReportsModerationPage from '@/components/chat/ReportsModerationPage';
import PrivacyCenterPage from '@/components/chat/PrivacyCenterPage';
import LiveStudioPage from '@/components/chat/LiveStudioPage';
import CommunityBuilderPage from '@/components/chat/CommunityBuilderPage';
import MonetizationPage from '@/components/chat/MonetizationPage';
import ContentLibraryPage from '@/components/chat/ContentLibraryPage';
import CreatorAnalyticsPage from '@/components/chat/CreatorAnalyticsPage';

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
  isPinned?: boolean;
  isDeleted?: boolean;
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

  // Clear localStorage on mount to remove static chats (one-time)
  useEffect(() => {
    // Clear localStorage once on mount to remove any static chats
    const clearStaticData = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.CHATS);
        if (stored) {
          const parsed: Chat[] = JSON.parse(stored);
          const hasStatic = parsed.some(chat => {
            const name = (chat.name || '').toLowerCase();
            const id = (chat.id || '').toLowerCase();
            return name.includes('design team') || 
                   name.includes('m. augustin') ||
                   id.includes('static-');
          });
          if (hasStatic) {
            console.log('Clearing static chats from localStorage');
            localStorage.removeItem(STORAGE_KEYS.CHATS);
            localStorage.removeItem('iru-chat-messages');
          }
        }
      } catch (e) {
        // Ignore errors
      }
    };
    clearStaticData();
  }, []);

  // Initialize Socket.IO connection
  useEffect(() => {
    setMounted(true);
    const token = getAuthToken();
    
    if (!token) {
      console.log('No auth token, skipping socket connection');
      return;
    }
    
    const newSocket = io(API_BASE_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket connected');
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
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
      console.log('Received new message via socket:', message);
      
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

      // Update messages if this is the selected chat
      setMessages(prev => {
        // Only update if this message is for the currently selected chat
        if (formattedMessage.chatId !== selectedChat?.id) {
          // Still update chat list even if not selected
          setChats(prevChats => {
            const updated = prevChats.map(chat => 
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
          return prev;
        }
        
        // Check if message already exists
        const exists = prev.find(m => m.id === formattedMessage.id);
        if (exists) {
          return prev;
        }
        
        // Replace temp message if exists, otherwise add new
        const hasTemp = prev.some(m => m.id.startsWith('temp-') && m.content === formattedMessage.content);
        let updated: Message[];
        
        if (hasTemp) {
          // Replace temp message with real one
          updated = prev.map(m => 
            m.id.startsWith('temp-') && m.content === formattedMessage.content 
              ? formattedMessage 
              : m
          ).filter(m => !m.id.startsWith('temp-') || m.id === formattedMessage.id);
        } else {
          // Add new message
          updated = [...prev, formattedMessage];
        }
        
        // Sort by creation time
        updated.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        
        // Save to localStorage
        saveMessagesToStorage(formattedMessage.chatId, updated);
        return updated;
      });
      
      // Update chat list
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

    // Handle message sent confirmation
    newSocket.on('message:sent', (message: Message) => {
      console.log('Message sent confirmation:', message);
      // Replace temp message with confirmed message
      setMessages(prev => {
        const tempMsg = prev.find(m => m.id.startsWith('temp-') && m.content === message.content);
        if (tempMsg) {
          const updated = prev.map(m => 
            m.id === tempMsg.id ? message : m
          );
          saveMessagesToStorage(message.chatId, updated);
          return updated;
        }
        return prev;
      });
    });

    // Handle message errors
    newSocket.on('message:error', ({ error }: { error: string }) => {
      console.error('Message error from socket:', error);
      toast.error(error || 'Failed to send message');
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

  // Load chats from API only (no static chats, no localStorage cache)
  useEffect(() => {
    // Clear localStorage completely to remove any static chats
    const clearAllStaticData = () => {
      try {
        console.log('Clearing localStorage to remove static chats');
        // Check if there are static chats in localStorage
        const storedChats = localStorage.getItem(STORAGE_KEYS.CHATS);
        if (storedChats) {
          try {
            const parsed: Chat[] = JSON.parse(storedChats);
            const staticChatNames = ['Design Team', 'M. Augustin'];
            const staticChatIds = ['static-'];
            const hasStatic = parsed.some(chat => {
              const name = (chat.name || '').toLowerCase();
              const id = (chat.id || '').toLowerCase();
              return staticChatNames.some(s => name.includes(s.toLowerCase())) ||
                     staticChatIds.some(s => id.includes(s));
            });
            
            if (hasStatic) {
              console.log('Found static chats in localStorage, clearing all data');
              localStorage.removeItem(STORAGE_KEYS.CHATS);
              localStorage.removeItem('iru-chat-messages');
            }
          } catch (e) {
            // If parsing fails, clear anyway
            localStorage.removeItem(STORAGE_KEYS.CHATS);
            localStorage.removeItem('iru-chat-messages');
          }
        }
      } catch (error) {
        console.error('Error clearing localStorage:', error);
      }
    };

    // Clear static chats first
    clearAllStaticData();

    // Load chats from API only (never from localStorage)
    const loadChats = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          console.log('No auth token, cannot load chats from API.');
          setChats([]);
          return;
        }
        
        const response = await fetch(`${API_BASE_URL}/api/chats`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          const apiChats: Chat[] = (data || []).map((chat: any) => ({
            ...chat,
            messages: chat.messages || [],
            members: chat.members || [],
          }));

          // Filter out any static chats that might come from API (just in case)
          const filteredChats = apiChats.filter(chat => {
            const name = (chat.name || '').toLowerCase();
            const id = (chat.id || '').toLowerCase();
            return !name.includes('design team') && 
                   !name.includes('m. augustin') &&
                   !id.includes('static-');
          });

          // Only use filtered API chats (no static chats)
          setChats(filteredChats);
          saveChatsToStorage(filteredChats);
          console.log('Loaded chats from API:', filteredChats.length);
        } else {
          // API failed, set to empty
          console.log('API failed, no chats available');
          setChats([]);
        }
      } catch (error) {
        console.error('Error loading chats from API:', error);
        // On error, set to empty
        setChats([]);
      }
    };

    loadChats();
  }, []);

  // Load messages when chat is selected
  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      return;
    }

    // Always load from localStorage first for immediate display
    const loadFromStorage = () => {
      try {
        const stored = localStorage.getItem('iru-chat-messages');
        const allMessages: Record<string, Message[]> = stored ? JSON.parse(stored) : {};
        const chatMessages = allMessages[selectedChat.id] || [];
        // Always set messages from localStorage first (even if empty)
        setMessages(chatMessages);
        console.log('Loaded messages from localStorage:', chatMessages.length);
        return chatMessages;
      } catch (error) {
        console.error('Error loading messages from storage:', error);
        setMessages([]);
        return [];
      }
    };

    // Load from localStorage immediately
    const storageMessages = loadFromStorage();

    // Join socket room
    if (socket) {
      socket.emit('chat:join', selectedChat.id);
    }

    // Then load from API and merge
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
            
            // Merge with localStorage messages (localStorage takes priority for duplicates)
            const mergedMessages = mergeMessages(storageMessages, apiMessages);
            setMessages(mergedMessages);
            if (mergedMessages.length > 0) {
              saveMessagesToStorage(selectedChat.id, mergedMessages);
            }
          } else {
            // API failed, keep localStorage messages
            console.log('API failed, keeping localStorage messages');
          }
        }
      } catch (error) {
        console.error('Error loading messages:', error);
        // Keep localStorage messages on error
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

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('File selected:', file.name, file.type, file.size);
    
    if (!selectedChat) {
      toast.error('Please select a chat first');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setSelectedFile(file);
    
    // Auto-send file if no text input
    if (!inputValue.trim()) {
      console.log('Auto-sending file since no text input');
      await uploadAndSendFile(file);
    } else {
      console.log('File selected, will send with text message');
    }
  };

  // Upload file and send message
  const uploadAndSendFile = async (file: File) => {
    if (!selectedChat) return;

    try {
      // Show uploading state
      const tempMessageId = `temp-${Date.now()}`;
      const currentUser = getCurrentUser();
      const objectUrl = URL.createObjectURL(file);
      
      const tempMessage: Message = {
        id: tempMessageId,
        chatId: selectedChat.id,
        senderId: currentUserId,
        content: 'Uploading...',
        type: file.type.startsWith('image/') ? 'image' : 
              file.type.startsWith('video/') ? 'video' :
              file.type.startsWith('audio/') ? 'audio' : 'file',
        fileUrl: objectUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
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

      let fileUrl = objectUrl;
      let fileData: any = null;


      // For real chats, upload to backend
      const token = getAuthToken();
      if (!token) {
        toast.error('Please login to send files');
        // Remove temp message
        setMessages(prev => prev.filter(msg => msg.id !== tempMessageId));
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      // Upload file (don't set Content-Type header - browser will set it with boundary)
      const uploadResponse = await fetch(`${API_BASE_URL}/api/files/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type - browser will set it automatically with boundary for FormData
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('File upload failed:', errorText);
        // For static chats or if upload fails, use data URL as fallback
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          fileUrl = dataUrl;
          
          const finalMessage: Message = {
            ...tempMessage,
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            content: file.name,
            fileUrl: dataUrl,
          };
          
          setMessages(prev => {
            const updated = prev.map(msg => 
              msg.id === tempMessageId ? finalMessage : msg
            );
            saveMessagesToStorage(selectedChat.id, updated);
            return updated;
          });
        };
        reader.readAsDataURL(file);
        toast.warning('File saved locally (upload failed)');
        return;
      }

      fileData = await uploadResponse.json();
      console.log('File uploaded successfully:', fileData);
      fileUrl = fileData.url || fileData.id || objectUrl;

      // Send message via socket or API with file
      try {
        const messageData = {
          chatId: selectedChat.id,
          content: file.name,
          type: file.type.startsWith('image/') ? 'image' : 
                file.type.startsWith('video/') ? 'video' :
                file.type.startsWith('audio/') ? 'audio' : 'file',
          fileUrl: fileUrl,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        };

        if (socket && socket.connected) {
          socket.emit('message:send', messageData);
          console.log('File message sent via socket');
        } else {
          // Fallback: send via API
          console.log('Socket not connected, using API for file message');
          const response = await fetch(`${API_BASE_URL}/api/chats/${selectedChat.id}/messages`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(messageData),
          });

          if (!response.ok) {
            throw new Error('Failed to send file message');
          }

          const newMessage = await response.json();
          console.log('File message sent via API:', newMessage);
          
          // Update temp message with actual message
          setMessages(prev => {
            const updated = prev.map(msg => 
              msg.id === tempMessageId 
                ? { ...newMessage, sender: newMessage.sender || msg.sender }
                : msg
            );
            saveMessagesToStorage(selectedChat.id, updated);
            return updated;
          });
        }
      } catch (error: any) {
        console.error('Error sending file message:', error);
        toast.error(error.message || 'Failed to send file message');
      }

      // Update temp message with actual file URL
      setMessages(prev => {
        const updated = prev.map(msg => 
          msg.id === tempMessageId 
            ? { ...msg, fileUrl: fileUrl, content: file.name }
            : msg
        );
        saveMessagesToStorage(selectedChat.id, updated);
        return updated;
      });

      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
      
      // Remove failed message
      setMessages(prev => {
        const updated = prev.filter(msg => msg.id !== `temp-${Date.now()}`);
        saveMessagesToStorage(selectedChat.id, updated);
        return updated;
      });
    }
  };

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedChat) {
      toast.error('Please select a chat first');
      return;
    }
    
    if (!inputValue.trim() && !selectedFile) {
      toast.error('Please enter a message or select a file');
      return;
    }
    
    console.log('Sending message:', { 
      hasText: !!inputValue.trim(), 
      hasFile: !!selectedFile, 
      chatId: selectedChat.id 
    });

    const messageContent = inputValue.trim();
    const currentUser = getCurrentUser();

    // If there's a file, upload it first
    if (selectedFile) {
      await uploadAndSendFile(selectedFile);
      if (!messageContent) {
        setInputValue('');
        return;
      }
    }

    // Create temp message for immediate UI feedback
    const tempMessageId = `temp-${Date.now()}`;
    const tempMessage: Message = {
      id: tempMessageId,
      chatId: selectedChat.id,
      senderId: currentUserId,
      content: messageContent,
      type: 'text',
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

    if (isTyping && socket) {
      setIsTyping(false);
      socket.emit('typing:stop', selectedChat.id);
    }

    // Send message via socket or API
    try {

      const token = getAuthToken();
      if (!token) {
        toast.error('Please login to send messages');
        return;
      }

      // Try socket first, fallback to API for real chats
      if (socket && socket.connected) {
        socket.emit('message:send', {
          chatId: selectedChat.id,
          content: messageContent,
          type: 'text',
        });
        console.log('Message sent via socket');
      } else {
        // Fallback: send via API if socket not connected
        console.log('Socket not connected, using API fallback');
        const response = await fetch(`${API_BASE_URL}/api/chats/${selectedChat.id}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: messageContent,
            type: 'text',
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to send message');
        }

        const newMessage = await response.json();
        console.log('Message sent via API:', newMessage);
        
        // Add the message to the list
        setMessages(prev => {
          const updated = [...prev.filter(m => m.id !== tempMessageId), {
            ...newMessage,
            sender: newMessage.sender || tempMessage.sender,
          }];
          // Always save to localStorage
          saveMessagesToStorage(selectedChat.id, updated);
          return updated;
        });
        
        // Update chat list with the new message
        setChats(prev => {
          const updated = prev.map(c => 
            c.id === selectedChat.id 
              ? { ...c, messages: [newMessage], unreadCount: 0 }
              : c
          );
          saveChatsToStorage(updated);
          return updated;
        });
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.message || 'Failed to send message');
      
      // Remove failed temp message
      setMessages(prev => {
        const updated = prev.filter(msg => msg.id !== tempMessageId);
        saveMessagesToStorage(selectedChat.id, updated);
        return updated;
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

    try {
      // Show uploading state
      const tempMessageId = `temp-${Date.now()}`;
      const currentUser = getCurrentUser();
      const objectUrl = URL.createObjectURL(audioBlob);
      const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
      
      const tempMessage: Message = {
        id: tempMessageId,
        chatId: selectedChat.id,
        senderId: currentUserId,
        content: 'Voice message',
        type: 'audio',
        fileUrl: objectUrl,
        fileName: audioFile.name,
        fileSize: audioBlob.size,
        fileType: 'audio/webm',
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

      let fileUrl = objectUrl;
      let fileData: any = null;


      // For real chats, upload to backend
      const token = getAuthToken();
      if (!token) {
        toast.error('Please login to send voice messages');
        // Remove temp message
        setMessages(prev => prev.filter(msg => msg.id !== tempMessageId));
        return;
      }

      // Upload audio file
      const formData = new FormData();
      formData.append('file', audioFile);

      const uploadResponse = await fetch(`${API_BASE_URL}/api/files/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        // If upload fails, use data URL as fallback
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          fileUrl = dataUrl;
          
          const finalMessage: Message = {
            ...tempMessage,
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            fileUrl: dataUrl,
          };
          
          setMessages(prev => {
            const updated = prev.map(msg => 
              msg.id === tempMessageId ? finalMessage : msg
            );
            saveMessagesToStorage(selectedChat.id, updated);
            return updated;
          });
        };
        reader.readAsDataURL(audioFile);
        toast.warning('Voice message saved locally (upload failed)');
        setAudioBlob(null);
        setRecordingTime(0);
        return;
      }

      fileData = await uploadResponse.json();
      console.log('Voice uploaded successfully:', fileData);
      fileUrl = fileData.url || fileData.id || objectUrl;

      // Send message via socket or API
      try {
        const messageData = {
          chatId: selectedChat.id,
          content: 'Voice message',
          type: 'audio',
          fileUrl: fileUrl,
          fileName: audioFile.name,
          fileSize: audioBlob.size,
          fileType: 'audio/webm',
        };

        if (socket && socket.connected) {
          socket.emit('message:send', messageData);
          console.log('Voice message sent via socket');
        } else {
          // Fallback: send via API
          console.log('Socket not connected, using API for voice message');
          const response = await fetch(`${API_BASE_URL}/api/chats/${selectedChat.id}/messages`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(messageData),
          });

          if (!response.ok) {
            throw new Error('Failed to send voice message');
          }

          const newMessage = await response.json();
          console.log('Voice message sent via API:', newMessage);
          
          // Update temp message with actual message
          setMessages(prev => {
            const updated = prev.map(msg => 
              msg.id === tempMessageId 
                ? { ...newMessage, sender: newMessage.sender || msg.sender }
                : msg
            );
            saveMessagesToStorage(selectedChat.id, updated);
            return updated;
          });
        }
      } catch (error: any) {
        console.error('Error sending voice message:', error);
        toast.error(error.message || 'Failed to send voice message');
      }

      // Update temp message with actual file URL
      setMessages(prev => {
        const updated = prev.map(msg => 
          msg.id === tempMessageId 
            ? { ...msg, fileUrl: fileUrl }
            : msg
        );
        saveMessagesToStorage(selectedChat.id, updated);
        return updated;
      });

      setAudioBlob(null);
      setRecordingTime(0);
      toast.success('Voice message sent');
    } catch (error) {
      console.error('Error sending voice message:', error);
      toast.error('Failed to send voice message');
      
      // Remove failed message
      setMessages(prev => {
        const updated = prev.filter(msg => !msg.id.startsWith('temp-') || msg.content !== 'Voice message');
        saveMessagesToStorage(selectedChat.id, updated);
        return updated;
      });
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Delete message
  const handleDeleteMessage = async (messageId: string) => {
    if (!selectedChat) return;

    try {
      // Delete via API
      const token = getAuthToken();
      if (!token) {
        toast.error('Please login to delete messages');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/chats/${selectedChat.id}/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessages(prev => {
          const updated = prev.filter(msg => msg.id !== messageId);
          saveMessagesToStorage(selectedChat.id, updated);
          return updated;
        });
        toast.success('Message deleted');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete message');
      }
    } catch (error: any) {
      console.error('Error deleting message:', error);
      toast.error(error.message || 'Failed to delete message');
    }
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
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        multiple={false}
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
            <div className="animate-fade-in">
              <StatusPage />
            </div>
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
            <div className="animate-fade-in">
              <CallsPage />
            </div>
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
            <div className="animate-fade-in">
              <ContactsPage />
            </div>
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
            <div className="animate-fade-in">
              <LiveStreamPage />
            </div>
          </>
        ) : activeNav === 'histories' ? (
          <>
            {/* Top Bar for Histories */}
            <ChatTopBar
              title="Histories"
              subtitle="Messages, calls, sessions, and export tools."
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onNewAction={() => toast.info('New action')}
              onMenuToggle={() => setShowMobileMenu(!showMobileMenu)}
            />
            <div className="animate-fade-in">
              <HistoriesPage />
            </div>
          </>
        ) : activeNav === 'action-board' ? (
          <>
            {/* Top Bar for Action Board */}
            <ChatTopBar
              title="Action Board"
              subtitle="Tasks extracted from chats with owners, due dates, reminders."
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onNewAction={() => toast.info('New action')}
              onMenuToggle={() => setShowMobileMenu(!showMobileMenu)}
            />
            <div className="animate-fade-in">
              <ActionBoardPage />
            </div>
          </>
        ) : activeNav === 'enterprise-tools' ? (
          <>
            {/* Top Bar for Enterprise Tools */}
            <ChatTopBar
              title="Enterprise Tools"
              subtitle="Org setup, RBAC, policies, audits, compliance."
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onNewAction={() => toast.info('New action')}
              onMenuToggle={() => setShowMobileMenu(!showMobileMenu)}
            />
            <div className="animate-fade-in">
              <EnterpriseToolsPage />
            </div>
          </>
        ) : activeNav === 'advertise' ? (
          <>
            {/* Top Bar for Advertise / Marketing */}
            <ChatTopBar
              title="Advertise / Marketing"
              subtitle="Campaigns, placements, creatives, approvals, analytics."
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onNewAction={() => toast.info('New action')}
              onMenuToggle={() => setShowMobileMenu(!showMobileMenu)}
            />
            <div className="animate-fade-in">
              <AdvertiseMarketingPage />
            </div>
          </>
        ) : activeNav === 'thread-doc' ? (
          <>
            <ChatTopBar
              title="Thread → Doc Studio"
              subtitle="Convert chat threads into structured documents, wikis, and knowledge bases."
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onNewAction={() => toast.info('New action')}
              onMenuToggle={() => setShowMobileMenu(!showMobileMenu)}
            />
            <div className="animate-fade-in">
              <ThreadDocStudioPage />
            </div>
          </>
        ) : activeNav === 'summaries' ? (
          <>
            <ChatTopBar
              title="Smart Summaries"
              subtitle="AI-powered summaries of conversations, threads, and chat history."
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onNewAction={() => toast.info('New action')}
              onMenuToggle={() => setShowMobileMenu(!showMobileMenu)}
            />
            <div className="animate-fade-in">
              <SmartSummariesPage />
            </div>
          </>
        ) : activeNav === 'automations' ? (
          <>
            <ChatTopBar
              title="Workflow Automations"
              subtitle="Create automated workflows, triggers, and actions for chat interactions."
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onNewAction={() => toast.info('New action')}
              onMenuToggle={() => setShowMobileMenu(!showMobileMenu)}
            />
            <div className="animate-fade-in">
              <WorkflowAutomationsPage />
            </div>
          </>
        ) : activeNav === 'command-center' ? (
          <>
            <ChatTopBar
              title="Command Center"
              subtitle="Slash commands, shortcuts, and quick actions for power users."
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onNewAction={() => toast.info('New action')}
              onMenuToggle={() => setShowMobileMenu(!showMobileMenu)}
            />
            <div className="animate-fade-in">
              <CommandCenterPage />
            </div>
          </>
        ) : activeNav === 'dignity-mode' ? (
          <>
            <ChatTopBar
              title="IRU Dignity Mode"
              subtitle="Advanced content filtering and respectful communication tools."
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onNewAction={() => toast.info('New action')}
              onMenuToggle={() => setShowMobileMenu(!showMobileMenu)}
            />
            <div className="animate-fade-in">
              <DignityModePage />
            </div>
          </>
        ) : activeNav === 'consent-controls' ? (
          <>
            <ChatTopBar
              title="Consent Controls"
              subtitle="Manage your privacy preferences and data consent settings."
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onNewAction={() => toast.info('New action')}
              onMenuToggle={() => setShowMobileMenu(!showMobileMenu)}
            />
            <div className="animate-fade-in">
              <ConsentControlsPage />
            </div>
          </>
        ) : activeNav === 'verification' ? (
          <>
            <ChatTopBar
              title="Identity & Verification"
              subtitle="Verify your identity and manage verification methods."
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onNewAction={() => toast.info('New action')}
              onMenuToggle={() => setShowMobileMenu(!showMobileMenu)}
            />
            <div className="animate-fade-in">
              <IdentityVerificationPage />
            </div>
          </>
        ) : activeNav === 'moderation' ? (
          <>
            <ChatTopBar
              title="Reports & Moderation"
              subtitle="Review and manage user reports, moderation actions, and safety incidents."
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onNewAction={() => toast.info('New action')}
              onMenuToggle={() => setShowMobileMenu(!showMobileMenu)}
            />
            <div className="animate-fade-in">
              <ReportsModerationPage />
            </div>
          </>
        ) : activeNav === 'privacy-center' ? (
          <>
            <ChatTopBar
              title="Privacy Center"
              subtitle="Manage your privacy settings, data rights, and account security."
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onNewAction={() => toast.info('New action')}
              onMenuToggle={() => setShowMobileMenu(!showMobileMenu)}
            />
            <div className="animate-fade-in">
              <PrivacyCenterPage />
            </div>
          </>
        ) : activeNav === 'live-studio' ? (
          <>
            <ChatTopBar
              title="Live Studio"
              subtitle="Professional live streaming tools for creators and broadcasters."
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onNewAction={() => toast.info('New action')}
              onMenuToggle={() => setShowMobileMenu(!showMobileMenu)}
            />
            <div className="animate-fade-in">
              <LiveStudioPage />
            </div>
          </>
        ) : activeNav === 'communities' ? (
          <>
            <ChatTopBar
              title="Community Builder"
              subtitle="Create and manage communities, groups, and member engagement."
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onNewAction={() => toast.info('New action')}
              onMenuToggle={() => setShowMobileMenu(!showMobileMenu)}
            />
            <div className="animate-fade-in">
              <CommunityBuilderPage />
            </div>
          </>
        ) : activeNav === 'monetization' ? (
          <>
            <ChatTopBar
              title="Monetization"
              subtitle="Manage subscriptions, tips, revenue streams, and payment settings."
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onNewAction={() => toast.info('New action')}
              onMenuToggle={() => setShowMobileMenu(!showMobileMenu)}
            />
            <div className="animate-fade-in">
              <MonetizationPage />
            </div>
          </>
        ) : activeNav === 'content-library' ? (
          <>
            <ChatTopBar
              title="Content Library"
              subtitle="Organize and manage your media files, templates, and content assets."
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onNewAction={() => toast.info('New action')}
              onMenuToggle={() => setShowMobileMenu(!showMobileMenu)}
            />
            <div className="animate-fade-in">
              <ContentLibraryPage />
            </div>
          </>
        ) : activeNav === 'creator-analytics' ? (
          <>
            <ChatTopBar
              title="Creator Analytics"
              subtitle="Track your performance, audience insights, and content metrics."
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onNewAction={() => toast.info('New action')}
              onMenuToggle={() => setShowMobileMenu(!showMobileMenu)}
            />
            <div className="animate-fade-in">
              <CreatorAnalyticsPage />
            </div>
          </>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            {/* Chat List Panel - No top bar above it */}
            <ChatList
              chats={filteredChats}
              selectedChat={selectedChat}
              onChatSelect={async (chat) => {
                console.log('Selecting chat:', chat.id, chat.name || 'Unnamed chat', chat);
                if (!chat || !chat.id) {
                  console.error('Invalid chat object:', chat);
                  toast.error('Invalid chat selection');
                  return;
                }
                
                // Set the selected chat
                setSelectedChat(chat);
                
                // Clear input when switching chats
                setInputValue('');
                setSelectedFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              onUserSelect={async (user) => {
                // Create a one-to-one chat with the selected user
                try {
                  const token = getAuthToken();
                  if (!token) {
                    toast.error('Please login to start a chat');
                    return;
                  }

                  toast.info('Creating chat...');
                  
                  const response = await fetch(`${API_BASE_URL}/api/chats`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      type: 'one-to-one',
                      memberIds: [user.id],
                    }),
                  });

                  if (response.ok) {
                    const newChat = await response.json();
                    console.log('Chat created:', newChat);
                    
                    // Format the new chat to ensure it has all required fields
                    const formattedNewChat: Chat = {
                      ...newChat,
                      messages: newChat.messages || [],
                      members: newChat.members || [],
                    };
                    
                    // Add the new chat to the existing chats list
                    setChats(prev => {
                      const updated = [...prev, formattedNewChat];
                      saveChatsToStorage(updated);
                      return updated;
                    });
                    
                    // Select the newly created chat immediately
                    setSelectedChat(formattedNewChat);
                    toast.success(`Chat with ${user.fullName} created!`);
                    
                    // Optionally reload all chats to ensure consistency
                    // But don't wait for it - use the chat we just created
                  } else {
                    const errorData = await response.json().catch(() => ({}));
                    const errorMessage = errorData.error || errorData.message || 'Failed to create chat';
                    console.error('Chat creation error:', errorData);
                    throw new Error(errorMessage);
                  }
                } catch (error: any) {
                  console.error('Error creating chat:', error);
                  toast.error(error.message || 'Failed to create chat');
                }
              }}
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
                  onFileSelect={() => {
                    console.log('File select clicked');
                    if (fileInputRef.current) {
                      fileInputRef.current.click();
                    }
                  }}
                  onDeleteMessage={handleDeleteMessage}
                  isMessageRead={isMessageRead}
                  formatRecordingTime={formatRecordingTime}
                  chatName={selectedChat ? getChatName(selectedChat) : undefined}
                  chatAvatar={selectedChat ? getChatAvatar(selectedChat) : undefined}
                />

                {/* Info Panel - Always visible */}
                <div className="hidden xl:flex h-full">
                  <ChatInfoPanel
                    chat={selectedChat}
                    messages={messages}
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
        onChatCreated={(newChat) => {
          try {
            // Format the new chat to ensure it has all required fields
            const formattedChat: Chat = {
              ...newChat,
              messages: newChat.messages || [],
              members: newChat.members || [],
            };
            
            // Add the new chat to the existing chats list
            setChats(prev => {
              // Check if chat already exists
              const exists = prev.find(c => c.id === formattedChat.id);
              if (exists) {
                // Update existing chat
                const updated = prev.map(c => 
                  c.id === formattedChat.id ? formattedChat : c
                );
                saveChatsToStorage(updated);
                return updated;
              } else {
                // Add new chat
                const updated = [...prev, formattedChat];
                saveChatsToStorage(updated);
                return updated;
              }
            });
            
            // Select the newly created chat
            setSelectedChat(formattedChat);
            toast.success('Chat created successfully!');
          } catch (error) {
            console.error('Error handling created chat:', error);
            toast.error('Failed to add chat to list');
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
