import React, { useState, useEffect, useRef } from 'react';
import { Search, MessageSquare, FolderKanban, FileText, Users, History, Settings, HelpCircle, Plus, Paperclip, Mic, FileSearch, Send, Menu, X, Zap, Gift, User, MoreVertical, Moon, Sun, Brain, Shield, Globe, BarChart, Video, FileSignature, Languages, Hash, Calendar, BellOff, Eye, EyeOff, Lock, ScanLine, Threads, Edit2, Trash2, Save, Download, Upload } from 'lucide-react';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  feature?: string;
  files?: File[];
  imageUrl?: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  content?: string;
  createdAt: string;
}

interface Document {
  id: string;
  name: string;
  size: string;
  date: string;
  type: string;
  content?: string;
}

interface CommunityChannel {
  id: string;
  name: string;
  members: number;
  unread: number;
  description?: string;
}

interface ChatHistoryItem {
  id: string;
  title: string;
  lastMessage: string;
  time: string;
  messages: Message[];
  createdAt: string;
}

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<'welcome' | 'chat' | 'projects' | 'templates' | 'documents' | 'community' | 'history' | 'settings' | 'help'>('welcome');
  const [activeNav, setActiveNav] = useState<'chat' | 'projects' | 'templates' | 'documents' | 'community' | 'history' | 'settings' | 'help'>('chat');
  const [charCount, setCharCount] = useState(20);
  const [darkMode, setDarkMode] = useState(false);
  const [showFeaturesMenu, setShowFeaturesMenu] = useState(false);
  const [stealthMode, setStealthMode] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showPromptsMenu, setShowPromptsMenu] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  
  // History CRUD States (only History has CRUD)
  const [selectedHistory, setSelectedHistory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get user info - only return data if logged in
  const getUserInfo = () => {
    try {
      const authData = localStorage.getItem('iru-auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        if (parsed.user) {
          return {
            name: parsed.user?.name || 'User',
            email: parsed.user?.email || ''
          };
        }
      }
    } catch (e) {
      // Ignore errors
    }
    return null;
  };

  const userInfo = getUserInfo();

  // Load data from localStorage
  const loadData = <T,>(key: string, defaultValue: T[]): T[] => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(`Error loading ${key}:`, e);
    }
    return defaultValue;
  };

  const saveData = <T,>(key: string, data: T[]) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Error saving ${key}:`, e);
    }
  };

  // Projects with CRUD
  const [projects, setProjects] = useState<Project[]>(() => 
    loadData<Project>('iru-chatbot-projects', [
      { id: '1', title: 'Learning From 100 Years o...', description: 'For athletes, high altitude prod....', createdAt: new Date().toISOString() },
      { id: '2', title: 'Research officiants', description: "Maxwell's equations-the foun....", createdAt: new Date().toISOString() },
      { id: '3', title: 'What does a senior lead de...', description: 'Physiological respiration involv..', createdAt: new Date().toISOString() },
      { id: '4', title: 'Write a sweet note to your...', description: 'In the eighteenth century the G..', createdAt: new Date().toISOString() },
      { id: '5', title: 'Meet with cake bakers', description: 'Physical space is often conceiv...', createdAt: new Date().toISOString() },
      { id: '6', title: 'Meet with cake bakers', description: 'Physical space is often conceiv...', createdAt: new Date().toISOString() },
    ])
  );

  // Templates with CRUD
  const [templates, setTemplates] = useState<Template[]>(() =>
    loadData<Template>('iru-chatbot-templates', [
      { id: '1', name: 'Email Template', category: 'Communication', description: 'Professional email templates', createdAt: new Date().toISOString() },
      { id: '2', name: 'Meeting Notes', category: 'Business', description: 'Structured meeting notes template', createdAt: new Date().toISOString() },
      { id: '3', name: 'Project Proposal', category: 'Business', description: 'Comprehensive project proposal template', createdAt: new Date().toISOString() },
      { id: '4', name: 'Code Snippet', category: 'Development', description: 'Reusable code templates', createdAt: new Date().toISOString() },
    ])
  );

  // Documents with CRUD
  const [documents, setDocuments] = useState<Document[]>(() =>
    loadData<Document>('iru-chatbot-documents', [
      { id: '1', name: 'Project Plan.pdf', size: '2.4 MB', date: '2024-01-15', type: 'application/pdf' },
      { id: '2', name: 'Meeting Notes.docx', size: '156 KB', date: '2024-01-14', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
      { id: '3', name: 'Contract.pdf', size: '1.2 MB', date: '2024-01-13', type: 'application/pdf' },
    ])
  );

  // Community channels with CRUD
  const [communityChannels, setCommunityChannels] = useState<CommunityChannel[]>(() =>
    loadData<CommunityChannel>('iru-chatbot-community', [
      { id: '1', name: 'General Discussion', members: 1250, unread: 5, description: 'General discussions and questions' },
      { id: '2', name: 'Tech Updates', members: 890, unread: 2, description: 'Latest technology updates and news' },
      { id: '3', name: 'Announcements', members: 2100, unread: 0, description: 'Important announcements and updates' },
    ])
  );

  // Chat history with full conversation storage
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>(() =>
    loadData<ChatHistoryItem>('iru-chatbot-history', [
      { 
        id: '1', 
        title: 'Project Discussion', 
        lastMessage: 'Thanks for the update!', 
        time: '2 hours ago',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        messages: [
          { id: '1', text: 'Let\'s discuss the project timeline', sender: 'user', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
          { id: '2', text: 'Sure! What would you like to know?', sender: 'assistant', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 1000) },
          { id: '3', text: 'Thanks for the update!', sender: 'user', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 2000) },
        ]
      },
      { 
        id: '2', 
        title: 'Team Meeting', 
        lastMessage: 'Meeting scheduled for tomorrow', 
        time: '1 day ago',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        messages: [
          { id: '1', text: 'Can we schedule a team meeting?', sender: 'user', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          { id: '2', text: 'Meeting scheduled for tomorrow', sender: 'assistant', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 1000) },
        ]
      },
      { 
        id: '3', 
        title: 'Client Feedback', 
        lastMessage: 'Great work on the design', 
        time: '3 days ago',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        messages: [
          { id: '1', text: 'What did the client say?', sender: 'user', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
          { id: '2', text: 'Great work on the design', sender: 'assistant', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 1000) },
        ]
      },
    ])
  );

  // Save data to localStorage whenever it changes
  useEffect(() => {
    saveData('iru-chatbot-projects', projects);
  }, [projects]);

  useEffect(() => {
    saveData('iru-chatbot-templates', templates);
  }, [templates]);

  useEffect(() => {
    saveData('iru-chatbot-documents', documents);
  }, [documents]);

  useEffect(() => {
    saveData('iru-chatbot-community', communityChannels);
  }, [communityChannels]);

  useEffect(() => {
    saveData('iru-chatbot-history', chatHistory);
  }, [chatHistory]);

  // Prompt templates
  const promptTemplates = [
    'Summarize this conversation',
    'Translate to French',
    'Create a meeting summary',
    'Generate project plan',
    'Write professional email',
    'Explain this concept',
    'Create code snippet',
    'Generate documentation',
  ];

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Listen for settings open event from header
  useEffect(() => {
    const handleOpenSettings = () => {
      setActiveView('settings');
      setActiveNav('settings');
    };
    window.addEventListener('openChatbotSettings', handleOpenSettings);
    return () => {
      window.removeEventListener('openChatbotSettings', handleOpenSettings);
    };
  }, []);

  // Load messages from localStorage on mount
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem('iru-chatbot-messages');
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(messagesWithDates);
        if (messagesWithDates.length > 0) {
          setActiveView('chat');
        }
      }
    } catch (e) {
      console.error('Error loading messages from localStorage:', e);
    }

    // Check for feature query from Features page
    const featureQuery = localStorage.getItem('chatbot-feature-query');
    if (featureQuery) {
      try {
        const parsed = JSON.parse(featureQuery);
        if (Date.now() - parsed.timestamp < 10000) {
          const featureMessage = `Tell me more about ${parsed.name}: ${parsed.description}`;
          setInputValue(featureMessage);
          setActiveView('chat');
          localStorage.removeItem('chatbot-feature-query');
        }
      } catch (e) {
        // Ignore errors
      }
    }
  }, []);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    try {
      // Convert File objects to serializable format
      const serializableMessages = messages.map(msg => {
        if (msg.files && msg.files.length > 0) {
          // Store file metadata instead of File objects
          const fileMetadata = msg.files.map(file => ({
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
          }));
          return {
            ...msg,
            files: fileMetadata,
            // Keep imageUrl as it's already a string
          };
        }
        return msg;
      });
      localStorage.setItem('iru-chatbot-messages', JSON.stringify(serializableMessages));

      // Auto-save to history if there are messages and not already saved
      if (messages.length > 0 && !selectedHistory) {
        const title = messages[0]?.text.substring(0, 30) || 'New Conversation';
        const lastMessage = messages[messages.length - 1]?.text || '';
        
        // Check if this conversation already exists in history
        const existingHistory = chatHistory.find(h => 
          h.title === title && h.messages.length === messages.length
        );
        
        if (!existingHistory) {
          const timeAgo = 'Just now';
          const newHistory: ChatHistoryItem = {
            id: Date.now().toString(),
            title,
            lastMessage,
            time: timeAgo,
            messages: serializableMessages.map(msg => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            })),
            createdAt: new Date().toISOString(),
          };
          
          setChatHistory(prev => {
            // Remove old auto-saved entries and add new one
            const filtered = prev.filter(h => h.id !== 'auto-save');
            return [newHistory, ...filtered].slice(0, 50); // Keep last 50
          });
        }
      }
    } catch (e) {
      console.error('Error saving messages to localStorage:', e);
    }
  }, [messages, selectedHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
    setCharCount(inputValue.length || 20);
  }, [inputValue]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || inputValue.length > 3000) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    const userInput = inputValue;
    setInputValue('');
    setCharCount(20);
    setActiveView('chat');
    setIsTyping(true);

    // Simulate AI response with feature detection
    setTimeout(() => {
      setIsTyping(false);
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(userInput),
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000 + Math.random() * 1500);
  };

  const generateBotResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();
    
    // Feature-specific responses
    if (lowerInput.includes('summarize') || lowerInput.includes('summary') || lowerInput.includes('meeting summary')) {
      return '📋 **Smart Meeting Summary Generated**\n\n✅ Action Points:\n1. Review design specifications\n2. Assign team members\n3. Schedule follow-up meeting\n\n💡 This summary was created using AI-Powered Conversation Intelligence. All key points and action items have been automatically extracted.';
    }
    
    if (lowerInput.includes('sentiment') || lowerInput.includes('mood') || lowerInput.includes('feeling')) {
      return '😊 **Sentiment Analysis**\n\nCurrent conversation sentiment: **Positive**\nEngagement level: **High**\n\n💡 Sentiment Insights detected a positive mood. This helps us provide better, more empathetic responses.';
    }
    
    if (lowerInput.includes('context') || lowerInput.includes('remember') || lowerInput.includes('history')) {
      return '🧠 **Context Memory Active**\n\nI remember our previous conversations about:\n• Project requirements\n• Team preferences\n• Previous decisions\n\n💡 Context Memory AI ensures I provide relevant responses based on our conversation history.';
    }
    
    if (lowerInput.includes('self-destruct') || lowerInput.includes('confidential') || lowerInput.includes('secure room')) {
      return '🔒 **Self-Destructing Room Created**\n\nThis conversation will automatically delete in 24 hours.\nAll messages are encrypted end-to-end.\n\n💡 Multi-Layer Privacy & Security: Your sensitive conversations are protected with automatic deletion.';
    }
    
    if (lowerInput.includes('stealth') || lowerInput.includes('private mode')) {
      setStealthMode(true);
      return '👁️ **Stealth Mode Activated**\n\nYour app is now disguised. All notifications are hidden.\n\n💡 Stealth Mode helps you communicate privately without detection.';
    }
    
    if (lowerInput.includes('space') || lowerInput.includes('workspace') || lowerInput.includes('project space')) {
      return '🚀 **Space Created Successfully**\n\nYour new space includes:\n• Dedicated chat channel\n• File storage (10GB)\n• Collaboration tools\n• Meeting room access\n\n💡 Space Hosting: Create virtual spaces for projects, events, or departments.';
    }
    
    if (lowerInput.includes('meeting') || lowerInput.includes('video call') || lowerInput.includes('live meeting')) {
      return '📹 **Live Meeting Ready**\n\nStarting high-quality video/audio meeting...\n• HD video quality\n• Crystal clear audio\n• Screen sharing available\n• Recording enabled\n\n💡 Live Meetings: High-quality meetings directly inside IRU Chat without third-party apps.';
    }
    
    if (lowerInput.includes('sign') || lowerInput.includes('contract') || lowerInput.includes('document signing')) {
      return '✍️ **Document Signing**\n\nReady to sign documents:\n• Legal contracts\n• Agreements\n• Forms\n\n💡 Contract & Document Signing: Legally sign files right in the chat.';
    }
    
    if (lowerInput.includes('voice') && lowerInput.includes('task')) {
      return '🎙️ **Voice-to-Task Conversion**\n\nYour voice message has been converted to:\n✅ Task: Review project proposal\n📅 Due: Tomorrow\n👤 Assignee: Team Lead\n\n💡 Voice-to-Task Conversion: Turn voice messages into trackable tasks automatically.';
    }
    
    if (lowerInput.includes('community') || lowerInput.includes('channel') || lowerInput.includes('broadcast')) {
      return '📢 **Community Features**\n\nAvailable options:\n• Create community channel\n• Send broadcast message\n• Join interest-based community\n\n💡 Community & Broadcast Messaging: Large-scale discussion areas and unlimited subscriber broadcasts.';
    }
    
    if (lowerInput.includes('translate') || lowerInput.includes('translation') || lowerInput.includes('multilingual')) {
      return '🌐 **Real-Time Translation Active**\n\nSupported languages:\n• English, French, Spanish, Kinyarwanda\n• 50+ languages\n\n💡 Live Chat Translation: Instant text or voice translation for global teams.';
    }
    
    if (lowerInput.includes('search') && (lowerInput.includes('file') || lowerInput.includes('media') || lowerInput.includes('image'))) {
      return '🔍 **AI Search in Files & Media**\n\nSearching through:\n• Images\n• Audio files\n• Documents\n\n💡 AI Search: Find exact details inside images, audio, or documents instantly.';
    }
    
    if (lowerInput.includes('scan') || lowerInput.includes('document scanner')) {
      return '📄 **Smart Document Scanner**\n\nReady to scan:\n• Documents\n• Receipts\n• Business cards\n• Forms\n\n💡 Smart Document Scanner: Scan and share without leaving the chat.';
    }
    
    if (lowerInput.includes('thread') || lowerInput.includes('topic thread')) {
      return '🧵 **Topic Thread Created**\n\nOrganize discussions without creating new groups.\nThread: "Project Discussion"\n\n💡 Topic Threads: Organise discussions without creating new groups.';
    }
    
    if (lowerInput.includes('schedule') || lowerInput.includes('meeting scheduler')) {
      return '📅 **AI Meeting Scheduler**\n\nSuggested meeting times:\n• Tomorrow 2:00 PM\n• Friday 10:00 AM\n• Next Monday 3:00 PM\n\n💡 AI Meeting Scheduler: Sets up meetings from chat context.';
    }
    
    if (lowerInput.includes('focus mode') || lowerInput.includes('focus')) {
      setFocusMode(true);
      return '🎯 **Focus Mode Activated**\n\nNon-essential notifications are now blocked.\nWork hours: 9 AM - 5 PM\n\n💡 Focus Mode: AI blocks non-essential notifications during work hours.';
    }
    
    if (lowerInput.includes('image') || lowerInput.includes('generate') || lowerInput.includes('picture')) {
      return 'I can help you generate images! Describe what you\'d like to see, and I\'ll create it for you using AI image generation.';
    }
    
    if (lowerInput.includes('avatar') || lowerInput.includes('profile')) {
      return 'I can help you create a custom avatar! Tell me about the style, colors, or features you\'d like, and I\'ll generate a unique avatar for you.';
    }
    
    if (lowerInput.includes('code') || lowerInput.includes('programming') || lowerInput.includes('script')) {
      return 'I can help you write code! What programming language would you like to use, and what functionality are you trying to implement?';
    }
    
    const responses = [
      'I understand. Let me help you with that. Can you provide more details?',
      'Thanks for your message! I\'m here to assist you. What would you like to know?',
      'Got it! I can help with that. Is there anything specific you\'d like me to focus on?',
      'I\'m ready to help! Could you share a bit more information so I can assist you better?',
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setActiveView('chat');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Clear chat history
  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear all chat messages?')) {
      setMessages([]);
      setActiveView('welcome');
      localStorage.removeItem('iru-chatbot-messages');
    }
  };

  const handleFeatureClick = (feature: string) => {
    setInputValue(feature);
    setActiveView('chat');
    setShowFeaturesMenu(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Navigation handlers
  const handleNavClick = (nav: typeof activeNav) => {
    setActiveNav(nav);
    if (nav === 'chat') {
      setActiveView(messages.length > 0 ? 'chat' : 'welcome');
    } else {
      setActiveView(nav);
    }
    setIsLeftSidebarOpen(false);
  };

  // Template use handler (read-only)
  const handleUseTemplate = (template: Template) => {
    setInputValue(template.content || template.description);
    setActiveView('chat');
    setActiveNav('chat');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Community join handler (read-only)
  const handleJoinCommunity = (channelId: string) => {
    setCommunityChannels(prev => prev.map(c => 
      c.id === channelId ? { ...c, members: c.members + 1, unread: 0 } : c
    ));
    setInputValue(`Join community: ${communityChannels.find(c => c.id === channelId)?.name}`);
    setActiveView('chat');
    setActiveNav('chat');
  };

  // History functions
  const handleLoadHistory = (historyId: string) => {
    const historyItem = chatHistory.find(h => h.id === historyId);
    if (historyItem) {
      setMessages(historyItem.messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })));
      setActiveView('chat');
      setActiveNav('chat');
      setSelectedHistory(historyId);
    }
  };

  const handleDeleteHistory = (id: string) => {
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      setChatHistory(prev => prev.filter(h => h.id !== id));
      if (selectedHistory === id) {
        setMessages([]);
        setSelectedHistory(null);
        setActiveView('welcome');
      }
    }
  };

  const handleSaveCurrentChat = () => {
    if (messages.length === 0) return;
    
    const title = messages[0]?.text.substring(0, 30) || 'New Conversation';
    const lastMessage = messages[messages.length - 1]?.text || '';
    const timeAgo = 'Just now';
    
    const newHistory: ChatHistoryItem = {
      id: Date.now().toString(),
      title,
      lastMessage,
      time: timeAgo,
      messages: messages,
      createdAt: new Date().toISOString(),
    };
    
    setChatHistory(prev => [newHistory, ...prev]);
    alert('Conversation saved to history!');
  };

  // Project handlers (read-only)
  const handleNewProject = () => {
    setInputValue('Create a new project');
    setActiveView('chat');
    setActiveNav('chat');
  };

  const handleProjectClick = (projectId: string) => {
    setSelectedProject(projectId);
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setActiveView('chat');
      setInputValue(`Tell me about ${project.title}`);
    }
  };

  // File attachment handler
  const handleAttachFile = () => {
    fileInputRef.current?.click();
  };

  const isImageFile = (file: File): boolean => {
    return file.type.startsWith('image/');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setAttachedFiles(prev => [...prev, ...files]);
      
      // Process each file
      files.forEach((file, index) => {
        if (isImageFile(file)) {
          // Create image preview
          const reader = new FileReader();
          reader.onload = (event) => {
            const imageUrl = event.target?.result as string;
            const newMessage: Message = {
              id: Date.now().toString() + Math.random() + index,
              text: file.name,
              sender: 'user',
              timestamp: new Date(),
              files: [file],
              imageUrl: imageUrl,
            };
            setMessages(prev => [...prev, newMessage]);
            setActiveView('chat');
          };
          reader.readAsDataURL(file);
        } else {
          // Regular file attachment
          const newMessage: Message = {
            id: Date.now().toString() + Math.random() + index,
            text: `📎 ${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
            sender: 'user',
            timestamp: new Date(),
            files: [file],
          };
          setMessages(prev => [...prev, newMessage]);
          setActiveView('chat');
        }
      });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Voice message handler
  const handleVoiceMessage = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Simulate recording
      setTimeout(() => {
        setIsRecording(false);
        const newMessage: Message = {
          id: Date.now().toString(),
          text: '🎙️ Voice message recorded and transcribed',
          sender: 'user',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, newMessage]);
        setActiveView('chat');
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          const botResponse: Message = {
            id: (Date.now() + 1).toString(),
            text: 'I received your voice message. How can I help you with it?',
            sender: 'assistant',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, botResponse]);
        }, 1000);
      }, 2000);
    } else {
      setIsRecording(false);
    }
  };

  // Browse prompts handler
  const handleBrowsePrompts = () => {
    setShowPromptsMenu(!showPromptsMenu);
  };

  const handlePromptSelect = (prompt: string) => {
    setInputValue(prompt);
    setShowPromptsMenu(false);
    setActiveView('chat');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // AI Task cards matching screenshot
  const aiTasks = [
    {
      id: 'write-copy',
      title: 'Write copy',
      icon: '📝',
      color: 'bg-yellow-100 dark:bg-yellow-900/20',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      suggestion: 'Write a professional email about...'
    },
    {
      id: 'image-generation',
      title: 'Image generation',
      icon: '🎨',
      color: 'bg-blue-100 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      suggestion: 'Generate an image of...'
    },
    {
      id: 'create-avatar',
      title: 'Create avatar',
      icon: '👤',
      color: 'bg-green-100 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
      suggestion: 'Create a custom avatar with...'
    },
    {
      id: 'write-code',
      title: 'Write code',
      icon: '💻',
      color: 'bg-pink-100 dark:bg-pink-900/20',
      iconColor: 'text-pink-600 dark:text-pink-400',
      suggestion: 'Write code for...'
    },
  ];

  // Feature categories
  const featureCategories = [
    {
      title: 'AI Intelligence',
      icon: Brain,
      features: [
        'Context Memory AI',
        'Smart Meeting Summaries',
        'Sentiment Insights'
      ]
    },
    {
      title: 'Privacy & Security',
      icon: Shield,
      features: [
        'Self-Destructing Rooms',
        'On-Device Processing',
        'Stealth Mode'
      ]
    },
    {
      title: 'Collaboration',
      icon: Users,
      features: [
        'Space Hosting',
        'Live Meetings',
        'Document Signing',
        'Voice-to-Task'
      ]
    },
    {
      title: 'Community',
      icon: MessageSquare,
      features: [
        'Community Channels',
        'Broadcast Messaging',
        'Interest Communities'
      ]
    },
    {
      title: 'Translation',
      icon: Languages,
      features: [
        'Live Chat Translation',
        'Group Translation Mode'
      ]
    },
    {
      title: 'Media & Files',
      icon: BarChart,
      features: [
        'AI Search in Files',
        'Smart Document Scanner'
      ]
    },
    {
      title: 'Productivity',
      icon: Zap,
      features: [
        'Topic Threads',
        'AI Meeting Scheduler',
        'Focus Mode'
      ]
    }
  ];

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${
      darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'
    }`}>
      {/* Left Sidebar */}
      <aside className={`${isLeftSidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed md:static md:translate-x-0 z-50 md:z-auto w-64 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border-r flex flex-col h-full transition-transform duration-300`}>
        {/* Logo */}
        <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full border-2 border-dashed ${
              darkMode ? 'border-gray-500' : 'border-gray-400'
            } flex items-center justify-center`}>
              <div className={`w-4 h-4 rounded-full ${darkMode ? 'bg-gray-500' : 'bg-gray-400'}`}></div>
            </div>
            <span className={`font-semibold text-base ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>IRU Chat</span>
          </div>
        </div>

        {/* Search */}
        <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
              darkMode ? 'text-gray-400' : 'text-gray-400'
            }`} />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-16 py-2 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-gray-500' 
                  : 'bg-gray-50 border-gray-200 text-gray-700'
              }`}
            />
            <kbd className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono ${
              darkMode ? 'text-gray-400' : 'text-gray-400'
            }`}>⌘K</kbd>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2">
          <div className="space-y-0.5">
            <button
              onClick={() => handleNavClick('chat')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeNav === 'chat'
                  ? darkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-50 text-blue-600'
                  : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span>AI Chat</span>
            </button>
            <button 
              onClick={() => handleNavClick('projects')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeNav === 'projects'
                  ? darkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-50 text-blue-600'
                  : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FolderKanban className="w-5 h-5" />
              <span>Projects</span>
            </button>
            <button 
              onClick={() => handleNavClick('templates')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeNav === 'templates'
                  ? darkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-50 text-blue-600'
                  : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>Templates</span>
            </button>
            <button 
              onClick={() => handleNavClick('documents')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeNav === 'documents'
                  ? darkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-50 text-blue-600'
                  : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>Documents</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavClick('documents');
                  setInputValue('Create a new document');
                }}
                className="ml-auto"
              >
                <Plus className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
              </button>
            </button>
            <button 
              onClick={() => handleNavClick('community')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeNav === 'community'
                  ? darkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-50 text-blue-600'
                  : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Community</span>
              <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
                darkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'
              }`}>NEW</span>
            </button>
            <button 
              onClick={() => handleNavClick('history')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeNav === 'history'
                  ? darkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-50 text-blue-600'
                  : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <History className="w-5 h-5" />
              <span>History</span>
            </button>
            <div className={`pt-2 mt-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <button 
                onClick={() => {
                  handleNavClick('settings');
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeNav === 'settings'
                    ? darkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-50 text-blue-600'
                    : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>Settings & Help</span>
              </button>
              <button 
                onClick={() => {
                  handleNavClick('help');
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeNav === 'help'
                    ? darkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-50 text-blue-600'
                    : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <HelpCircle className="w-5 h-5" />
                <span>Help</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Theme Toggle & User */}
        <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} space-y-3`}>
          <div className={`flex items-center gap-2 p-1 rounded-lg ${
            darkMode ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <button
              onClick={() => setDarkMode(false)}
              className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-colors ${
                !darkMode
                  ? darkMode ? 'bg-gray-600 text-gray-100' : 'bg-white text-gray-800 shadow-sm'
                  : darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              <Sun className="w-3 h-3 inline mr-1" />
              Light
            </button>
            <button
              onClick={() => setDarkMode(true)}
              className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-colors ${
                darkMode
                  ? darkMode ? 'bg-gray-600 text-gray-100' : 'bg-white text-gray-800 shadow-sm'
                  : darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              <Moon className="w-3 h-3 inline mr-1" />
              Dark
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
              darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
            }`}>
              {userInfo ? userInfo.name.charAt(0).toUpperCase() : '?'}
            </div>
            {userInfo ? (
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{userInfo.name}</p>
                <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{userInfo.email}</p>
              </div>
            ) : (
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Guest</p>
                <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Not logged in</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isLeftSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsLeftSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col overflow-hidden ${
        darkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        {/* Header */}
        <header className={`border-b px-6 py-4 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className={`text-xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>AI Chat</h1>
              {messages.length > 0 && (
                <button
                  onClick={handleClearChat}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    darkMode 
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                  title="Clear chat history"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {stealthMode && (
                <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300 flex items-center gap-1">
                  <EyeOff className="w-3 h-3" />
                  Stealth
                </span>
              )}
              {focusMode && (
                <span className="text-xs px-2 py-1 rounded bg-blue-900/50 text-blue-300 flex items-center gap-1">
                  <BellOff className="w-3 h-3" />
                  Focus
                </span>
              )}
              <button
                onClick={() => setShowFeaturesMenu(!showFeaturesMenu)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <Zap className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              </button>
            </div>
          </div>
        </header>

        {/* Features Menu Dropdown */}
        {showFeaturesMenu && (
          <div className={`absolute top-16 right-4 z-50 w-80 rounded-lg shadow-xl border p-4 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`font-semibold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>All Features</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {featureCategories.map((category, idx) => (
                <div key={idx} className="mb-4">
                  <div className={`flex items-center gap-2 mb-2 px-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <category.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{category.title}</span>
                  </div>
                  <div className="space-y-1">
                    {category.features.map((feature, fIdx) => (
                      <button
                        key={fIdx}
                        onClick={() => handleFeatureClick(`Activate ${feature}`)}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                          darkMode
                            ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        • {feature}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className={`flex-1 overflow-y-auto ${
          darkMode ? 'bg-gray-900' : 'bg-white'
        }`}>
          {/* Projects View */}
          {activeView === 'projects' && (
            <div className={`max-w-6xl mx-auto px-8 py-16 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              <h2 className={`text-3xl font-bold mb-8 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.filter(p => 
                  searchQuery ? p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  p.description.toLowerCase().includes(searchQuery.toLowerCase()) : true
                ).map((project) => (
                  <div
                    key={project.id}
                    onClick={() => handleProjectClick(project.id)}
                    className={`p-6 rounded-xl border cursor-pointer transition-all hover:shadow-lg ${
                      darkMode
                        ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {project.title}
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {project.description}
                    </p>
                    <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      Created: {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Templates View */}
          {activeView === 'templates' && (
            <div className={`max-w-6xl mx-auto px-8 py-16 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              <h2 className={`text-3xl font-bold mb-8 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Templates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.filter(t => 
                  searchQuery ? t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  t.description.toLowerCase().includes(searchQuery.toLowerCase()) : true
                ).map((template) => (
                  <div
                    key={template.id}
                    className={`p-6 rounded-xl border transition-all hover:shadow-lg ${
                      darkMode
                        ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`text-xs px-2 py-1 rounded mb-2 inline-block ${
                      darkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'
                    }`}>{template.category}</div>
                    <h3 
                      onClick={() => handleUseTemplate(template)}
                      className={`text-lg font-semibold mb-2 cursor-pointer ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}
                    >
                      {template.name}
                    </h3>
                    <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{template.description}</p>
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className={`text-sm px-3 py-1 rounded ${
                        darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
                      } text-white`}
                    >
                      Use Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents View */}
          {activeView === 'documents' && (
            <div className={`max-w-6xl mx-auto px-8 py-16 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              <h2 className={`text-3xl font-bold mb-8 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Documents</h2>
              <div className="space-y-3">
                {documents.filter(d => 
                  searchQuery ? d.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
                ).map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => {
                      if (doc.content) {
                        setInputValue(`Document content: ${doc.content}`);
                        setActiveView('chat');
                      } else {
                        setInputValue(`Open document: ${doc.name}`);
                        setActiveView('chat');
                      }
                    }}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      darkMode
                        ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                      <div>
                        <h3 className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{doc.name}</h3>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{doc.size} • {doc.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Community View */}
          {activeView === 'community' && (
            <div className={`max-w-6xl mx-auto px-8 py-16 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              <h2 className={`text-3xl font-bold mb-8 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Community</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {communityChannels.filter(c => 
                  searchQuery ? c.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
                ).map((channel) => (
                  <div
                    key={channel.id}
                    className={`p-6 rounded-xl border transition-all hover:shadow-lg ${
                      darkMode
                        ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{channel.name}</h3>
                      {channel.unread > 0 && (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          darkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {channel.unread} new
                        </span>
                      )}
                    </div>
                    {channel.description && (
                      <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{channel.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{channel.members} members</p>
                      <button
                        onClick={() => handleJoinCommunity(channel.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${
                          darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
                        } text-white`}
                      >
                        Join
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* History View */}
          {activeView === 'history' && (
            <div className={`max-w-6xl mx-auto px-8 py-16 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              <div className="flex items-center justify-between mb-8">
                <h2 className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Chat History</h2>
                {messages.length > 0 && (
                  <button
                    onClick={handleSaveCurrentChat}
                    className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                      darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
                    } text-white`}
                  >
                    <Save className="w-4 h-4" />
                    Save Current Chat
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {chatHistory.filter(h => 
                  searchQuery ? h.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  h.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) : true
                ).map((chat) => (
                  <div
                    key={chat.id}
                    className={`p-4 rounded-lg border transition-all hover:shadow-md relative group ${
                      selectedHistory === chat.id
                        ? darkMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-300'
                        : darkMode
                        ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div 
                        onClick={() => handleLoadHistory(chat.id)}
                        className="flex-1 cursor-pointer"
                      >
                        <h3 className={`font-medium mb-1 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{chat.title}</h3>
                        <p className={`text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{chat.lastMessage}</p>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {chat.time} • {chat.messages.length} messages
                        </p>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleLoadHistory(chat.id)}
                          className={`p-1.5 rounded hover:bg-gray-700 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
                          title="Load Conversation"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteHistory(chat.id)}
                          className={`p-1.5 rounded hover:bg-red-600/20 text-red-500`}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {chatHistory.length === 0 && (
                  <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No chat history yet. Start a conversation to see it here.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Settings View */}
          {activeView === 'settings' && (
            <div className={`max-w-4xl mx-auto px-8 py-16 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              <h2 className={`text-3xl font-bold mb-8 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Settings</h2>
              <div className={`space-y-4 p-6 rounded-xl border ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between py-4 border-b border-gray-700">
                  <div>
                    <h3 className={`font-medium mb-1 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Dark Mode</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Toggle dark/light theme</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDarkMode(false)}
                      className={`px-4 py-2 rounded-lg text-sm ${!darkMode ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                    >
                      <Sun className="w-4 h-4 inline mr-1" />
                      Light
                    </button>
                    <button
                      onClick={() => setDarkMode(true)}
                      className={`px-4 py-2 rounded-lg text-sm ${darkMode ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                    >
                      <Moon className="w-4 h-4 inline mr-1" />
                      Dark
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-gray-700">
                  <div>
                    <h3 className={`font-medium mb-1 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Stealth Mode</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Disguise the app for private communication</p>
                  </div>
                  <button
                    onClick={() => setStealthMode(!stealthMode)}
                    className={`px-4 py-2 rounded-lg ${stealthMode ? 'bg-blue-600' : 'bg-gray-700'} text-white`}
                  >
                    {stealthMode ? 'On' : 'Off'}
                  </button>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-gray-700">
                  <div>
                    <h3 className={`font-medium mb-1 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Focus Mode</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Block non-essential notifications during work hours</p>
                  </div>
                  <button
                    onClick={() => setFocusMode(!focusMode)}
                    className={`px-4 py-2 rounded-lg ${focusMode ? 'bg-blue-600' : 'bg-gray-700'} text-white`}
                  >
                    {focusMode ? 'On' : 'Off'}
                  </button>
                </div>
                <div className="flex items-center justify-between py-4">
                  <div>
                    <h3 className={`font-medium mb-1 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Clear All Data</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Delete all chat history and saved data</p>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure? This will delete all your data.')) {
                        localStorage.removeItem('iru-chatbot-messages');
                        localStorage.removeItem('iru-chatbot-projects');
                        localStorage.removeItem('iru-chatbot-templates');
                        localStorage.removeItem('iru-chatbot-documents');
                        localStorage.removeItem('iru-chatbot-community');
                        localStorage.removeItem('iru-chatbot-history');
                        setMessages([]);
                        setProjects([]);
                        setTemplates([]);
                        setDocuments([]);
                        setCommunityChannels([]);
                        setChatHistory([]);
                        setActiveView('welcome');
                        alert('All data cleared!');
                      }
                    }}
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Help View */}
          {activeView === 'help' && (
            <div className={`max-w-4xl mx-auto px-8 py-16 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              <h2 className={`text-3xl font-bold mb-8 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Help & Support</h2>
              <div className={`space-y-6 p-6 rounded-xl border ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div>
                  <h3 className={`font-semibold text-lg mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Getting Started</h3>
                  <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <li>• Start by typing a message or selecting one of the AI task cards</li>
                    <li>• Use the navigation sidebar to access Projects, Templates, Documents, and more</li>
                    <li>• Click the ⚡ button to see all available features</li>
                    <li>• Attach files or use voice messages for richer interactions</li>
                  </ul>
                </div>
                <div>
                  <h3 className={`font-semibold text-lg mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Features</h3>
                  <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <li>• AI-Powered Conversation Intelligence</li>
                    <li>• Multi-Layer Privacy & Security</li>
                    <li>• Business & Collaboration Tools</li>
                    <li>• Community & Broadcast Messaging</li>
                    <li>• Real-Time Multilingual Collaboration</li>
                    <li>• Advanced Media & File Features</li>
                    <li>• Productivity-First Experience</li>
                  </ul>
                </div>
                <div>
                  <h3 className={`font-semibold text-lg mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Managing Your Data</h3>
                  <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <li>• Create, edit, and delete Projects, Templates, and Documents</li>
                    <li>• View and load previous conversations from History</li>
                    <li>• Join or create Community channels</li>
                    <li>• All data is saved automatically and persists across sessions</li>
                  </ul>
                </div>
                <div className="bg-bg-secondary rounded-lg p-4 border border-border">
                  <h3 className={`font-semibold text-lg mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Contact Support</h3>
                  <div className={`space-y-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <p><strong>Email:</strong> <a href="mailto:irubusinessgroup@gmail.com" className="text-brand-blue hover:underline">irubusinessgroup@gmail.com</a></p>
                    <p><strong>Phone:</strong> <a href="tel:+250795381733" className="text-brand-blue hover:underline">+250 795 381 733 / +250 736 318 111</a></p>
                    <p><strong>Address:</strong> Gahanga, Kicukiro, Kigali, Rwanda</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(activeView === 'welcome' || activeView === 'chat') && messages.length === 0 ? (
            <div className={`max-w-4xl mx-auto px-8 py-16 ${
              darkMode ? 'text-gray-100' : 'text-gray-900'
            }`}>
              <div className="text-center mb-12">
                <h2 className={`text-5xl font-bold mb-3 ${
                  darkMode ? 'text-gray-100' : 'text-gray-900'
                }`}>Welcome to IRU Chat</h2>
                <p className={`text-lg ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Get started by typing a task and Chat can do the rest. Not sure where to start?
                </p>
              </div>

              {/* AI Task Cards - 2x2 Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8 max-w-2xl mx-auto">
                {aiTasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => handleSuggestionClick(task.suggestion)}
                    className={`group relative p-6 rounded-xl border hover:shadow-sm transition-all text-left ${
                      darkMode
                        ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-12 h-12 ${task.color} rounded-lg flex items-center justify-center text-2xl mb-3`}>
                      {task.icon}
                    </div>
                    <h3 className={`text-base font-semibold mb-1 ${
                      darkMode ? 'text-gray-100' : 'text-gray-900'
                    }`}>{task.title}</h3>
                    <button className={`absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                      darkMode
                        ? 'bg-gray-700 group-hover:bg-gray-600'
                        : 'bg-gray-100 group-hover:bg-gray-200'
                    }`}>
                      <Plus className={`w-4 h-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                    </button>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className={`max-w-3xl mx-auto px-8 py-8 ${
              darkMode ? 'text-gray-100' : 'text-gray-900'
            }`}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 mb-6 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    darkMode
                      ? message.sender === 'assistant' ? 'bg-gray-700 text-gray-300' : 'bg-gray-700 text-gray-300'
                      : message.sender === 'assistant' ? 'bg-gray-200 text-gray-700' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {message.sender === 'assistant' ? (
                      <span className="text-xs font-semibold">AI</span>
                    ) : (
                      <span className="text-xs font-semibold">{userInfo ? userInfo.name.charAt(0).toUpperCase() : 'U'}</span>
                    )}
                  </div>
                  <div className={`flex-1 ${message.sender === 'user' ? 'flex flex-col items-end' : ''}`}>
                    <div className={`inline-block max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : darkMode
                        ? 'bg-gray-800 text-gray-100 rounded-bl-sm'
                        : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                    }`}>
                      {/* Display image if it's an image file */}
                      {message.imageUrl && (
                        <div className="mb-2">
                          <img 
                            src={message.imageUrl} 
                            alt={message.text}
                            className="max-w-full h-auto rounded-lg max-h-96 object-contain"
                          />
                          {message.text && !message.text.includes('📎') && (
                            <p className="text-xs mt-1 opacity-80">{message.text}</p>
                          )}
                        </div>
                      )}
                      {/* Display file icon if it's a regular file */}
                      {message.files && message.files.length > 0 && !message.imageUrl && (
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-5 h-5" />
                          <div>
                            <p className="font-medium">
                              {typeof message.files[0] === 'object' && 'name' in message.files[0]
                                ? message.files[0].name
                                : message.text}
                            </p>
                            <p className="text-xs opacity-80">
                              {typeof message.files[0] === 'object' && 'type' in message.files[0]
                                ? message.files[0].type || 'File'
                                : 'File'}
                              {typeof message.files[0] === 'object' && 'size' in message.files[0] && message.files[0].size
                                ? ` • ${(message.files[0].size / 1024).toFixed(2)} KB`
                                : ''}
                            </p>
                          </div>
                        </div>
                      )}
                      {/* Display text message if no files or additional text */}
                      {(!message.files || message.files.length === 0) && (
                        <p className="whitespace-pre-wrap text-sm">{message.text}</p>
                      )}
                      {message.files && message.files.length > 0 && message.text && !message.text.includes('📎') && (
                        <p className="whitespace-pre-wrap text-sm mt-2">{message.text}</p>
                      )}
                    </div>
                    <span className={`text-xs mt-1 block ${
                      darkMode ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-4 mb-6">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                  }`}>
                    <span className="text-xs font-semibold">AI</span>
                  </div>
                  <div className="flex-1">
                    <div className={`inline-block rounded-2xl rounded-bl-sm px-4 py-3 ${
                      darkMode ? 'bg-gray-800' : 'bg-gray-100'
                    }`}>
                      <div className="flex gap-1">
                        <div className={`w-2 h-2 rounded-full animate-bounce ${
                          darkMode ? 'bg-gray-500' : 'bg-gray-400'
                        }`} style={{ animationDelay: '0ms' }}></div>
                        <div className={`w-2 h-2 rounded-full animate-bounce ${
                          darkMode ? 'bg-gray-500' : 'bg-gray-400'
                        }`} style={{ animationDelay: '150ms' }}></div>
                        <div className={`w-2 h-2 rounded-full animate-bounce ${
                          darkMode ? 'bg-gray-500' : 'bg-gray-400'
                        }`} style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className={`border-t px-8 py-6 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
            <div className="relative mb-4">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder="Summarize the latest"
                className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 resize-none placeholder-gray-400 text-sm ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-gray-500'
                    : 'border-gray-300 text-gray-900'
                }`}
                rows={1}
                maxLength={3000}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || inputValue.length > 3000}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                  darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 relative">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  className="hidden"
                />
                <button 
                  type="button" 
                  onClick={handleAttachFile}
                  className={`flex items-center gap-2 text-sm transition-colors ${
                    darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Paperclip className="w-4 h-4" />
                  <span>Attach</span>
                </button>
                <button 
                  type="button" 
                  onClick={handleVoiceMessage}
                  className={`flex items-center gap-2 text-sm transition-colors ${
                    isRecording 
                      ? 'text-red-600' 
                      : darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Mic className={`w-4 h-4 ${isRecording ? 'animate-pulse' : ''}`} />
                  <span>{isRecording ? 'Recording...' : 'Voice Message'}</span>
                </button>
                <div className="relative">
                  <button 
                    type="button" 
                    onClick={handleBrowsePrompts}
                    className={`flex items-center gap-2 text-sm transition-colors ${
                      darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <FileSearch className="w-4 h-4" />
                    <span>Browse Prompts</span>
                  </button>
                  {showPromptsMenu && (
                    <div className={`absolute bottom-full left-0 mb-2 w-64 rounded-lg shadow-xl border p-2 z-50 ${
                      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                      {promptTemplates.map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handlePromptSelect(prompt)}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            darkMode
                              ? 'text-gray-300 hover:bg-gray-700'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className={`text-xs ${
                darkMode ? 'text-gray-500' : 'text-gray-500'
              }`}>
                {charCount}/3,000
              </div>
            </div>
            <p className={`text-xs mt-4 text-center ${
              darkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>
              IRU Chat may generate inaccurate information about people, places, or facts. Model: IRU AI v1.3
            </p>
          </form>
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className={`${isRightSidebarOpen ? 'translate-x-0' : 'translate-x-full'} fixed md:static md:translate-x-0 z-50 md:z-auto w-80 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border-l flex flex-col h-full transition-transform duration-300`}>
        {/* Header with Upgrade Button */}
        <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-4">
            <button 
              onClick={() => setShowUpgradeModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              <Zap className="w-4 h-4" />
              Upgrade
            </button>
            <button className={`p-2 rounded-lg transition-colors ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}>
              <HelpCircle className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
            <button className={`p-2 rounded-lg transition-colors ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}>
              <Gift className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
            <button className={`p-2 rounded-lg transition-colors ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}>
              <div className={`w-5 h-5 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <h2 className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Projects ({projects.length})</h2>
            <button className={`p-1 rounded-lg transition-colors ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}>
              <MoreVertical className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
          </div>
        </div>

        {/* Projects List */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${
          darkMode ? 'bg-gray-900' : 'bg-white'
        }`}>
          <button
            onClick={handleNewProject}
            className={`w-full p-4 rounded-lg border cursor-pointer transition-colors text-left ${
              darkMode
                ? 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <h3 className={`font-medium mb-1 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>New Project</h3>
          </button>
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => handleProjectClick(project.id)}
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                selectedProject === project.id
                  ? darkMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-300'
                  : darkMode
                  ? 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <h3 className={`font-medium mb-1 truncate ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{project.title}</h3>
              <p className={`text-sm line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{project.description}</p>
            </div>
          ))}
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isRightSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsRightSidebarOpen(false)}
        />
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-xl shadow-2xl p-6 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Upgrade to Pro</h3>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
            </div>
            <div className={`space-y-4 mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span>Unlimited AI requests</span>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span>Advanced features access</span>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span>Priority support</span>
              </div>
            </div>
            <button
              onClick={() => {
                setShowUpgradeModal(false);
                setInputValue('I want to upgrade to Pro');
                setActiveView('chat');
              }}
              className="w-full px-4 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-xl shadow-2xl p-6 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Settings</h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Dark Mode</span>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-blue-600' : 'bg-gray-200'} text-white`}
                >
                  {darkMode ? 'Dark' : 'Light'}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Notifications</span>
                <button className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Configure
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-xl shadow-2xl p-6 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Help & Support</h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
            </div>
            <div className={`space-y-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <p>Need help? Contact our support team:</p>
              <p className="text-sm">Email: <a href="mailto:irubusinessgroup@gmail.com" className="text-blue-500 hover:underline">irubusinessgroup@gmail.com</a></p>
              <p className="text-sm">Phone: <a href="tel:+250795381733" className="text-blue-500 hover:underline">+250 795 381 733</a></p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Buttons */}
      <button
        onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
        className={`fixed top-4 left-4 md:hidden w-10 h-10 rounded-lg shadow-sm flex items-center justify-center z-30 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border`}
      >
        <Menu className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
      </button>
      <button
        onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
        className={`fixed top-4 right-4 md:hidden w-10 h-10 rounded-lg shadow-sm flex items-center justify-center z-30 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border`}
      >
        <Menu className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
      </button>
    </div>
  );
};

export default Chatbot;
