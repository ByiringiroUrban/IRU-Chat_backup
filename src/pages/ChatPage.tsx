import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useTheme } from 'next-themes';
import { 
  Search, MessageSquare, Users, Video, Phone, Paperclip, Send, 
  MoreVertical, Smile, FileText, Menu, X, Plus, Settings, Bell,
  Mic, Calendar, Folder, Wrench, ChevronDown, Pin, BarChart3, RefreshCw,
  Sun, Moon, User, CircleDot, PhoneCall, ContactRound, Star, Filter, Square, Radio,
  Building2, History
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import NewChatModal from '../components/chat/NewChatModal';
import SettingsSidebar from '../components/chat/SettingsSidebar';

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
  const { theme, setTheme } = useTheme();
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
  const [activeNav, setActiveNav] = useState<'chats' | 'status' | 'groups' | 'calls' | 'contacts' | 'live' | 'enterprise' | 'histories'>('chats');
  const [chatFilter, setChatFilter] = useState<'all' | 'unread' | 'favorites' | 'groups'>('all');
  const [chatListWidth, setChatListWidth] = useState(384); // Default 96 * 4 = 384px (w-96)
  const [isResizing, setIsResizing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isLiveStreaming, setIsLiveStreaming] = useState(false);
  const [showLiveStreamModal, setShowLiveStreamModal] = useState(false);
  const [liveStreamUrl, setLiveStreamUrl] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [showSettingsSidebar, setShowSettingsSidebar] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [userCount, setUserCount] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resizeRef = useRef<{ startX: number; startWidth: number } | null>(null);
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

  // Load messages from localStorage
  const loadMessagesFromStorage = (chatId: string): Message[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      if (stored) {
        const allMessages: Record<string, Message[]> = JSON.parse(stored);
        return allMessages[chatId] || [];
      }
    } catch (error) {
      console.error('Error loading messages from storage:', error);
    }
    return [];
  };

  // Save chats to localStorage
  const saveChatsToStorage = (chats: Chat[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
    } catch (error) {
      console.error('Error saving chats to storage:', error);
    }
  };

  // Load chats from localStorage
  const loadChatsFromStorage = (): Chat[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CHATS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading chats from storage:', error);
    }
    return [];
  };

  // Merge messages, removing duplicates by ID
  const mergeMessages = (existing: Message[], newMessages: Message[]): Message[] => {
    const messageMap = new Map<string, Message>();
    
    // Add existing messages
    existing.forEach(msg => {
      messageMap.set(msg.id, msg);
    });
    
    // Add/update with new messages
    newMessages.forEach(msg => {
      messageMap.set(msg.id, msg);
    });
    
    // Sort by createdAt
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
    // Return mock current user if no auth data
    return {
      id: currentUserId,
      fullName: 'You',
      username: 'you',
      email: 'you@example.com',
      profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
    };
  };

  // Initialize Socket.IO connection
  useEffect(() => {
    const token = getAuthToken();
    
    // Try to connect even without token for demo purposes
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
      // Continue with local state updates even if socket fails
    });

    newSocket.on('user:online', ({ userId }: { userId: string }) => {
      setOnlineUsers(prev => new Set(prev).add(userId));
      // Update user online status in allUsers
      setAllUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, isOnline: true } : user
      ));
    });

    newSocket.on('user:offline', ({ userId }: { userId: string }) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      // Update user offline status in allUsers
      setAllUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, isOnline: false, lastSeen: new Date().toISOString() } : user
      ));
    });


    newSocket.on('message:new', (message: Message) => {
      // Ensure message has proper structure
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

      // Replace temp message with server message if it exists
      setMessages(prev => {
        if (formattedMessage.chatId !== selectedChat?.id) {
          return prev;
        }
        
        const hasTemp = prev.some(m => m.id.startsWith('temp-'));
        let updated: Message[];
        if (hasTemp && formattedMessage.chatId === selectedChat?.id) {
          // Replace temp message with real one
          updated = prev.map(m => 
            m.id.startsWith('temp-') && m.content === formattedMessage.content 
              ? formattedMessage 
              : m
          ).filter(m => !m.id.startsWith('temp-') || m.id === formattedMessage.id);
          
          // Add the formatted message if it's not already there
          if (!updated.find(m => m.id === formattedMessage.id)) {
            updated.push(formattedMessage);
          }
        } else if (formattedMessage.chatId === selectedChat?.id && !prev.find(m => m.id === formattedMessage.id)) {
          // Add new message if not from current user or if it's a different message
          updated = [...prev, formattedMessage];
        } else {
          updated = prev;
        }
        
        if (formattedMessage.chatId === selectedChat?.id) {
          saveMessagesToStorage(formattedMessage.chatId, updated);
        }
        return updated;
      });
      
      // Update chat list with last message
      setChats(prev => {
        const chatExists = prev.find(c => c.id === formattedMessage.chatId);
        let updated: Chat[];
        
        if (chatExists) {
          updated = prev.map(chat => 
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
        } else {
          // If chat doesn't exist, we might need to fetch it
          // For now, just add it to the list
          updated = [...prev, {
            id: formattedMessage.chatId,
            type: 'direct',
            members: [],
            messages: [formattedMessage],
            unreadCount: formattedMessage.senderId !== getCurrentUserId() ? 1 : 0,
          }];
        }
        
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

    // Live stream events
    newSocket.on('live:start', ({ streamId, userId, chatId }: { streamId: string; userId: string; chatId: string }) => {
      if (chatId === selectedChat?.id && userId !== getCurrentUserId()) {
        // Show notification that someone started streaming
        const streamer = selectedChat.members.find(m => m.userId === userId)?.user;
        const streamMessage: Message = {
          id: `stream-notification-${Date.now()}`,
          chatId: chatId,
          senderId: userId,
          content: `🔴 ${streamer?.fullName || 'Someone'} started a live stream`,
          type: 'live_stream',
          createdAt: new Date().toISOString(),
          sender: streamer || {
            id: userId,
            fullName: 'Unknown User',
            username: 'unknown',
            email: '',
            isOnline: false,
          },
          readBy: [],
          fileUrl: streamId,
        };
        setMessages(prev => {
          const updated = [...prev, streamMessage];
          saveMessagesToStorage(chatId, updated);
          return updated;
        });
      }
    });

    newSocket.on('live:stop', ({ userId, chatId }: { userId: string; chatId: string }) => {
      if (chatId === selectedChat?.id && userId !== getCurrentUserId()) {
        const streamer = selectedChat.members.find(m => m.userId === userId)?.user;
        const stopMessage: Message = {
          id: `stream-stop-${Date.now()}`,
          chatId: chatId,
          senderId: userId,
          content: `⏹️ ${streamer?.fullName || 'Someone'} ended the live stream`,
          type: 'text',
          createdAt: new Date().toISOString(),
          sender: streamer || {
            id: userId,
            fullName: 'Unknown User',
            username: 'unknown',
            email: '',
            isOnline: false,
          },
          readBy: [],
        };
        setMessages(prev => {
          const updated = [...prev, stopMessage];
          saveMessagesToStorage(chatId, updated);
          return updated;
        });
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const currentUserId = getCurrentUserId();

  // Clear localStorage on mount to remove any old static data
  useEffect(() => {
    localStorage.removeItem(STORAGE_KEYS.CHATS);
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
  }, []);

  // Load all users and user count
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const token = getAuthToken();
        if (!token) return;

        // Load user count
        try {
          const countResponse = await fetch(`${API_BASE_URL}/api/users/count`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (countResponse.ok) {
            const countData = await countResponse.json();
            setUserCount(countData.count || 0);
          }
        } catch (error) {
          console.error('Error loading user count:', error);
        }

        // Load all users
        try {
          const usersResponse = await fetch(`${API_BASE_URL}/api/users`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            setAllUsers(usersData || []);
          }
        } catch (error) {
          console.error('Error loading users:', error);
        }
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };

    loadUsers();
  }, []);

  // Load chats
  useEffect(() => {
    const loadChats = async () => {
      try {
        const token = getAuthToken();
        
        if (!token) {
          // No token, clear chats and return
          setChats([]);
          return;
        }
        
        // Load from API only
        try {
          const response = await fetch(`${API_BASE_URL}/api/chats`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            // Format chats from API
            const formattedChats: Chat[] = (data || []).map((chat: any) => ({
              ...chat,
              messages: chat.messages || [],
              members: chat.members || [],
            }));
            
            setChats(formattedChats);
            // Only save to localStorage if we got data from API
            if (formattedChats.length > 0) {
              saveChatsToStorage(formattedChats);
            }
          } else {
            // If API fails, clear chats
            setChats([]);
          }
        } catch (error) {
          console.error('Error loading chats from API:', error);
          // Clear chats on error
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
        
        // Clear unread count when opening chat
        setChats(prev => {
          const updated = prev.map(chat => 
            chat.id === selectedChat.id ? { ...chat, unreadCount: 0 } : chat
          );
          saveChatsToStorage(updated);
          return updated;
        });

        // Load from API only
        if (token) {
          try {
            const response = await fetch(`${API_BASE_URL}/api/chats/${selectedChat.id}/messages`, {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
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
              // Only save to localStorage if we got data from API
              if (apiMessages.length > 0) {
                saveMessagesToStorage(selectedChat.id, apiMessages);
              } else {
                // Clear localStorage for this chat if no messages
                const stored = localStorage.getItem(STORAGE_KEYS.MESSAGES);
                if (stored) {
                  const allMessages: Record<string, Message[]> = JSON.parse(stored);
                  delete allMessages[selectedChat.id];
                  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(allMessages));
                }
                setMessages([]);
              }
            } else {
              setMessages([]);
            }
          } catch (error) {
            console.error('Error loading messages from API:', error);
            setMessages([]);
          }
        } else {
          // No token, clear messages
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

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);

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
    const currentUserId = getCurrentUserId();
    const currentUser = getCurrentUser();
    
    // Create optimistic message immediately
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      chatId: selectedChat.id,
      senderId: currentUserId || 'current-user',
      content: messageContent || selectedFile?.name || '',
      type: selectedFile ? (
        selectedFile.type.startsWith('image/') ? 'image' : 
        selectedFile.type.startsWith('video/') ? 'video' :
        selectedFile.type.startsWith('audio/') ? 'audio' : 'file'
      ) : 'text',
      fileUrl: selectedFile ? URL.createObjectURL(selectedFile) : undefined,
      fileName: selectedFile?.name,
      fileSize: selectedFile?.size,
      fileType: selectedFile?.type,
      createdAt: new Date().toISOString(),
      sender: {
        id: currentUserId || 'current-user',
        fullName: currentUser?.fullName || 'You',
        username: currentUser?.username || 'you',
        email: currentUser?.email || '',
        profilePicture: currentUser?.profilePicture,
        isOnline: true,
      },
      readBy: [],
    };

    // Add message to local state immediately (optimistic update)
    setMessages(prev => {
      const updated = [...prev, tempMessage];
      saveMessagesToStorage(selectedChat.id, updated);
      return updated;
    });
    
    // Update chat list with last message
    setChats(prev => {
      const updated = prev.map(chat => 
        chat.id === selectedChat.id 
          ? { 
              ...chat, 
              messages: [tempMessage],
              unreadCount: 0,
            }
          : chat
      );
      saveChatsToStorage(updated);
      return updated;
    });

    // Clear input
    const fileToUpload = selectedFile;
    setInputValue('');
    setSelectedFile(null);

    // Stop typing indicator
    if (isTyping && socket) {
      setIsTyping(false);
      socket.emit('typing:stop', selectedChat.id);
    }

    // Send via socket if available, otherwise just use local state
    if (socket && socket.connected) {
      if (fileToUpload) {
        await handleFileUpload(fileToUpload, messageContent);
      } else {
        socket.emit('message:send', {
          chatId: selectedChat.id,
          content: messageContent,
          type: 'text',
        });
      }
    } else {
      // If socket not available, update message ID after a short delay to simulate server response
      setTimeout(() => {
        setMessages(prev => {
          const updated = prev.map(msg => 
            msg.id === tempMessage.id 
              ? { ...msg, id: `msg-${Date.now()}` }
              : msg
          );
          saveMessagesToStorage(selectedChat.id, updated);
          return updated;
        });
      }, 100);
    }
  };

  // Handle file upload
  const handleFileUpload = async (file: File, caption?: string) => {
    try {
      const token = getAuthToken();
      const fileType = file.type.startsWith('image/') ? 'image' : 
                       file.type.startsWith('video/') ? 'video' :
                       file.type.startsWith('audio/') ? 'audio' : 'file';

      // Try to upload file if API is available
      if (token) {
        try {
          const formData = new FormData();
          formData.append('file', file);

          const response = await fetch(`${API_BASE_URL}/api/files/upload`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData,
          });

          if (response.ok) {
            const fileData = await response.json();
            
            if (socket && socket.connected && selectedChat) {
              socket.emit('message:send', {
                chatId: selectedChat.id,
                content: caption || file.name,
                type: fileType,
                fileUrl: fileData.url,
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
              });
            }
            return;
          }
        } catch (error) {
          console.log('File upload API not available, using local file URL');
        }
      }

      // Fallback: use local file URL if API is not available
      if (socket && socket.connected && selectedChat) {
        socket.emit('message:send', {
          chatId: selectedChat.id,
          content: caption || file.name,
          type: fileType,
          fileUrl: URL.createObjectURL(file),
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Start voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          setAudioBlob(audioBlob);
        }
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  // Stop voice recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  // Send voice message
  const sendVoiceMessage = async () => {
    if (!audioBlob || !selectedChat) return;

    const currentUserId = getCurrentUserId();
    const currentUser = getCurrentUser();
    const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });

    // Create optimistic message
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      chatId: selectedChat.id,
      senderId: currentUserId || 'current-user',
      content: 'Voice message',
      type: 'audio',
      fileUrl: URL.createObjectURL(audioBlob),
      fileName: audioFile.name,
      fileSize: audioBlob.size,
      fileType: 'audio/webm',
      createdAt: new Date().toISOString(),
      sender: {
        id: currentUserId || 'current-user',
        fullName: currentUser?.fullName || 'You',
        username: currentUser?.username || 'you',
        email: currentUser?.email || '',
        profilePicture: currentUser?.profilePicture,
        isOnline: true,
      },
      readBy: [],
    };

    // Add message to local state
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

    // Clear recording state
    setAudioBlob(null);
    setRecordingTime(0);

    // Send via socket if available
    if (socket && socket.connected) {
      await handleFileUpload(audioFile, 'Voice message');
    } else {
      setTimeout(() => {
        setMessages(prev => {
          const updated = prev.map(msg => 
            msg.id === tempMessage.id 
              ? { ...msg, id: `msg-${Date.now()}` }
              : msg
          );
          saveMessagesToStorage(selectedChat.id, updated);
          return updated;
        });
      }, 100);
    }
  };

  // Cancel voice recording
  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
    setAudioBlob(null);
    setRecordingTime(0);
    audioChunksRef.current = [];
  };

  // Format recording time
  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
      // Stop live stream on unmount
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
    };
  }, [isRecording, localStream]);

  // Start live streaming
  const startLiveStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }, 
        audio: true 
      });
      
      setLocalStream(stream);
      setIsLiveStreaming(true);
      setShowLiveStreamModal(true);
      
      // Set video stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Generate stream URL/ID (in production, this would come from your streaming service)
      const streamId = `stream-${Date.now()}-${getCurrentUserId()}`;
      setLiveStreamUrl(streamId);

      // Notify chat members about the live stream
      if (socket && socket.connected && selectedChat) {
        socket.emit('live:start', {
          chatId: selectedChat.id,
          streamId: streamId,
          userId: getCurrentUserId(),
        });
      }

      // Send notification message to chat
      const currentUserId = getCurrentUserId();
      const currentUser = getCurrentUser();
      const streamMessage: Message = {
        id: `stream-${Date.now()}`,
        chatId: selectedChat?.id || '',
        senderId: currentUserId || 'current-user',
        content: '🔴 Started a live stream',
        type: 'live_stream',
        createdAt: new Date().toISOString(),
        sender: {
          id: currentUserId || 'current-user',
          fullName: currentUser?.fullName || 'You',
          username: currentUser?.username || 'you',
          email: currentUser?.email || '',
          profilePicture: currentUser?.profilePicture,
          isOnline: true,
        },
        readBy: [],
        fileUrl: streamId,
      };

      setMessages(prev => {
        const updated = [...prev, streamMessage];
        if (selectedChat) {
          saveMessagesToStorage(selectedChat.id, updated);
        }
        return updated;
      });

    } catch (error) {
      console.error('Error starting live stream:', error);
      alert('Could not access camera/microphone. Please check permissions.');
    }
  };

  // Stop live streaming
  const stopLiveStream = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    setIsLiveStreaming(false);
    setShowLiveStreamModal(false);
    setLiveStreamUrl(null);

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // Notify chat members
    if (socket && socket.connected && selectedChat) {
      socket.emit('live:stop', {
        chatId: selectedChat.id,
        userId: getCurrentUserId(),
      });
    }
  };

  // Mark messages as read
  useEffect(() => {
    if (!selectedChat || !messages.length || !socket) return;

    const currentUserId = getCurrentUserId();
    const unreadMessages = messages.filter(msg => 
      msg.senderId !== currentUserId && 
      !msg.readBy?.includes(currentUserId || '')
    );

    if (unreadMessages.length > 0) {
      socket.emit('message:read', {
        chatId: selectedChat.id,
        messageIds: unreadMessages.map(m => m.id),
      });
      
      // Update messages locally
      setMessages(prev => {
        const updated = prev.map(msg => 
          unreadMessages.some(m => m.id === msg.id)
            ? { ...msg, readBy: [...(msg.readBy || []), currentUserId || ''] }
            : msg
        );
        saveMessagesToStorage(selectedChat.id, updated);
        return updated;
      });
    }
  }, [messages, selectedChat, socket]);

  const getChatName = (chat: Chat) => {
    if (chat.name) return chat.name;
    if (chat.type === 'direct' || chat.type === 'one-to-one') {
      const otherMember = chat.members.find(m => m.userId !== getCurrentUserId());
      return otherMember?.user.fullName || 'Unknown';
    }
    return 'Group Chat';
  };

  const getChatAvatar = (chat: Chat) => {
    if (chat.avatar) return chat.avatar;
    if (chat.type === 'direct' || chat.type === 'one-to-one') {
      const otherMember = chat.members.find(m => m.userId !== getCurrentUserId());
      return otherMember?.user.profilePicture;
    }
    return null;
  };

  const getChatInitials = (chat: Chat) => {
    const name = getChatName(chat);
    const words = name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const filteredChats = chats.filter(chat => {
    if (searchQuery) {
      const name = getChatName(chat).toLowerCase();
      return name.includes(searchQuery.toLowerCase());
    }
    
    if (chatFilter === 'unread') {
      return (chat.unreadCount || 0) > 0;
    }
    if (chatFilter === 'favorites') {
      return chat.isFavorite;
    }
    if (chatFilter === 'groups') {
      return chat.type === 'group' || chat.type === 'community';
    }
    return true;
  });

  // Sort chats: pinned first, then by last message time
  const sortedChats = [...filteredChats].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    const aTime = a.messages[0] ? new Date(a.messages[0].createdAt).getTime() : 0;
    const bTime = b.messages[0] ? new Date(b.messages[0].createdAt).getTime() : 0;
    return bTime - aTime;
  });

  const isMessageRead = (message: Message) => {
    if (message.senderId === getCurrentUserId()) {
      const otherMembers = selectedChat?.members.filter(m => m.userId !== getCurrentUserId()) || [];
      return otherMembers.every(m => message.readBy?.includes(m.userId));
    }
    return false;
  };

  // Handle theme mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle chat list resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !resizeRef.current) return;
      
      const diff = e.clientX - resizeRef.current.startX;
      const newWidth = Math.max(280, Math.min(600, resizeRef.current.startWidth + diff));
      setChatListWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      resizeRef.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    resizeRef.current = {
      startX: e.clientX,
      startWidth: chatListWidth,
    };
  };

  if (!mounted) {
    return null;
  }

  const isDark = theme === 'dark';
  const currentUser = getCurrentUser();

  return (
    <div className={`flex h-screen ${isDark ? 'bg-[#111b21]' : 'bg-gray-50'} ${isDark ? 'text-white' : 'text-gray-900'}`}>
      {/* Left Navigation Sidebar - WhatsApp Style */}
      <div className={`w-20 ${isDark ? 'bg-[#202c33]' : 'bg-white'} border-r ${isDark ? 'border-gray-700' : 'border-gray-200'} flex flex-col items-center py-4`}>
        <div className="relative mb-6">
          <div className={`w-12 h-12 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-300'} flex items-center justify-center overflow-hidden cursor-pointer`}>
            {currentUser?.profilePicture ? (
              <img src={currentUser.profilePicture} alt={currentUser.name} className="w-full h-full object-cover" />
            ) : (
              <User className={`w-6 h-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
            )}
          </div>
          {userCount > 0 && (
            <div className={`absolute -top-1 -right-1 min-w-[32px] h-7 bg-red-500 rounded-full flex items-center justify-center border-2 ${isDark ? 'border-[#202c33]' : 'border-white'} px-2 shadow-lg z-20`}>
              <span className="text-xs font-extrabold text-white leading-none whitespace-nowrap">
                {userCount > 99 ? '99+' : userCount}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => setActiveNav('status')}
            className={`p-3 rounded-lg transition-colors ${
              activeNav === 'status' 
                ? isDark ? 'bg-[#2a3942]' : 'bg-blue-100'
                : isDark ? 'hover:bg-[#2a3942]' : 'hover:bg-gray-100'
            }`}
            title="Status"
          >
            <CircleDot className={`w-6 h-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
          </button>
          <button
            onClick={() => setActiveNav('chats')}
            className={`p-3 rounded-lg transition-colors ${
              activeNav === 'chats' 
                ? isDark ? 'bg-[#2a3942]' : 'bg-blue-100'
                : isDark ? 'hover:bg-[#2a3942]' : 'hover:bg-gray-100'
            }`}
            title="Chats"
          >
            <MessageSquare className={`w-6 h-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
          </button>
          <button
            onClick={() => setActiveNav('groups')}
            className={`p-3 rounded-lg transition-colors ${
              activeNav === 'groups' 
                ? isDark ? 'bg-[#2a3942]' : 'bg-blue-100'
                : isDark ? 'hover:bg-[#2a3942]' : 'hover:bg-gray-100'
            }`}
            title="Groups"
          >
            <Users className={`w-6 h-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
          </button>
          <button
            onClick={() => setActiveNav('calls')}
            className={`p-3 rounded-lg transition-colors ${
              activeNav === 'calls' 
                ? isDark ? 'bg-[#2a3942]' : 'bg-blue-100'
                : isDark ? 'hover:bg-[#2a3942]' : 'hover:bg-gray-100'
            }`}
            title="Calls"
          >
            <PhoneCall className={`w-6 h-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
          </button>
          <button
            onClick={async () => {
              setActiveNav('contacts');
              // Reload users when contacts tab is clicked
              const token = getAuthToken();
              if (token) {
                try {
                  const countResponse = await fetch(`${API_BASE_URL}/api/users/count`, {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                    },
                  });
                  if (countResponse.ok) {
                    const countData = await countResponse.json();
                    setUserCount(countData.count || 0);
                  }

                  const usersResponse = await fetch(`${API_BASE_URL}/api/users`, {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                    },
                  });
                  if (usersResponse.ok) {
                    const usersData = await usersResponse.json();
                    setAllUsers(usersData || []);
                  }
                } catch (error) {
                  console.error('Error reloading users:', error);
                }
              }
            }}
            className={`p-3 rounded-lg transition-colors ${
              activeNav === 'contacts' 
                ? isDark ? 'bg-[#2a3942]' : 'bg-blue-100'
                : isDark ? 'hover:bg-[#2a3942]' : 'hover:bg-gray-100'
            }`}
            title="Contacts"
          >
            <ContactRound className={`w-6 h-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
          </button>
          <button
            onClick={() => {
              if (selectedChat) {
                startLiveStream();
              } else {
                alert('Please select a chat first to start live streaming');
              }
            }}
            className={`p-3 rounded-lg transition-colors ${
              isLiveStreaming
                ? 'bg-red-500 text-white'
                : activeNav === 'live' 
                  ? isDark ? 'bg-[#2a3942]' : 'bg-blue-100'
                  : isDark ? 'hover:bg-[#2a3942]' : 'hover:bg-gray-100'
            }`}
            title="Live Stream"
          >
            <Radio className={`w-6 h-6 ${isLiveStreaming ? 'text-white' : (isDark ? 'text-gray-300' : 'text-gray-600')}`} />
          </button>
          <button
            onClick={() => setActiveNav('enterprise')}
            className={`p-3 rounded-lg transition-colors ${
              activeNav === 'enterprise' 
                ? isDark ? 'bg-[#2a3942]' : 'bg-blue-100'
                : isDark ? 'hover:bg-[#2a3942]' : 'hover:bg-gray-100'
            }`}
            title="Enterprise"
          >
            <Building2 className={`w-6 h-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
          </button>
          <button
            onClick={() => setActiveNav('histories')}
            className={`p-3 rounded-lg transition-colors ${
              activeNav === 'histories' 
                ? isDark ? 'bg-[#2a3942]' : 'bg-blue-100'
                : isDark ? 'hover:bg-[#2a3942]' : 'hover:bg-gray-100'
            }`}
            title="Histories"
          >
            <History className={`w-6 h-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
          </button>
        </div>

        <div className="mt-auto flex flex-col gap-4">
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`p-3 rounded-lg transition-colors ${isDark ? 'hover:bg-[#2a3942]' : 'hover:bg-gray-100'}`}
            title={isDark ? 'Light mode' : 'Dark mode'}
          >
            {isDark ? (
              <Sun className="w-6 h-6 text-gray-300" />
            ) : (
              <Moon className="w-6 h-6 text-gray-600" />
            )}
          </button>
          <button 
            onClick={() => setShowSettingsSidebar(true)}
            className={`p-3 rounded-lg transition-colors ${isDark ? 'hover:bg-[#2a3942]' : 'hover:bg-gray-100'}`} 
            title="Settings"
          >
            <Settings className={`w-6 h-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
          </button>
        </div>
      </div>

      {/* Middle Section - Chat List */}
      <div 
        className={`${isDark ? 'bg-[#111b21]' : 'bg-white'} flex flex-col relative`}
        style={{ width: `${chatListWidth}px`, minWidth: '280px', maxWidth: '600px' }}
      >
        {/* Resize Handle */}
        <div
          onMouseDown={handleResizeStart}
          className={`absolute right-0 top-0 bottom-0 w-1 ${isDark ? 'hover:bg-blue-500' : 'hover:bg-blue-400'} transition-colors z-10 cursor-col-resize ${
            isResizing ? (isDark ? 'bg-blue-500' : 'bg-blue-400') : (isDark ? 'bg-transparent' : 'bg-transparent')
          }`}
          title="Drag to resize chat list"
        />
        {/* Top Bar */}
        <div className={`h-16 ${isDark ? 'bg-[#202c33]' : 'bg-gray-100'} px-4 flex items-center justify-between`}>
          <h1 className={`${chatListWidth < 320 ? 'text-sm' : 'text-lg'} font-semibold truncate ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
            {chatListWidth < 280 ? 'IRU' : 'IRU Chat'}
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewChatModal(true)}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-[#2a3942]' : 'hover:bg-gray-200'}`}
            >
              <Plus className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
            </button>
            <button className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-[#2a3942]' : 'hover:bg-gray-200'}`}>
              <MoreVertical className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className={`${chatListWidth < 320 ? 'px-2' : 'px-3'} py-2 ${isDark ? 'bg-[#111b21]' : 'bg-white'}`}>
          <div className={`relative ${isDark ? 'bg-[#202c33]' : 'bg-gray-100'} rounded-lg`}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={chatListWidth < 320 ? "Search..." : "Search or start a new chat"}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${chatListWidth < 320 ? 'pl-9 pr-2' : 'pl-10 pr-4'} py-2 ${isDark ? 'bg-[#202c33] text-gray-200' : 'bg-gray-100 text-gray-900'} rounded-lg text-sm placeholder-gray-400 focus:outline-none`}
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className={`${chatListWidth < 320 ? 'px-2' : 'px-3'} pb-2 ${isDark ? 'bg-[#111b21]' : 'bg-white'} border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className={`flex gap-1 ${chatListWidth < 320 ? 'overflow-x-auto scrollbar-hide' : ''}`}>
            {(['all', 'unread', 'favorites', 'groups'] as const).map((filter) => {
              // Calculate padding based on width
              const paddingX = chatListWidth < 280 ? 'px-2' : chatListWidth < 320 ? 'px-2.5' : 'px-4';
              const textSize = chatListWidth < 280 ? 'text-xs' : chatListWidth < 350 ? 'text-xs' : 'text-sm';
              
              return (
                <button
                  key={filter}
                  onClick={() => setChatFilter(filter)}
                  className={`${paddingX} py-2 rounded-lg ${textSize} font-medium transition-colors capitalize flex items-center flex-shrink-0 whitespace-nowrap ${
                    chatFilter === filter
                      ? isDark ? 'bg-[#2a3942] text-gray-200' : 'bg-blue-100 text-blue-700'
                      : isDark ? 'text-gray-400 hover:bg-[#202c33]' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat List or Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {activeNav === 'contacts' ? (
            // Contacts View - Show all users
            allUsers.length === 0 ? (
              <div className={`p-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                No users found
              </div>
            ) : (
              allUsers
                .filter(user => {
                  if (!searchQuery) return true;
                  const query = searchQuery.toLowerCase();
                  return (
                    user.fullName.toLowerCase().includes(query) ||
                    user.email?.toLowerCase().includes(query) ||
                    user.username?.toLowerCase().includes(query)
                  );
                })
                .map((user) => {
                  const handleUserClick = async () => {
                    try {
                      const token = getAuthToken();
                      if (!token) return;

                      // Check if chat already exists with this user
                      const existingChat = chats.find(chat => 
                        chat.type === 'one-to-one' && 
                        chat.members.some(m => m.userId === user.id)
                      );

                      if (existingChat) {
                        setSelectedChat(existingChat);
                        setActiveNav('chats');
                        return;
                      }

                      // Create new chat with this user
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
                        // Reload chats to get the new one
                        const chatsResponse = await fetch(`${API_BASE_URL}/api/chats`, {
                          headers: {
                            'Authorization': `Bearer ${token}`,
                          },
                        });
                        if (chatsResponse.ok) {
                          const chatsData = await chatsResponse.json();
                          const formattedChats: Chat[] = (chatsData || []).map((chat: any) => ({
                            ...chat,
                            messages: chat.messages || [],
                            members: chat.members || [],
                          }));
                          setChats(formattedChats);
                          const createdChat = formattedChats.find(c => c.id === newChat.id);
                          if (createdChat) {
                            setSelectedChat(createdChat);
                            setActiveNav('chats');
                          }
                        }
                      }
                    } catch (error) {
                      console.error('Error creating chat:', error);
                    }
                  };

                  return (
                    <div
                      key={user.id}
                      onClick={handleUserClick}
                      className={`${chatListWidth < 320 ? 'px-2' : 'px-4'} py-3 cursor-pointer transition-colors border-b ${isDark ? 'border-gray-800' : 'border-gray-100'} ${
                        isDark ? 'hover:bg-[#202c33]' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`flex items-start ${chatListWidth < 320 ? 'gap-2' : 'gap-3'}`}>
                        <div className="relative flex-shrink-0">
                          <div className={`${chatListWidth < 320 ? 'w-10 h-10' : 'w-12 h-12'} rounded-full flex items-center justify-center overflow-hidden bg-gray-600`}>
                            {user.profilePicture ? (
                              <img src={user.profilePicture} alt={user.fullName} className="w-full h-full object-cover" />
                            ) : (
                              <span className={`text-white font-semibold ${chatListWidth < 320 ? 'text-xs' : 'text-sm'}`}>
                                {user.fullName.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          {user.isOnline && (
                            <div className={`absolute bottom-0 right-0 ${chatListWidth < 320 ? 'w-2.5 h-2.5' : 'w-3 h-3'} bg-green-500 rounded-full border-2 ${isDark ? 'border-[#111b21]' : 'border-white'}`} />
                          )}
                        </div>
                        {chatListWidth >= 280 && (
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className={`font-medium text-sm truncate ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                                {user.fullName}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2">
                              <p className={`text-sm truncate flex-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {user.username ? `@${user.username}` : user.email}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
            )
          ) : (
            // Chats View
            sortedChats.map((chat) => {
            const lastMessage = chat.messages[0];
            const isSelected = selectedChat?.id === chat.id;
            const avatar = getChatAvatar(chat);
            const initials = getChatInitials(chat);

            return (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`${chatListWidth < 320 ? 'px-2' : 'px-4'} py-3 cursor-pointer transition-colors border-b ${isDark ? 'border-gray-800' : 'border-gray-100'} ${
                  isSelected 
                    ? isDark ? 'bg-[#2a3942]' : 'bg-blue-50'
                    : isDark ? 'hover:bg-[#202c33]' : 'hover:bg-gray-50'
                }`}
              >
                <div className={`flex items-start ${chatListWidth < 320 ? 'gap-2' : 'gap-3'}`}>
                  <div className="relative flex-shrink-0">
                    <div className={`${chatListWidth < 320 ? 'w-10 h-10' : 'w-12 h-12'} rounded-full flex items-center justify-center overflow-hidden ${
                      chat.type === 'one-to-one' ? 'bg-gray-600' :
                      chat.type === 'group' ? 'bg-green-600' :
                      'bg-purple-600'
                    }`}>
                      {avatar ? (
                        <img src={avatar} alt={getChatName(chat)} className="w-full h-full object-cover" />
                      ) : (
                        <span className={`text-white font-semibold ${chatListWidth < 320 ? 'text-xs' : 'text-sm'}`}>{initials}</span>
                      )}
                    </div>
                    {chat.isPinned && (
                      <Pin className={`absolute -bottom-1 -right-1 w-3 h-3 text-gray-400 ${isDark ? 'bg-[#111b21]' : 'bg-white'} rounded-full p-0.5`} />
                    )}
                  </div>
                  {chatListWidth >= 280 ? (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-medium text-sm truncate ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                          {getChatName(chat)}
                        </h3>
                        {lastMessage && (
                          <span className={`text-xs ml-2 whitespace-nowrap flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {format(new Date(lastMessage.createdAt), 'h:mm a')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {lastMessage && (
                          <>
                            {lastMessage.senderId === getCurrentUserId() && (
                              <span className="text-xs flex-shrink-0">
                                {isMessageRead(lastMessage) ? (
                                  <span className={isDark ? 'text-blue-400' : 'text-blue-600'}>✓✓</span>
                                ) : (
                                  <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>✓</span>
                                )}
                              </span>
                            )}
                            {lastMessage.type === 'file' && (
                              <Paperclip className={`w-3 h-3 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                            )}
                            {lastMessage.type === 'live_stream' && (
                              <Radio className={`w-3 h-3 flex-shrink-0 text-red-500 animate-pulse ${isDark ? '' : ''}`} />
                            )}
                            <p className={`text-sm truncate flex-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {lastMessage.type === 'image' ? '📷 Image' : 
                               lastMessage.type === 'video' ? '🎥 Video' :
                               lastMessage.type === 'live_stream' ? '🔴 Live Stream' :
                               lastMessage.type === 'file' ? lastMessage.fileName || lastMessage.content :
                               lastMessage.content}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    // Very narrow view - show only avatar with tooltip
                    <div className="flex-1 min-w-0" title={getChatName(chat)}>
                      {chat.unreadCount && chat.unreadCount > 0 && (
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                      )}
                    </div>
                  )}
                  {chat.unreadCount && chat.unreadCount > 0 && (
                    <div className={`${chatListWidth < 320 ? 'w-4 h-4' : 'w-5 h-5'} bg-green-500 rounded-full flex items-center justify-center flex-shrink-0`}>
                      <span className={`${chatListWidth < 320 ? 'text-[10px]' : 'text-xs'} font-semibold text-white`}>{chat.unreadCount}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
          )}
        </div>
      </div>

      {/* Right Section - Chat View */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className={`h-16 ${isDark ? 'bg-[#202c33]' : 'bg-gray-100'} border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between px-4`}>
              <div className="flex items-center gap-3">
                <div                 className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ${
                  (selectedChat.type === 'one-to-one' || selectedChat.type === 'direct') ? 'bg-gray-600' : 'bg-green-600'
                }`}>
                  {getChatAvatar(selectedChat) ? (
                    <img src={getChatAvatar(selectedChat)} alt={getChatName(selectedChat)} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-semibold text-sm">{getChatInitials(selectedChat)}</span>
                  )}
                </div>
                <div>
                  <h3 className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{getChatName(selectedChat)}</h3>
                  {(selectedChat.type === 'one-to-one' || selectedChat.type === 'direct') && (
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {selectedChat.members.find(m => m.userId !== getCurrentUserId())?.user.isOnline 
                        ? 'online' 
                        : 'offline'}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={isLiveStreaming ? stopLiveStream : startLiveStream}
                  className={`p-2 rounded-lg transition-colors ${
                    isLiveStreaming 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : isDark ? 'hover:bg-[#2a3942]' : 'hover:bg-gray-200'
                  }`}
                  title={isLiveStreaming ? 'Stop Live Stream' : 'Start Live Stream'}
                >
                  <Radio className={`w-5 h-5 ${isLiveStreaming ? 'text-white' : (isDark ? 'text-gray-300' : 'text-gray-600')}`} />
                </button>
                <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-[#2a3942]' : 'hover:bg-gray-200'}`}>
                  <Video className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
                </button>
                <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-[#2a3942]' : 'hover:bg-gray-200'}`}>
                  <Phone className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
                </button>
                <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-[#2a3942]' : 'hover:bg-gray-200'}`}>
                  <Search className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
                </button>
                <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-[#2a3942]' : 'hover:bg-gray-200'}`}>
                  <MoreVertical className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div 
              className={`flex-1 overflow-y-auto p-4 ${isDark ? 'bg-[#0b141a]' : 'bg-[#efeae2]'}`}
              style={{
                backgroundImage: isDark 
                  ? 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'grid\' width=\'100\' height=\'100\' patternUnits=\'userSpaceOnUse\'%3E%3Cpath d=\'M 100 0 L 0 0 0 100\' fill=\'none\' stroke=\'%23333\' stroke-width=\'0.5\' opacity=\'0.1\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100\' height=\'100\' fill=\'url(%23grid)\'/%3E%3C/svg%3E")'
                  : 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
              }}
            >
              {messages.map((message) => {
                const isOwn = message.senderId === getCurrentUserId();
                const isRead = isMessageRead(message);

                return (
                  <div
                    key={message.id}
                    className={`flex gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`flex flex-col max-w-[65%] ${isOwn ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`rounded-lg px-3 py-1.5 shadow-sm ${
                          isOwn
                            ? isDark ? 'bg-[#005c4b] text-white' : 'bg-[#dcf8c6] text-gray-900'
                            : isDark ? 'bg-[#202c33] text-gray-200' : 'bg-white text-gray-900 border border-gray-200'
                        } ${isOwn ? 'rounded-tr-none' : 'rounded-tl-none'}`}
                      >
                        {message.type === 'image' && message.fileUrl && (
                          <img src={message.fileUrl} alt={message.content} className="max-w-full rounded-lg mb-1 max-h-64 object-cover" />
                        )}
                        {message.type === 'video' && message.fileUrl && (
                          <video src={message.fileUrl} controls className="max-w-full rounded-lg mb-1 max-h-64" />
                        )}
                        {message.type === 'audio' && message.fileUrl && (
                          <div className="flex items-center gap-2 mb-1">
                            <audio src={message.fileUrl} controls className="max-w-full" />
                          </div>
                        )}
                        {message.type === 'file' && (
                          <div className="flex items-center gap-2 mb-1">
                            <Paperclip className="w-4 h-4" />
                            <span className="text-sm">{message.fileName || message.content}</span>
                          </div>
                        )}
                        {message.type === 'live_stream' && (
                          <div className="flex items-center gap-2 mb-1 p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                            <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{message.content}</p>
                              {message.fileUrl && (
                                <button
                                  onClick={() => {
                                    // In production, this would open the stream viewer
                                    alert(`Join stream: ${message.fileUrl}`);
                                  }}
                                  className="mt-1 text-xs text-red-500 hover:text-red-600 underline"
                                >
                                  Join Stream
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                        {message.type !== 'image' && message.type !== 'video' && message.type !== 'audio' && message.type !== 'live_stream' && (
                          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                        )}
                      </div>
                      <div className={`flex items-center gap-1 mt-0.5 px-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                          {format(new Date(message.createdAt), 'h:mm a')}
                        </span>
                        {isOwn && (
                          <span className="text-xs">
                            {isRead ? (
                              <span className={isDark ? 'text-blue-400' : 'text-blue-600'}>✓✓</span>
                            ) : (
                              <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>✓</span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {typingUsers.size > 0 && (
                <div className="flex gap-2 mb-1">
                  <div className={`rounded-lg rounded-tl-none px-3 py-1.5 ${isDark ? 'bg-[#202c33]' : 'bg-white'}`}>
                    <div className="flex gap-1">
                      <div className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-gray-400' : 'bg-gray-500'}`} style={{ animationDelay: '0ms' }} />
                      <div className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-gray-400' : 'bg-gray-500'}`} style={{ animationDelay: '150ms' }} />
                      <div className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-gray-400' : 'bg-gray-500'}`} style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Area */}
            <form 
              onSubmit={handleSendMessage}
              className={`h-16 ${isDark ? 'bg-[#202c33]' : 'bg-gray-100'} border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} px-4 flex items-center gap-2`}
            >
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-[#2a3942]' : 'hover:bg-gray-200'}`}
              >
                <Plus className={`w-6 h-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                multiple={false}
                className="hidden"
              />
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e as any);
                  }
                }}
                placeholder="Type a message"
                className={`flex-1 px-4 py-2 ${isDark ? 'bg-[#2a3942] text-gray-200' : 'bg-white text-gray-900'} rounded-lg text-sm placeholder-gray-400 focus:outline-none`}
              />
              {isRecording ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-red-500 text-white">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-sm font-medium">{formatRecordingTime(recordingTime)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={sendVoiceMessage}
                    className={`p-2 rounded-lg ${isDark ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`}
                  >
                    <Send className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={cancelRecording}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-[#2a3942]' : 'hover:bg-gray-200'}`}
                  >
                    <X className={`w-6 h-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
                  </button>
                </>
              ) : audioBlob ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-600 text-white">
                    <Mic className="w-4 h-4" />
                    <span className="text-sm">{formatRecordingTime(recordingTime)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={sendVoiceMessage}
                    className={`p-2 rounded-lg ${isDark ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`}
                  >
                    <Send className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={cancelRecording}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-[#2a3942]' : 'hover:bg-gray-200'}`}
                  >
                    <X className={`w-6 h-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
                  </button>
                </>
              ) : inputValue.trim() || selectedFile ? (
                <button
                  type="submit"
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-[#2a3942]' : 'hover:bg-gray-200'}`}
                >
                  <Send className={`w-6 h-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
                </button>
              ) : (
                <button 
                  type="button"
                  onClick={() => {
                    if (isRecording) {
                      stopRecording();
                    } else {
                      startRecording();
                    }
                  }}
                  className={`p-2 rounded-lg ${isRecording ? (isDark ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600') : (isDark ? 'hover:bg-[#2a3942]' : 'hover:bg-gray-200')} ${isRecording ? 'text-white' : ''}`}
                >
                  <Mic className={`w-6 h-6 ${isRecording ? 'text-white' : (isDark ? 'text-gray-300' : 'text-gray-600')}`} />
                </button>
              )}
            </form>
          </>
        ) : (
          <div className={`flex-1 flex items-center justify-center ${isDark ? 'bg-[#0b141a]' : 'bg-[#efeae2]'}`}>
            <div className="text-center">
              <MessageSquare className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Select a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onChatCreated={async (chatId) => {
          try {
            const token = getAuthToken();
            if (!token) return;
            
            // Reload chats from API
            const response = await fetch(`${API_BASE_URL}/api/chats`, {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            
            if (response.ok) {
              const apiChats = await response.json();
              
              // Merge with existing chats
              const chatMap = new Map<string, Chat>();
              chats.forEach(chat => chatMap.set(chat.id, chat));
              
              apiChats.forEach((chat: Chat) => {
                const existing = chatMap.get(chat.id);
                if (existing) {
                  // Merge messages
                  const mergedMessages = mergeMessages(existing.messages, chat.messages);
                  chatMap.set(chat.id, { ...existing, ...chat, messages: mergedMessages });
                } else {
                  chatMap.set(chat.id, chat);
                }
              });
              
              const updatedChats = Array.from(chatMap.values());
              setChats(updatedChats);
              saveChatsToStorage(updatedChats);
              
              // Select the newly created chat
              const newChat = updatedChats.find((c: Chat) => c.id === chatId);
              if (newChat) {
                setSelectedChat(newChat);
                
                // Load messages for the new chat
                try {
                  const messagesResponse = await fetch(`${API_BASE_URL}/api/chats/${chatId}/messages`, {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                    },
                  });
                  
                  if (messagesResponse.ok) {
                    const messagesData = await messagesResponse.json();
                    const formattedMessages = messagesData.messages?.map((msg: any) => ({
                      ...msg,
                      sender: msg.sender || newChat.members.find((m: any) => m.userId === msg.senderId)?.user,
                    })) || [];
                    setMessages(formattedMessages);
                    saveMessagesToStorage(chatId, formattedMessages);
                  }
                } catch (error) {
                  console.error('Error loading messages:', error);
                }
              }
            }
          } catch (error) {
            console.error('Error loading chats:', error);
          }
        }}
      />

      {/* Settings Sidebar */}
      <SettingsSidebar
        isOpen={showSettingsSidebar}
        onClose={() => setShowSettingsSidebar(false)}
        isDark={isDark}
      />

      {/* Live Stream Modal */}
      {showLiveStreamModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <div className={`${isDark ? 'bg-[#202c33]' : 'bg-white'} rounded-lg shadow-2xl w-full max-w-4xl mx-4 overflow-hidden`}>
            <div className={`h-12 ${isDark ? 'bg-[#2a3942]' : 'bg-gray-100'} px-4 flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Live Stream</span>
                {liveStreamUrl && (
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Stream ID: {liveStreamUrl}
                  </span>
                )}
              </div>
              <button
                onClick={stopLiveStream}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-[#2a3942]' : 'hover:bg-gray-200'}`}
              >
                <X className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
              </button>
            </div>
            
            <div className="relative bg-black aspect-video">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              {!localStream && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Radio className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-pulse" />
                    <p className="text-gray-400">Starting stream...</p>
                  </div>
                </div>
              )}
              
              {/* Stream Controls Overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-black/60 rounded-lg backdrop-blur-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-white text-sm font-medium">LIVE</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (localStream) {
                        const videoTrack = localStream.getVideoTracks()[0];
                        if (videoTrack) {
                          videoTrack.enabled = !videoTrack.enabled;
                        }
                      }
                    }}
                    className="p-2 bg-black/60 rounded-lg backdrop-blur-sm hover:bg-black/80 transition-colors"
                    title="Toggle Camera"
                  >
                    <Video className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={() => {
                      if (localStream) {
                        const audioTrack = localStream.getAudioTracks()[0];
                        if (audioTrack) {
                          audioTrack.enabled = !audioTrack.enabled;
                        }
                      }
                    }}
                    className="p-2 bg-black/60 rounded-lg backdrop-blur-sm hover:bg-black/80 transition-colors"
                    title="Toggle Microphone"
                  >
                    <Mic className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={stopLiveStream}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white font-medium transition-colors"
                  >
                    End Stream
                  </button>
                </div>
              </div>
            </div>

            <div className={`p-4 ${isDark ? 'bg-[#202c33]' : 'bg-gray-50'}`}>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Share this stream with others in the chat. They can join and watch your live stream.
              </p>
              {liveStreamUrl && (
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="text"
                    value={liveStreamUrl}
                    readOnly
                    className={`flex-1 px-3 py-2 ${isDark ? 'bg-[#2a3942] text-gray-200' : 'bg-white text-gray-900'} rounded-lg text-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(liveStreamUrl);
                      alert('Stream URL copied to clipboard!');
                    }}
                    className={`px-4 py-2 ${isDark ? 'bg-[#2a3942] hover:bg-[#2a3942]' : 'bg-gray-200 hover:bg-gray-300'} rounded-lg text-sm font-medium transition-colors`}
                  >
                    Copy
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
