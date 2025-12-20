import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { Phone, Video, Link, PhoneCall, PhoneOff, Mic, MicOff, VideoOff, Users, Copy, Check, X, RefreshCw, MessageSquare, Send, Monitor, Smile, Hand, MoreVertical, Info, Grid3x3, Lock, Captions } from 'lucide-react';
import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack, IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';
import { toast } from 'sonner';
import { io, Socket } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const AGORA_APP_ID = import.meta.env.VITE_AGORA_APP_ID || "8d21c418598b4496907513003a6e123c";

interface User {
  id: string;
  fullName: string;
  name?: string;
  profilePicture?: string;
  isOnline?: boolean;
}

interface CallState {
  isInCall: boolean;
  callType: 'voice' | 'video';
  channelName: string;
  remoteUser?: User;
  isMuted: boolean;
  isVideoOff: boolean;
  callDuration: number;
}

interface IncomingCall {
  channelName: string;
  callType: 'voice' | 'video';
  caller: User;
  token?: string;
}

interface CallHistoryItem {
  id: string;
  contact: string;
  contactId: string;
  type: 'voice' | 'video';
  when: string;
  duration: string;
  status: 'completed' | 'missed' | 'rejected';
}

const CallsPage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [callType, setCallType] = useState<'voice' | 'video' | 'meeting'>('voice');
  const [dialInput, setDialInput] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [callState, setCallState] = useState<CallState | null>(null);
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [callHistory, setCallHistory] = useState<CallHistoryItem[]>([]);
  const [devices, setDevices] = useState<{
    microphones: MediaDeviceInfo[];
    speakers: MediaDeviceInfo[];
    cameras: MediaDeviceInfo[];
  }>({ microphones: [], speakers: [], cameras: [] });
  const [selectedDevices, setSelectedDevices] = useState({
    microphone: '',
    speaker: '',
    camera: '',
  });
  const [meetingLink, setMeetingLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [callMessages, setCallMessages] = useState<Array<{id: string; sender: string; senderId: string; text: string; timestamp: Date}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);
  const [hasLocalVideo, setHasLocalVideo] = useState(false);
  const [showMeetingReady, setShowMeetingReady] = useState(false);
  const [pendingAutoAnswer, setPendingAutoAnswer] = useState(false);

  // Refs
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localAudioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
  const localVideoTrackRef = useRef<ICameraVideoTrack | null>(null);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Theme-aware colors
  const cardBg = isDark ? 'bg-[#101828]' : 'bg-white';
  const cardBorder = isDark ? 'border-[rgba(255,255,255,0.09)]' : 'border-[rgba(15,23,42,0.10)]';
  const cardHeaderBg = isDark ? 'bg-[rgba(255,255,255,0.02)]' : 'bg-[rgba(15,23,42,0.02)]';
  const textPrimary = isDark ? 'text-[#e7eefc]' : 'text-[#0f172a]';
  const textMuted = isDark ? 'text-[#9bb0d0]' : 'text-[#475569]';
  const shadow = isDark ? 'shadow-[0_12px_30px_rgba(0,0,0,0.35)]' : 'shadow-[0_10px_25px_rgba(2,6,23,0.08)]';
  const badgeBg = isDark ? 'bg-[rgba(255,255,255,0.02)]' : 'bg-[rgba(15,23,42,0.02)]';
  const badgeBorder = isDark ? 'border-[rgba(255,255,255,0.09)]' : 'border-[rgba(15,23,42,0.10)]';
  const buttonActive = isDark 
    ? 'bg-[rgba(110,168,255,0.14)] border-[rgba(110,168,255,0.35)] text-[#e7eefc]'
    : 'bg-[rgba(37,99,235,0.14)] border-[rgba(37,99,235,0.35)] text-[#0f172a]';
  const buttonInactive = isDark
    ? 'bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.09)] text-[#9bb0d0] hover:bg-[rgba(255,255,255,0.05)]'
    : 'bg-[rgba(15,23,42,0.02)] border-[rgba(15,23,42,0.10)] text-[#475569] hover:bg-[rgba(15,23,42,0.05)]';
  const inputBg = isDark ? 'bg-[rgba(255,255,255,0.02)]' : 'bg-[rgba(15,23,42,0.02)]';
  const inputBorder = isDark ? 'border-[rgba(255,255,255,0.09)]' : 'border-[rgba(15,23,42,0.10)]';
  const inputText = isDark ? 'text-[#e7eefc]' : 'text-[#0f172a]';
  const inputPlaceholder = isDark ? 'placeholder-[#9bb0d0]' : 'placeholder-[#475569]';
  const tableBorder = isDark ? 'border-[rgba(255,255,255,0.09)]' : 'border-[rgba(15,23,42,0.10)]';

  // Get auth token
  const getAuthToken = () => {
    try {
      const authData = localStorage.getItem('iru-auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.token;
      }
    } catch (e) {}
    return null;
  };

  const getCurrentUserId = () => {
    try {
      const authData = localStorage.getItem('iru-auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.user?.id;
      }
    } catch (e) {}
    return null;
  };

  const getCurrentUser = () => {
    try {
      const authData = localStorage.getItem('iru-auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        const user = parsed.user;
        // Normalize user object - handle both 'name' and 'fullName' properties
        if (user) {
          return {
            ...user,
            fullName: user.fullName || user.name || 'Unknown User',
          };
        }
        return user;
      }
    } catch (e) {
      console.error('CallsPage: Error parsing auth data:', e);
    }
    return null;
  };

  // Initialize socket connection
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      console.warn('CallsPage: No auth token found');
      return;
    }

    const socket = io(API_BASE_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('CallsPage: ✅ Socket connected, socket ID:', socket.id);
      const currentUserId = getCurrentUserId();
      console.log('CallsPage: Current user ID:', currentUserId);
      console.log('CallsPage: Socket is ready to receive calls');
      
      // Join user's personal room as backup
      socket.emit('join-user-room', { userId: currentUserId });
      
      // Check for incoming call from sessionStorage (if redirected from another page)
      const storedCall = sessionStorage.getItem('incoming-call');
      if (storedCall) {
        try {
          const callData = JSON.parse(storedCall);
          console.log('CallsPage: Found stored incoming call:', callData);
          setIncomingCall(callData);
          sessionStorage.removeItem('incoming-call');
        } catch (e) {
          console.error('CallsPage: Error parsing stored call:', e);
        }
      }
    });

    socket.on('connect_error', (error) => {
      console.error('CallsPage: Socket connection error:', error);
      toast.error('Failed to connect to server');
    });

    socket.on('disconnect', (reason) => {
      console.log('CallsPage: Socket disconnected:', reason);
    });

    socket.on('call:incoming', (data: IncomingCall) => {
      console.log('CallsPage: ========== INCOMING CALL RECEIVED ==========');
      console.log('CallsPage: Call data:', JSON.stringify(data, null, 2));
      console.log('CallsPage: Caller:', data.caller);
      console.log('CallsPage: Call type:', data.callType);
      console.log('CallsPage: Channel:', data.channelName);
      
      // Validate call data
      if (!data || !data.channelName) {
        console.error('CallsPage: Invalid call data received:', data);
        toast.error('Invalid call data received');
        return;
      }
      
      // Show notification with proper caller name
      const callerName = data.caller?.fullName || data.caller?.name || data.caller?.id || 'Unknown';
      console.log('CallsPage: Caller name:', callerName, 'Full caller data:', data.caller);
      
      toast.info(`Incoming ${data.callType} call from ${callerName}`, {
        duration: 15000,
        description: 'Click the green button to answer',
      });
      
      // Store in sessionStorage
      sessionStorage.setItem('incoming-call', JSON.stringify(data));
      
      // Set incoming call state - this will show the modal
      setIncomingCall(data);
      console.log('CallsPage: ✓ Incoming call state set, modal should appear');
      console.log('CallsPage: ============================================');
    });
    
    // Debug: Log all socket events
    socket.onAny((eventName, ...args) => {
      if (eventName === 'call:incoming') {
        console.log('CallsPage: Received call:incoming event via onAny:', args);
      }
    });

    socket.on('call:accepted', async (data: { channelName: string; token?: string }) => {
      console.log('CallsPage: ========== CALL ACCEPTED ==========');
      console.log('CallsPage: Call accepted by recipient:', data);
      
      // If we're the caller and the call was accepted, ensure we're in call state
      if (callState && callState.channelName === data.channelName) {
        console.log('CallsPage: We are the caller, call is already active');
        toast.success('Call connected!');
      } else if (callState && callState.channelName !== data.channelName) {
        console.log('CallsPage: Call accepted but channel mismatch, updating state');
        // Update call state to reflect accepted call
        setCallState(prev => prev ? { ...prev, isInCall: true } : null);
        toast.success('Call connected!');
      } else {
        console.log('CallsPage: Call accepted but no active call state, this might be a new call');
        toast.success('Call accepted!');
      }
      console.log('CallsPage: ====================================');
    });

    socket.on('call:rejected', () => {
      console.log('CallsPage: Call was rejected');
      toast.info('Call was rejected');
      setIncomingCall(null);
      if (callState) {
        endCall();
      }
    });

    socket.on('call:ended', () => {
      console.log('CallsPage: Call ended');
      toast.info('Call ended');
      setIncomingCall(null);
      if (callState) {
        endCall();
      }
    });

    socket.on('call:unavailable', (data: { recipientId: string }) => {
      console.log('CallsPage: Call recipient unavailable:', data);
      toast.error('User is not available for calls');
      if (callState) {
        endCall();
      }
    });
    
    // Listen for custom event from ChatPage
    const handleIncomingCall = (event: CustomEvent) => {
      console.log('CallsPage: ========== CUSTOM EVENT: INCOMING CALL ==========');
      console.log('CallsPage: Received incoming call via custom event:', event.detail);
      
      const callData = event.detail;
      if (callData && callData.channelName) {
        setIncomingCall(callData);
        // Also store in sessionStorage
        sessionStorage.setItem('incoming-call', JSON.stringify(callData));
        console.log('CallsPage: ✓ Incoming call set from custom event');
        
        // Check if this is an auto-answer request
        if (callData.autoAnswer) {
          console.log('CallsPage: ✓ Auto-answer flag detected, will auto-answer');
          setPendingAutoAnswer(true);
        }
      } else {
        console.error('CallsPage: Invalid call data received:', callData);
      }
      console.log('CallsPage: ============================================');
    };
    
    window.addEventListener('incoming-call-received', handleIncomingCall as EventListener);
    
    // Check sessionStorage periodically for incoming call (in case we just navigated here)
    const checkStoredCall = () => {
      const storedCall = sessionStorage.getItem('incoming-call');
      const autoAnswerFlag = sessionStorage.getItem('auto-answer-call');
      
      if (storedCall) {
        try {
          const callData = JSON.parse(storedCall);
          if (callData && callData.channelName) {
            console.log('CallsPage: Found stored incoming call:', callData);
            // Always set it, even if incomingCall already exists (to update with latest data)
            setIncomingCall(callData);
            
            // Check if we should auto-answer
            if (autoAnswerFlag === 'true') {
              console.log('CallsPage: ✓ Auto-answer flag found in sessionStorage');
              sessionStorage.removeItem('auto-answer-call');
              setPendingAutoAnswer(true);
            }
          }
        } catch (error) {
          console.error('CallsPage: Error parsing stored call:', error);
        }
      }
    };
    
    // Check immediately
    checkStoredCall();
    
    // Also check periodically in case we just navigated here
    const checkInterval = setInterval(checkStoredCall, 500);
    
    // Listen for call initiation from ChatPage
    const handleInitiateCall = (event: CustomEvent) => {
      console.log('CallsPage: ========== INITIATE CALL FROM CHAT ==========');
      console.log('CallsPage: Call initiation data:', event.detail);
      
      const initData = event.detail;
      // Find the user and set them as selected, then start the call
      const targetUser = users.find(u => u.id === initData.recipientId);
      if (targetUser) {
        setSelectedUser(targetUser);
        setCallType(initData.callType);
        // Auto-start the call after a short delay to ensure state is set
        setTimeout(() => {
          startCall();
        }, 300);
      } else {
        // If user not loaded yet, wait for users to load
        console.log('CallsPage: User not found, waiting for users to load...');
        fetchUsers().then(() => {
          const targetUser = users.find(u => u.id === initData.recipientId);
          if (targetUser) {
            setSelectedUser(targetUser);
            setCallType(initData.callType);
            setTimeout(() => {
              startCall();
            }, 300);
          }
        });
      }
      
      // Clear from sessionStorage
      sessionStorage.removeItem('initiate-call');
      console.log('CallsPage: ============================================');
    };
    
    window.addEventListener('initiate-call', handleInitiateCall as EventListener);
    
    // Check sessionStorage for incoming call on mount (in case we navigated here)
    const storedCall = sessionStorage.getItem('incoming-call');
    if (storedCall) {
      try {
        const callData = JSON.parse(storedCall);
        console.log('CallsPage: Found stored incoming call:', callData);
        setIncomingCall(callData);
        // Clear it after reading
        sessionStorage.removeItem('incoming-call');
      } catch (error) {
        console.error('CallsPage: Error parsing stored call:', error);
      }
    }
    
    // Check sessionStorage for call initiation
    const storedInitCall = sessionStorage.getItem('initiate-call');
    if (storedInitCall) {
      try {
        const initData = JSON.parse(storedInitCall);
        console.log('CallsPage: Found stored call initiation:', initData);
        handleInitiateCall({ detail: initData } as CustomEvent);
      } catch (error) {
        console.error('CallsPage: Error parsing stored call initiation:', error);
      }
    }
    
    socketRef.current = socket;

    return () => {
      window.removeEventListener('incoming-call-received', handleIncomingCall as EventListener);
      window.removeEventListener('initiate-call', handleInitiateCall as EventListener);
      if (checkInterval) {
        clearInterval(checkInterval);
      }
      console.log('CallsPage: Cleaning up socket connection');
      socket.disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch users function
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const token = getAuthToken();
      if (!token) {
        console.error('CallsPage: No auth token found');
        setLoadingUsers(false);
        return;
      }
      
      console.log('CallsPage: Fetching users from:', `${API_BASE_URL}/api/users`);
      
      // Try primary endpoint first
      let response = await fetch(`${API_BASE_URL}/api/users`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      console.log('CallsPage: Users API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('CallsPage: Loaded users from /api/users:', data?.length || 0, data);
        const usersList = Array.isArray(data) ? data : [];
        setUsers(usersList);
        setFilteredUsers(usersList);
      } else {
        const errorText = await response.text();
        console.error('CallsPage: Failed to fetch from /api/users:', response.status, errorText);
        
        // Try alternative endpoint
        console.log('CallsPage: Trying alternative endpoint:', `${API_BASE_URL}/api/calls/users`);
        response = await fetch(`${API_BASE_URL}/api/calls/users`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        
        if (response.ok) {
          const altData = await response.json();
          console.log('CallsPage: Loaded users from /api/calls/users:', altData?.length || 0);
          const usersList = Array.isArray(altData) ? altData : [];
          setUsers(usersList);
          setFilteredUsers(usersList);
        } else {
          console.error('CallsPage: Both endpoints failed');
        }
      }
    } catch (error) {
      console.error('CallsPage: Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on dial input
  useEffect(() => {
    if (!dialInput.trim()) {
      setFilteredUsers(users);
      setSelectedUser(null);
    } else {
      const filtered = users.filter(u => 
        u.fullName.toLowerCase().includes(dialInput.toLowerCase())
      );
      setFilteredUsers(filtered);
      if (filtered.length === 1) {
        setSelectedUser(filtered[0]);
      }
    }
  }, [dialInput, users]);

  // Get media devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        const deviceList = await navigator.mediaDevices.enumerateDevices();
        
        setDevices({
          microphones: deviceList.filter(d => d.kind === 'audioinput'),
          speakers: deviceList.filter(d => d.kind === 'audiooutput'),
          cameras: deviceList.filter(d => d.kind === 'videoinput'),
        });
      } catch (error) {
        console.error('Error getting devices:', error);
      }
    };
    getDevices();
  }, []);

  // Initialize Agora client
  const initAgoraClient = () => {
    if (!clientRef.current) {
      clientRef.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      
      clientRef.current.on('user-published', async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
        try {
          console.log('CallsPage: User published event - user:', user.uid, 'mediaType:', mediaType);
          await clientRef.current?.subscribe(user, mediaType);
          console.log('CallsPage: ✓ Subscribed to remote', mediaType, 'from user:', user.uid);
          
          if (mediaType === 'video' && user.videoTrack) {
            console.log('CallsPage: Setting up remote video track');
            setHasRemoteVideo(true);
            
            // Wait for DOM to be ready, with retries
            let retries = 0;
            const setupVideo = () => {
              if (remoteVideoRef.current) {
                try {
                  // Clear any existing content
                  const existingVideo = remoteVideoRef.current.querySelector('video');
                  if (existingVideo) {
                    existingVideo.remove();
                  }
                  
                  // Play video track directly in the container
                  user.videoTrack?.play(remoteVideoRef.current);
                  console.log('CallsPage: ✓ Playing remote video in remoteVideoRef');
                } catch (error) {
                  console.error('CallsPage: Error playing remote video:', error);
                }
              } else if (retries < 10) {
                retries++;
                setTimeout(setupVideo, 200);
              } else {
                console.warn('CallsPage: remoteVideoRef.current is null after retries');
              }
            };
            
            setTimeout(setupVideo, 100);
          }
          if (mediaType === 'audio' && user.audioTrack) {
            try {
              // Play remote audio track - this is critical for hearing the other user
              await user.audioTrack.play();
              console.log('CallsPage: ✓ Playing remote audio track - you should now hear the other user');
            } catch (error) {
              console.error('CallsPage: Error playing remote audio:', error);
              // Try to play again after a short delay
              setTimeout(() => {
                try {
                  user.audioTrack?.play();
                  console.log('CallsPage: ✓ Retried playing remote audio');
                } catch (retryError) {
                  console.error('CallsPage: Retry failed:', retryError);
                }
              }, 500);
            }
          }
        } catch (error) {
          console.error('CallsPage: Error handling user-published:', error);
        }
      });

      clientRef.current.on('user-unpublished', (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
        console.log('User unpublished', mediaType);
        if (mediaType === 'video' && user.videoTrack) {
          user.videoTrack.stop();
          setHasRemoteVideo(false);
        }
        if (mediaType === 'audio' && user.audioTrack) {
          user.audioTrack.stop();
        }
      });

      clientRef.current.on('user-left', (user: IAgoraRTCRemoteUser) => {
        console.log('Remote user left:', user.uid);
        toast.info('The other user left the call');
        endCall();
      });

      clientRef.current.on('user-joined', (user: IAgoraRTCRemoteUser) => {
        console.log('Remote user joined:', user.uid);
      });
    }
    return clientRef.current;
  };

  // Start call
  const startCall = async () => {
    if (!selectedUser) {
      toast.error('Please select a user to call');
      return;
    }

    // Prevent starting a new call if one is already in progress
    if (callState?.isInCall) {
      toast.warning('A call is already in progress. Please end the current call first.');
      return;
    }

    try {
      const token = getAuthToken();
      const currentUser = getCurrentUser();
      
      // Get Agora token from backend
      const response = await fetch(`${API_BASE_URL}/api/calls/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientId: selectedUser.id,
          callType: callType === 'meeting' ? 'video' : callType,
        }),
      });

      if (!response.ok) throw new Error('Failed to start call');
      
      const data = await response.json();
      
      // Validate channel name length
      if (data.channelName.length > 64) {
        throw new Error('Channel name is too long. Please try again.');
      }

      console.log('Starting call with channel:', data.channelName, 'token length:', data.token?.length);

      // Initialize Agora client
      const client = initAgoraClient();
      
      // Check if client is already connected and leave if necessary
      if (client.connectionState === 'CONNECTED' || client.connectionState === 'CONNECTING') {
        console.log('CallsPage: Client already connected/connecting, leaving previous channel...');
        try {
          // Unpublish all tracks first
          await client.unpublish();
          // Leave the channel
          await client.leave();
          console.log('CallsPage: ✓ Left previous channel');
          // Wait a bit for cleanup
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (leaveError) {
          console.warn('CallsPage: Error leaving previous channel:', leaveError);
          // Try to continue anyway
        }
      }
      
      // Now join the new channel
      console.log('CallsPage: Joining new channel...');
      await client.join(AGORA_APP_ID, data.channelName, data.token, 0);
      console.log('CallsPage: ✓ Joined Agora channel successfully');

      // Create and publish tracks
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      localAudioTrackRef.current = audioTrack;
      
      if (callType === 'video' || callType === 'meeting') {
        const videoTrack = await AgoraRTC.createCameraVideoTrack();
        localVideoTrackRef.current = videoTrack;
        setHasLocalVideo(true);
        
        // Wait for DOM to be ready, with retries
        let retries = 0;
        const setupLocalVideo = () => {
          if (localVideoRef.current) {
            try {
              // Clear any existing content
              const existingVideo = localVideoRef.current.querySelector('video');
              if (existingVideo) {
                existingVideo.remove();
              }
              
              // Play local video track directly in the container
              videoTrack.play(localVideoRef.current);
              console.log('CallsPage: ✓ Playing local video in localVideoRef');
            } catch (error) {
              console.error('CallsPage: Error playing local video:', error);
            }
          } else if (retries < 10) {
            retries++;
            setTimeout(setupLocalVideo, 200);
          } else {
            console.warn('CallsPage: localVideoRef.current is null after retries');
          }
        };
        
        setTimeout(setupLocalVideo, 100);
        await client.publish([audioTrack, videoTrack]);
        console.log('CallsPage: ✓ Published audio and video tracks');
      } else {
        await client.publish([audioTrack]);
        console.log('CallsPage: ✓ Published audio track');
      }

      // Notify recipient via socket
      console.log('CallsPage: ========== INITIATING CALL ==========');
      console.log('CallsPage: Recipient ID:', selectedUser.id);
      console.log('CallsPage: Recipient name:', selectedUser.fullName);
      console.log('CallsPage: Channel name:', data.channelName);
      console.log('CallsPage: Call type:', callType === 'meeting' ? 'video' : callType);
      const normalizedUser = getCurrentUser();
      console.log('CallsPage: Current user ID:', normalizedUser?.id);
      console.log('CallsPage: Current user name:', normalizedUser?.fullName || normalizedUser?.name);
      
      if (!socketRef.current) {
        console.error('CallsPage: ✗ Socket ref is null!');
        toast.error('Socket not initialized. Please refresh the page.');
        return;
      }
      
      if (!socketRef.current.connected) {
        console.error('CallsPage: ✗ Socket not connected! Connected:', socketRef.current.connected);
        console.error('CallsPage: Socket ID:', socketRef.current.id);
        toast.error('Not connected to server. Please refresh the page.');
        return;
      }
      
      console.log('CallsPage: ✓ Socket is connected, socket ID:', socketRef.current.id);
      
      // Get current user data (normalized to have fullName)
      const currentUserData = getCurrentUser();
      if (!currentUserData || !currentUserData.id) {
        console.error('CallsPage: Current user data is missing!', currentUserData);
        toast.error('Unable to get your user information. Please refresh the page.');
        return;
      }
      
      // Ensure fullName exists (normalized in getCurrentUser, but double-check)
      const callerFullName = currentUserData.fullName || currentUserData.name || 'Unknown User';
      
      const callInitiateData = {
        recipientId: selectedUser.id,
        channelName: data.channelName,
        callType: callType === 'meeting' ? 'video' : callType,
        caller: {
          id: currentUserData.id || '',
          fullName: callerFullName,
          profilePicture: currentUserData.profilePicture,
        },
        token: data.token,
      };
      
      console.log('CallsPage: Caller data:', callInitiateData.caller);
      console.log('CallsPage: Current user object:', currentUserData);
      
      console.log('CallsPage: Emitting call:initiate with data:', JSON.stringify(callInitiateData, null, 2));
      
      socketRef.current.emit('call:initiate', callInitiateData);
      
      console.log('CallsPage: ✓ Call initiation event emitted');
      console.log('CallsPage: ====================================');

      // Set call state
      setCallState({
        isInCall: true,
        callType: callType === 'meeting' ? 'video' : callType,
        channelName: data.channelName,
        remoteUser: selectedUser,
        isMuted: false,
        isVideoOff: false,
        callDuration: 0,
      });
      
      // Clear previous messages
      setCallMessages([]);
      setHasRemoteVideo(false);
      setHasLocalVideo(false);
      
      // Show meeting ready popup for a few seconds
      setShowMeetingReady(true);
      setTimeout(() => {
        setShowMeetingReady(false);
      }, 5000);

      // Start call timer
      callTimerRef.current = setInterval(() => {
        setCallState(prev => prev ? { ...prev, callDuration: prev.callDuration + 1 } : null);
      }, 1000);

      toast.success(`Calling ${selectedUser.fullName}...`);
    } catch (error) {
      console.error('Error starting call:', error);
      toast.error('Failed to start call');
    }
  };

  // Answer incoming call
  const answerCall = async () => {
    if (!incomingCall) {
      console.error('CallsPage: No incoming call to answer');
      toast.error('No incoming call found');
      return;
    }

    console.log('CallsPage: ========== ANSWERING CALL ==========');
    console.log('CallsPage: Incoming call:', incomingCall);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Get token for this channel
      console.log('CallsPage: Requesting token for channel:', incomingCall.channelName);
      const response = await fetch(`${API_BASE_URL}/api/calls/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          channelName: incomingCall.channelName,
          uid: 0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to get token: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('CallsPage: ✓ Token received, length:', data.token?.length);
      console.log('CallsPage: Channel name:', incomingCall.channelName);

      // Initialize Agora client
      console.log('CallsPage: Initializing Agora client...');
      const client = initAgoraClient();
      
      // Check if client is already connected and leave if necessary
      if (client.connectionState === 'CONNECTED' || client.connectionState === 'CONNECTING') {
        console.log('CallsPage: Client already connected/connecting, leaving previous channel...');
        try {
          // Unpublish all tracks first
          await client.unpublish();
          // Leave the channel
          await client.leave();
          console.log('CallsPage: ✓ Left previous channel');
          // Wait a bit for cleanup
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (leaveError) {
          console.warn('CallsPage: Error leaving previous channel:', leaveError);
          // Try to continue anyway
        }
      }
      
      console.log('CallsPage: Joining Agora channel...');
      await client.join(AGORA_APP_ID, incomingCall.channelName, data.token, 0);
      console.log('CallsPage: ✓ Joined Agora channel successfully');

      // Request media permissions first
      console.log('CallsPage: Requesting media permissions...');
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true, video: incomingCall.callType === 'video' });
        console.log('CallsPage: ✓ Media permissions granted');
      } catch (permError: any) {
        console.error('CallsPage: Media permission error:', permError);
        throw new Error(`Media permission denied: ${permError.message}`);
      }

      // Create and publish tracks
      console.log('CallsPage: Creating audio track...');
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      localAudioTrackRef.current = audioTrack;
      console.log('CallsPage: ✓ Audio track created');
      
      if (incomingCall.callType === 'video') {
        console.log('CallsPage: Creating video track...');
        const videoTrack = await AgoraRTC.createCameraVideoTrack();
        localVideoTrackRef.current = videoTrack;
        setHasLocalVideo(true);
        console.log('CallsPage: ✓ Video track created');
        
        // Wait for DOM to be ready, with retries
        let retries = 0;
        const setupLocalVideo = () => {
          if (localVideoRef.current) {
            try {
              // Clear any existing content
              const existingVideo = localVideoRef.current.querySelector('video');
              if (existingVideo) {
                existingVideo.remove();
              }
              
              // Play local video track directly in the container
              videoTrack.play(localVideoRef.current);
              console.log('CallsPage: ✓ Playing local video in localVideoRef (answer call)');
            } catch (error) {
              console.error('CallsPage: Error playing local video:', error);
            }
          } else if (retries < 10) {
            retries++;
            setTimeout(setupLocalVideo, 200);
          } else {
            console.warn('CallsPage: localVideoRef.current is null after retries');
          }
        };
        
        setTimeout(setupLocalVideo, 100);
        
        console.log('CallsPage: Publishing audio and video tracks...');
        await client.publish([audioTrack, videoTrack]);
        console.log('CallsPage: ✓ Published audio and video tracks (answer call)');
      } else {
        console.log('CallsPage: Publishing audio track only...');
        await client.publish([audioTrack]);
        console.log('CallsPage: ✓ Published audio track (answer call)');
      }

      // Notify caller
      console.log('CallsPage: Notifying caller of acceptance...');
      socketRef.current?.emit('call:accept', {
        channelName: incomingCall.channelName,
        callerId: incomingCall.caller.id,
      });
      console.log('CallsPage: ✓ Call acceptance notification sent');

      // Set call state BEFORE clearing incoming call
      // Ensure remoteUser has all necessary fields
      const remoteUser = {
        id: incomingCall.caller.id,
        fullName: incomingCall.caller.fullName || incomingCall.caller.name || 'Unknown User',
        name: incomingCall.caller.name || incomingCall.caller.fullName || 'Unknown User',
        profilePicture: incomingCall.caller.profilePicture,
        isOnline: true,
      };
      
      const newCallState = {
        isInCall: true,
        callType: incomingCall.callType,
        channelName: incomingCall.channelName,
        remoteUser: remoteUser,
        isMuted: false,
        isVideoOff: false,
        callDuration: 0,
      };
      
      console.log('CallsPage: Setting call state with remoteUser:', remoteUser);
      setCallState(newCallState);
      console.log('CallsPage: ✓ Call state set - Google Meet interface should now be visible');
      
      // Clear previous messages and reset video states
      setCallMessages([]);
      setHasRemoteVideo(false);
      // Don't reset hasLocalVideo here if we just set it
      
      // Show meeting ready popup for a few seconds
      setShowMeetingReady(true);
      setTimeout(() => {
        setShowMeetingReady(false);
      }, 5000);

      // Start call timer
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      callTimerRef.current = setInterval(() => {
        setCallState(prev => prev ? { ...prev, callDuration: prev.callDuration + 1 } : null);
      }, 1000);

      // Clear incoming call AFTER setting call state
      setIncomingCall(null);
      console.log('CallsPage: ✓ Incoming call cleared');
      console.log('CallsPage: ====================================');
      
      toast.success('Call connected!');
    } catch (error: any) {
      console.error('CallsPage: ✗ Error answering call:', error);
      console.error('CallsPage: Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      toast.error(`Failed to answer call: ${error.message || 'Unknown error'}`);
      
      // Reset state on error
      setIncomingCall(null);
    }
  };

  // Reject incoming call
  const rejectCall = () => {
    if (incomingCall) {
      socketRef.current?.emit('call:reject', {
        channelName: incomingCall.channelName,
        callerId: incomingCall.caller.id,
      });
      setIncomingCall(null);
    }
  };

  // End call
  const endCall = async () => {
    try {
      console.log('CallsPage: ========== ENDING CALL ==========');
      
      // Stop timer
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }

      // Unpublish tracks first
      if (clientRef.current) {
        try {
          await clientRef.current.unpublish();
          console.log('CallsPage: ✓ Unpublished tracks');
        } catch (error) {
          console.warn('CallsPage: Error unpublishing tracks:', error);
        }
      }

      // Close tracks
      try {
        localAudioTrackRef.current?.close();
        localVideoTrackRef.current?.close();
        console.log('CallsPage: ✓ Closed local tracks');
      } catch (error) {
        console.warn('CallsPage: Error closing tracks:', error);
      }
      
      localAudioTrackRef.current = null;
      localVideoTrackRef.current = null;

      // Leave channel
      if (clientRef.current) {
        try {
          if (clientRef.current.connectionState === 'CONNECTED' || clientRef.current.connectionState === 'CONNECTING') {
            await clientRef.current.leave();
            console.log('CallsPage: ✓ Left Agora channel');
          } else {
            console.log('CallsPage: Client not connected, skipping leave');
          }
        } catch (error) {
          console.warn('CallsPage: Error leaving channel:', error);
        }
      }

      // Reset video states
      setHasRemoteVideo(false);
      setHasLocalVideo(false);
      setCallMessages([]);
      setShowChat(false);

      // Notify other user
      if (callState) {
        socketRef.current?.emit('call:end', {
          channelName: callState.channelName,
          recipientId: callState.remoteUser?.id,
        });

        // Add to call history
        const newHistoryItem: CallHistoryItem = {
          id: Date.now().toString(),
          contact: callState.remoteUser?.fullName || 'Unknown',
          contactId: callState.remoteUser?.id || '',
          type: callState.callType,
          when: new Date().toLocaleTimeString(),
          duration: formatDuration(callState.callDuration),
          status: 'completed',
        };
        setCallHistory(prev => [newHistoryItem, ...prev]);
      }

      setCallState(null);
      setShowMeetingReady(false);
      
      console.log('CallsPage: ✓ Call ended successfully');
      console.log('CallsPage: ====================================');
      
      toast.success('Call ended');
    } catch (error) {
      console.error('CallsPage: ✗ Error ending call:', error);
      // Reset state anyway
      setCallState(null);
      setShowMeetingReady(false);
      toast.error('Failed to end call');
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (localAudioTrackRef.current && callState) {
      const newMuted = !callState.isMuted;
      localAudioTrackRef.current.setEnabled(!newMuted);
      setCallState({ ...callState, isMuted: newMuted });
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localVideoTrackRef.current && callState) {
      const newVideoOff = !callState.isVideoOff;
      localVideoTrackRef.current.setEnabled(!newVideoOff);
      setHasLocalVideo(!newVideoOff);
      setCallState({ ...callState, isVideoOff: newVideoOff });
    }
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Create meeting link
  const createMeetingLink = () => {
    const meetingId = `meet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const link = `${window.location.origin}/join/${meetingId}`;
    setMeetingLink(link);
  };

  // Copy meeting link
  const copyMeetingLink = () => {
    navigator.clipboard.writeText(meetingLink);
    setLinkCopied(true);
    toast.success('Meeting link copied!');
    setTimeout(() => setLinkCopied(false), 2000);
  };

  // Test devices
  const testDevices = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      toast.success('Devices working correctly!');
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      toast.error('Failed to access devices. Please check permissions.');
    }
  };

  // Callback user from history
  const callBackUser = (historyItem: CallHistoryItem) => {
    const user = users.find(u => u.id === historyItem.contactId);
    if (user) {
      setSelectedUser(user);
      setDialInput(user.fullName);
      setCallType(historyItem.type);
    }
  };

  // Send chat message during call
  const sendCallMessage = () => {
    if (!chatInput.trim() || !callState) return;
    
    const currentUser = getCurrentUser();
    const newMessage = {
      id: Date.now().toString(),
      sender: currentUser?.fullName || currentUser?.name || 'You',
      senderId: currentUser?.id || '',
      text: chatInput.trim(),
      timestamp: new Date(),
    };
    
    setCallMessages([...callMessages, newMessage]);
    
    // Emit to socket for real-time chat
    socketRef.current?.emit('call:message', {
      channelName: callState.channelName,
      message: newMessage,
    });
    
    setChatInput('');
  };

  // Listen for call messages
  useEffect(() => {
    if (!socketRef.current || !callState) return;
    
    const handleCallMessage = (data: {channelName: string; message: typeof callMessages[0]}) => {
      // Only add message if it's for the current call
      if (data.channelName === callState.channelName) {
        setCallMessages(prev => [...prev, data.message]);
      }
    };
    
    socketRef.current.on('call:message', handleCallMessage);
    
    return () => {
      socketRef.current?.off('call:message', handleCallMessage);
    };
  }, [callState]);

  // Debug: Log incoming call state changes (MUST be before any early returns)
  useEffect(() => {
    console.log('CallsPage: Incoming call state changed:', incomingCall);
    if (incomingCall) {
      console.log('CallsPage: Modal should be visible - incomingCall exists');
      console.log('CallsPage: Channel:', incomingCall.channelName);
      console.log('CallsPage: Caller:', incomingCall.caller);
    } else {
      console.log('CallsPage: No incoming call - modal should be hidden');
    }
  }, [incomingCall]);

  // Auto-answer effect: when pendingAutoAnswer is true and we have an incoming call, answer it
  useEffect(() => {
    if (pendingAutoAnswer && incomingCall && incomingCall.channelName) {
      console.log('CallsPage: ========== AUTO-ANSWERING CALL ==========');
      console.log('CallsPage: pendingAutoAnswer:', pendingAutoAnswer);
      console.log('CallsPage: incomingCall:', incomingCall);
      
      // Reset the flag immediately to prevent double-answering
      setPendingAutoAnswer(false);
      
      // Small delay to ensure component is fully ready
      const autoAnswerTimeout = setTimeout(async () => {
        try {
          console.log('CallsPage: Executing auto-answer...');
          await answerCall();
          console.log('CallsPage: ✓ Auto-answer completed successfully');
        } catch (error) {
          console.error('CallsPage: ✗ Auto-answer failed:', error);
          toast.error('Failed to auto-answer call. Please click Answer manually.');
        }
      }, 500);
      
      return () => clearTimeout(autoAnswerTimeout);
    }
  }, [pendingAutoAnswer, incomingCall]);

  // Active call UI - Google Meet style
  if (callState?.isInCall) {
    const currentUser = getCurrentUser();
    const remoteUserInitials = callState.remoteUser?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
    const localUserName = currentUser?.fullName || currentUser?.name || 'You';
    const localUserInitials = localUserName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
    const remoteUserProfilePic = callState.remoteUser?.profilePicture;
    const currentUserProfilePic = currentUser?.profilePicture;

    const currentUserEmail = currentUser?.email || 'user@example.com';

    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#202124] relative">
        {/* "Your meeting's ready" Popup */}
        {showMeetingReady && (
          <div className="absolute left-6 top-1/2 -translate-y-1/2 z-50 bg-white rounded-lg shadow-2xl p-6 w-80 animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Your meeting's ready</h3>
              <button
                onClick={() => setShowMeetingReady(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <button className="w-full mb-4 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors">
              <Users className="w-5 h-5" />
              <span>+ Add others</span>
            </button>
            
            <p className="text-sm text-gray-600 mb-3">
              Or share this meeting link with others you want in the meeting
            </p>
            
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                readOnly
                value={`meet.iru-chat.com/${callState.channelName.substring(0, 12)}`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`meet.iru-chat.com/${callState.channelName.substring(0, 12)}`);
                  toast.success('Meeting link copied!');
                }}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Copy className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
              <Lock className="w-3 h-3" />
              <span>People who use this meeting link must get your permission before they can join.</span>
            </div>
            
            <div className="text-xs text-gray-500 border-t pt-3">
              Joined as {currentUserEmail}
            </div>
          </div>
        )}
        
        {/* Top bar - Participant count with profile picture (top-right) */}
        <div className="absolute top-0 right-0 z-20 p-4">
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5">
            {remoteUserProfilePic ? (
              <img 
                src={remoteUserProfilePic} 
                alt={callState.remoteUser?.fullName || 'Participant'} 
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-[#3c4043] flex items-center justify-center">
                <span className="text-xs font-medium text-white">{remoteUserInitials[0]}</span>
              </div>
            )}
            <span className="text-white text-sm font-medium">1</span>
          </div>
        </div>

        {/* Main content area with video and chat */}
        <div className="flex-1 flex relative overflow-hidden">
          {/* Main video area - Full screen */}
          <div className={`flex-1 relative flex items-center justify-center transition-all duration-300 ${showChat ? 'mr-80' : ''}`}>
            {/* Remote video (main, large) - Full screen container with solid background */}
            <div 
              ref={remoteVideoRef}
              className="absolute inset-0 w-full h-full bg-[#8B1538] flex items-center justify-center"
              style={{ minHeight: '100%' }}
            >
              {/* Fallback avatar when no video - Centered with profile picture */}
              {(!hasRemoteVideo || callState.callType === 'voice') && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="text-center">
                    <div className="w-32 h-32 rounded-full bg-[#3c4043] flex items-center justify-center mx-auto shadow-2xl border-4 border-pink-500">
                      {remoteUserProfilePic ? (
                        <img 
                          src={remoteUserProfilePic} 
                          alt={callState.remoteUser?.fullName || 'Unknown'} 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-5xl font-medium text-white">
                          {remoteUserInitials}
                        </span>
                      )}
                    </div>
                    {callState.callType === 'video' && !hasRemoteVideo && (
                      <p className="text-gray-300 text-sm mt-4">Waiting for video...</p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Participant name in bottom-left */}
              <div className="absolute bottom-4 left-4 z-20">
                <p className="text-white text-base font-medium bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  {callState.remoteUser?.fullName || 'Unknown'}
                </p>
              </div>
            </div>

            {/* Local video (picture-in-picture, bottom-right) */}
            {callState.callType === 'video' && (
              <div className="absolute bottom-20 right-6 w-64 h-48 rounded-xl overflow-hidden bg-[#1a1a1a] border-2 border-white/30 shadow-2xl z-10">
                <div 
                  ref={localVideoRef}
                  className="w-full h-full bg-[#1a1a1a] flex items-center justify-center"
                  style={{ minHeight: '100%' }}
                >
                  {/* Fallback when local video is off */}
                  {(callState.isVideoOff || !hasLocalVideo) && (
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-[#3c4043] z-10">
                      {currentUserProfilePic ? (
                        <img 
                          src={currentUserProfilePic} 
                          alt={currentUser?.fullName || currentUser?.name || 'You'} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl font-medium text-white">
                          {localUserInitials}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {/* Local video label */}
                <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm rounded px-2 py-1 text-white text-xs font-medium">
                  {currentUser?.fullName || currentUser?.name || 'You'}
                </div>
              </div>
            )}
          </div>

          {/* Chat Panel (slide in from right) */}
          {showChat && (
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-[#1f1f1f] border-l border-white/10 flex flex-col z-30 shadow-2xl">
              {/* Chat Header */}
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-white font-medium text-sm">Chat</h3>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {callMessages.length === 0 ? (
                  <div className="text-center text-gray-400 text-sm mt-8">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No messages yet</p>
                  </div>
                ) : (
                  callMessages.map((msg) => {
                    const isOwn = msg.senderId === currentUser?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[75%] rounded-lg px-3 py-2 ${
                          isOwn 
                            ? 'bg-[#0b57d0] text-white' 
                            : 'bg-[#3c4043] text-white'
                        }`}>
                          {!isOwn && (
                            <p className="text-xs text-gray-300 mb-1">{msg.sender}</p>
                          )}
                          <p className="text-sm">{msg.text}</p>
                          <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Input */}
              <div className="px-4 py-3 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendCallMessage()}
                    placeholder="Type a message..."
                    className="flex-1 bg-[#3c4043] text-white placeholder-gray-400 rounded-lg px-3 py-2 text-sm border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#0b57d0]"
                  />
                  <button
                    onClick={sendCallMessage}
                    disabled={!chatInput.trim()}
                    className="p-2 bg-[#0b57d0] text-white rounded-lg hover:bg-[#0d47a1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Control bar (bottom, Google Meet style) - Dark grey bar */}
        <div className="bg-[#2d2e30] border-t border-white/5 px-6 py-3 z-20">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Left: Time and meeting code */}
            <div className="flex items-center gap-3 text-white text-sm">
              <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400 font-mono">{callState.channelName.substring(0, 12)}</span>
            </div>

            {/* Center: Main controls */}
            <div className="flex items-center gap-1">
              {/* Mute button */}
              <button
                onClick={toggleMute}
                className={`p-3 rounded-full transition-all ${
                  callState.isMuted 
                    ? 'bg-[#ea4335] text-white hover:bg-[#d33b2c]' 
                    : 'bg-[#3c4043] text-white hover:bg-[#5f6368]'
                }`}
                title={callState.isMuted ? 'Unmute' : 'Mute'}
              >
                {callState.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Video button */}
              {callState.callType === 'video' && (
                <button
                  onClick={toggleVideo}
                  className={`p-3 rounded-full transition-all ${
                    callState.isVideoOff 
                      ? 'bg-[#ea4335] text-white hover:bg-[#d33b2c]' 
                      : 'bg-[#3c4043] text-white hover:bg-[#5f6368]'
                  }`}
                  title={callState.isVideoOff ? 'Turn on camera' : 'Turn off camera'}
                >
                  {callState.isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>
              )}

              {/* Screen Share button */}
              <button
                onClick={() => toast.info('Screen sharing coming soon')}
                className="p-3 rounded-full bg-[#3c4043] text-white hover:bg-[#5f6368] transition-all"
                title="Present now"
              >
                <Monitor className="w-5 h-5" />
              </button>

              {/* Reactions button */}
              <button
                onClick={() => toast.info('Reactions coming soon')}
                className="p-3 rounded-full bg-[#3c4043] text-white hover:bg-[#5f6368] transition-all"
                title="Send a reaction"
              >
                <Smile className="w-5 h-5" />
              </button>

              {/* Closed Captions button */}
              <button
                onClick={() => toast.info('Closed captions coming soon')}
                className="p-3 rounded-full bg-[#3c4043] text-white hover:bg-[#5f6368] transition-all"
                title="Turn on captions"
              >
                <Captions className="w-5 h-5" />
              </button>

              {/* Raise Hand button */}
              <button
                onClick={() => toast.info('Raise hand coming soon')}
                className="p-3 rounded-full bg-[#3c4043] text-white hover:bg-[#5f6368] transition-all"
                title="Raise hand"
              >
                <Hand className="w-5 h-5" />
              </button>

              {/* More Options button */}
              <button
                onClick={() => toast.info('More options coming soon')}
                className="p-3 rounded-full bg-[#3c4043] text-white hover:bg-[#5f6368] transition-all"
                title="More options"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {/* End call button (large, red) */}
              <button
                onClick={endCall}
                className="p-3 rounded-full bg-[#ea4335] text-white hover:bg-[#d33b2c] transition-all ml-2"
                title="Leave call"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>

            {/* Right: Additional options */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => toast.info('Meeting details')}
                className="p-2 rounded-full bg-transparent text-white hover:bg-[#3c4043] transition-all"
                title="Meeting details"
              >
                <Info className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowChat(!showChat)}
                className={`p-2 rounded-full transition-all ${
                  showChat 
                    ? 'bg-[#0b57d0] text-white hover:bg-[#0d47a1]' 
                    : 'bg-transparent text-white hover:bg-[#3c4043]'
                }`}
                title={showChat ? 'Hide chat' : 'Show chat'}
              >
                <MessageSquare className="w-5 h-5" />
              </button>
              <button
                onClick={() => toast.info('Change layout')}
                className="p-2 rounded-full bg-transparent text-white hover:bg-[#3c4043] transition-all"
                title="Change layout"
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => toast.info('Security')}
                className="p-2 rounded-full bg-transparent text-white hover:bg-[#3c4043] transition-all"
                title="Security"
              >
                <Lock className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Incoming Call Modal - Enhanced with ringing animation */}
      {incomingCall && incomingCall.channelName && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className={`${cardBg} rounded-2xl ${shadow} p-8 max-w-md w-full text-center border-2 ${isDark ? 'border-blue-500/50' : 'border-blue-500'}`}>
            {/* Animated ringing indicator */}
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto shadow-2xl animate-pulse">
                {incomingCall.caller.profilePicture ? (
                  <img 
                    src={incomingCall.caller.profilePicture} 
                    alt={incomingCall.caller.fullName || incomingCall.caller.name || 'Caller'}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-white">
                    {(incomingCall.caller.fullName || incomingCall.caller.name)?.charAt(0) || '?'}
                  </span>
                )}
              </div>
              {/* Ringing animation circles */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="absolute w-24 h-24 rounded-full border-4 border-blue-500 animate-ping opacity-75"></div>
                <div className="absolute w-32 h-32 rounded-full border-4 border-blue-400 animate-ping opacity-50" style={{ animationDelay: '0.5s' }}></div>
              </div>
            </div>
            
            <h3 className={`text-2xl font-bold ${textPrimary} mb-2`}>
              {incomingCall.caller.fullName || incomingCall.caller.name || 'Unknown Caller'}
            </h3>
            <p className={`${textMuted} mb-2 text-lg`}>
              {incomingCall.callType === 'video' ? '📹 Video Call' : '📞 Voice Call'}
            </p>
            <p className={`${textMuted} mb-8 text-sm`}>
              Incoming call...
            </p>
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('CallsPage: Reject button clicked');
                  rejectCall();
                }}
                className="p-5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all transform hover:scale-110 shadow-lg active:scale-95"
                title="Decline"
                type="button"
              >
                <PhoneOff className="w-7 h-7" />
              </button>
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('CallsPage: ========== ANSWER BUTTON CLICKED ==========');
                  console.log('CallsPage: Incoming call exists:', !!incomingCall);
                  console.log('CallsPage: Incoming call data:', JSON.stringify(incomingCall, null, 2));
                  console.log('CallsPage: Channel name:', incomingCall?.channelName);
                  
                  if (!incomingCall) {
                    console.error('CallsPage: ✗ incomingCall is null!');
                    toast.error('No incoming call found. Please wait for the call notification.');
                    return;
                  }
                  
                  if (!incomingCall.channelName) {
                    console.error('CallsPage: ✗ Channel name is missing!');
                    toast.error('Invalid call data. Please try again.');
                    return;
                  }
                  
                  console.log('CallsPage: ✓ All checks passed, calling answerCall()...');
                  
                  try {
                    await answerCall();
                    console.log('CallsPage: ✓ Answer call completed successfully');
                    console.log('CallsPage: Call interface should now be visible');
                  } catch (error: any) {
                    console.error('CallsPage: ✗ Error in answerCall:', error);
                    console.error('CallsPage: Error stack:', error.stack);
                    toast.error(`Failed to answer call: ${error.message || 'Unknown error'}`);
                  }
                  
                  console.log('CallsPage: ====================================');
                }}
                className="p-5 rounded-full bg-green-500 text-white hover:bg-green-600 transition-all transform hover:scale-110 shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Answer"
                type="button"
                disabled={!incomingCall || !incomingCall.channelName}
              >
                <Phone className="w-7 h-7" />
              </button>
            </div>
            
            <p className={`${textMuted} text-xs mt-6`}>
              Press the buttons above to answer or decline
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto p-6 ${isDark ? 'bg-[#0b0f17]' : 'bg-[#f6f8fd]'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
          {/* Start a Call Section */}
          <section className={`${cardBg} border ${cardBorder} rounded-[22px] ${shadow} overflow-hidden`}>
            <div className={`px-4 py-3.5 flex items-center justify-between gap-2.5 border-b ${cardBorder} ${cardHeaderBg}`}>
              <h2 className={`text-sm font-medium tracking-wide m-0 ${textPrimary}`}>Start a Call</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchUsers}
                  disabled={loadingUsers}
                  className={`p-1.5 rounded-lg transition-colors ${buttonInactive} disabled:opacity-50`}
                  title="Refresh users"
                >
                  <RefreshCw className={`w-4 h-4 ${textMuted} ${loadingUsers ? 'animate-spin' : ''}`} />
                </button>
                <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full border ${badgeBorder} ${badgeBg} ${textMuted} text-xs`}>
                  Voice • Video
                </span>
              </div>
            </div>
            <div className="p-4 space-y-4">
              {/* Call Type Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCallType('voice')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    callType === 'voice' ? buttonActive : buttonInactive
                  }`}
                >
                  <Phone className="w-4 h-4 inline mr-2" />
                  Voice call
                </button>
                <button
                  onClick={() => setCallType('video')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    callType === 'video' ? buttonActive : buttonInactive
                  }`}
                >
                  <Video className="w-4 h-4 inline mr-2" />
                  Video call
                </button>
                <button
                  onClick={() => { setCallType('meeting'); createMeetingLink(); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    callType === 'meeting' ? buttonActive : buttonInactive
                  }`}
                >
                  <Link className="w-4 h-4 inline mr-2" />
                  Create meeting
                </button>
              </div>

              {/* Meeting Link (if meeting type) */}
              {callType === 'meeting' && meetingLink && (
                <div className={`p-3 rounded-lg ${inputBg} border ${inputBorder}`}>
                  <p className={`text-xs ${textMuted} mb-2`}>Meeting Link:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={meetingLink}
                      readOnly
                      className={`flex-1 px-3 py-2 rounded-lg ${inputBg} border ${inputBorder} ${inputText} text-sm`}
                    />
                    <button
                      onClick={copyMeetingLink}
                      className={`px-3 py-2 rounded-lg border ${buttonActive}`}
                    >
                      {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Dial / Search */}
              <div className="space-y-2">
                <label className={`block text-xs ${textMuted}`} htmlFor="dial">
                  Search user to call
                </label>
                <div className="flex gap-2">
                  <input
                    id="dial"
                    type="text"
                    value={dialInput}
                    onChange={(e) => setDialInput(e.target.value)}
                    placeholder="Type a name..."
                    className={`flex-1 px-3 py-2 rounded-lg ${inputBg} border ${inputBorder} ${inputText} text-sm ${inputPlaceholder} focus:outline-none focus:ring-2 ${
                      isDark ? 'focus:ring-[rgba(110,168,255,0.35)]' : 'focus:ring-[rgba(37,99,235,0.35)]'
                    }`}
                  />
                  <button
                    onClick={startCall}
                    disabled={!selectedUser}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                      selectedUser ? buttonActive : buttonInactive
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    Call
                  </button>
                </div>
              </div>

              {/* User List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className={`block text-xs ${textMuted}`}>
                    {loadingUsers ? 'Loading users...' : filteredUsers.length > 0 ? `Available Users (${filteredUsers.length}${users.length !== filteredUsers.length ? ` of ${users.length}` : ''})` : users.length > 0 ? `No matches (${users.length} total)` : 'No users found'}
                  </label>
                  {users.length > 0 && filteredUsers.length === 0 && dialInput && (
                    <button
                      onClick={() => setDialInput('')}
                      className={`text-xs ${buttonActive} px-2 py-1 rounded`}
                    >
                      Clear
                    </button>
                  )}
                </div>
                {loadingUsers ? (
                  <div className={`p-4 text-center rounded-lg border ${inputBorder} ${textMuted} text-sm`}>
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                    <p>Loading users...</p>
                  </div>
                ) : filteredUsers.length > 0 ? (
                  <div className={`max-h-60 overflow-y-auto rounded-lg border ${inputBorder}`}>
                    {filteredUsers.map(user => {
                      if (!user || !user.id || !user.fullName) return null;
                      return (
                        <button
                          key={user.id}
                          onClick={() => { setSelectedUser(user); setDialInput(user.fullName); }}
                          className={`w-full px-3 py-2.5 text-left flex items-center gap-3 transition-colors border-b ${inputBorder} last:border-b-0 ${
                            selectedUser?.id === user.id 
                              ? buttonActive 
                              : `${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-300'} flex items-center justify-center flex-shrink-0`}>
                            {user.profilePicture ? (
                              <img src={user.profilePicture} alt={user.fullName} className="w-full h-full object-cover rounded-full" />
                            ) : (
                              <span className={`text-sm font-medium ${textPrimary}`}>
                                {user.fullName?.charAt(0) || '?'}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className={`text-sm font-medium ${textPrimary} truncate`}>{user.fullName}</p>
                              {user.isOnline && (
                                <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-green-400' : 'bg-green-500'} flex-shrink-0 ml-2`} title="Online" />
                              )}
                            </div>
                            <p className={`text-xs ${user.isOnline ? 'text-green-500' : textMuted}`}>
                              {user.isOnline ? 'Online' : 'Offline'}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : users.length === 0 ? (
                  <div className={`p-4 text-center rounded-lg border ${inputBorder} ${textMuted} text-sm`}>
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="font-medium mb-1">No users available</p>
                    <p className="text-xs">Please check your connection or try refreshing</p>
                    <button
                      onClick={fetchUsers}
                      className={`mt-3 text-xs ${buttonActive} px-4 py-2 rounded`}
                    >
                      <RefreshCw className="w-3 h-3 inline mr-1" />
                      Refresh
                    </button>
                  </div>
                ) : (
                  <div className={`p-4 text-center rounded-lg border ${inputBorder} ${textMuted} text-sm`}>
                    <p className="font-medium mb-1">No users match "{dialInput}"</p>
                    <p className="text-xs mb-2">Found {users.length} user{users.length !== 1 ? 's' : ''} total</p>
                    <button
                      onClick={() => setDialInput('')}
                      className={`text-xs ${buttonActive} px-4 py-2 rounded`}
                    >
                      Clear search
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Device Check Section */}
          <section className={`${cardBg} border ${cardBorder} rounded-[22px] ${shadow} overflow-hidden`}>
            <div className={`px-4 py-3.5 flex items-center justify-between gap-2.5 border-b ${cardBorder} ${cardHeaderBg}`}>
              <h2 className={`text-sm font-medium tracking-wide m-0 ${textPrimary}`}>Device Check</h2>
              <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full border ${badgeBorder} ${badgeBg} ${textMuted} text-xs`}>
                Audio/Video
              </span>
            </div>
            <div className="p-4 space-y-4">
              {/* Microphone and Speaker */}
              <div className="flex gap-2">
                <select
                  value={selectedDevices.microphone}
                  onChange={(e) => setSelectedDevices({ ...selectedDevices, microphone: e.target.value })}
                  className={`flex-1 px-3 py-2 rounded-lg ${inputBg} border ${inputBorder} ${inputText} text-sm focus:outline-none focus:ring-2 ${
                    isDark ? 'focus:ring-[rgba(110,168,255,0.35)]' : 'focus:ring-[rgba(37,99,235,0.35)]'
                  }`}
                >
                  <option value="">Microphone (default)</option>
                  {devices.microphones.map(d => (
                    <option key={d.deviceId} value={d.deviceId}>{d.label || 'Microphone'}</option>
                  ))}
                </select>
                <select
                  value={selectedDevices.speaker}
                  onChange={(e) => setSelectedDevices({ ...selectedDevices, speaker: e.target.value })}
                  className={`flex-1 px-3 py-2 rounded-lg ${inputBg} border ${inputBorder} ${inputText} text-sm focus:outline-none focus:ring-2 ${
                    isDark ? 'focus:ring-[rgba(110,168,255,0.35)]' : 'focus:ring-[rgba(37,99,235,0.35)]'
                  }`}
                >
                  <option value="">Speaker (default)</option>
                  {devices.speakers.map(d => (
                    <option key={d.deviceId} value={d.deviceId}>{d.label || 'Speaker'}</option>
                  ))}
                </select>
              </div>

              {/* Camera */}
              <div className="flex gap-2">
                <select
                  value={selectedDevices.camera}
                  onChange={(e) => setSelectedDevices({ ...selectedDevices, camera: e.target.value })}
                  className={`flex-1 px-3 py-2 rounded-lg ${inputBg} border ${inputBorder} ${inputText} text-sm focus:outline-none focus:ring-2 ${
                    isDark ? 'focus:ring-[rgba(110,168,255,0.35)]' : 'focus:ring-[rgba(37,99,235,0.35)]'
                  }`}
                >
                  <option value="">Camera (default)</option>
                  {devices.cameras.map(d => (
                    <option key={d.deviceId} value={d.deviceId}>{d.label || 'Camera'}</option>
                  ))}
                </select>
                <button
                  onClick={testDevices}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonInactive}`}
                >
                  Test
                </button>
              </div>

              <p className={`text-xs ${textMuted}`}>
                Select your preferred devices for calls.
              </p>
            </div>
          </section>

          {/* Recent Calls Section */}
          <section className={`lg:col-span-2 ${cardBg} border ${cardBorder} rounded-[22px] ${shadow} overflow-hidden`}>
            <div className={`px-4 py-3.5 flex items-center justify-between gap-2.5 border-b ${cardBorder} ${cardHeaderBg}`}>
              <h2 className={`text-sm font-medium tracking-wide m-0 ${textPrimary}`}>Recent Calls</h2>
              <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full border ${badgeBorder} ${badgeBg} ${textMuted} text-xs`}>
                {callHistory.length} calls
              </span>
            </div>
            <div className="p-4">
              {callHistory.length === 0 ? (
                <div className="text-center py-8">
                  <PhoneCall className={`w-12 h-12 ${textMuted} mx-auto mb-3 opacity-50`} />
                  <p className={`${textMuted}`}>No recent calls</p>
                  <p className={`text-xs ${textMuted} mt-1`}>Your call history will appear here</p>
                </div>
              ) : (
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr>
                      <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>Contact</th>
                      <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>Type</th>
                      <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>When</th>
                      <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>Duration</th>
                      <th className={`border-b ${tableBorder} px-2 py-2.5 text-left text-xs font-semibold ${textMuted}`}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {callHistory.map((call) => (
                      <tr key={call.id}>
                        <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>{call.contact}</td>
                        <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>
                          {call.type === 'video' ? <Video className="w-4 h-4 inline" /> : <Phone className="w-4 h-4 inline" />}
                          <span className="ml-1 capitalize">{call.type}</span>
                        </td>
                        <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>{call.when}</td>
                        <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>{call.duration}</td>
                        <td className={`border-b ${tableBorder} px-2 py-2.5 ${textPrimary}`}>
                          <button
                            onClick={() => callBackUser(call)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${buttonInactive}`}
                          >
                            Call back
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default CallsPage;
