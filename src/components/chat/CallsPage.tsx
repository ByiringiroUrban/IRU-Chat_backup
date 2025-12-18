import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { Phone, Video, Link, PhoneCall, PhoneOff, Mic, MicOff, VideoOff, Users, Copy, Check, X } from 'lucide-react';
import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack, IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';
import { toast } from 'sonner';
import { io, Socket } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const AGORA_APP_ID = import.meta.env.VITE_AGORA_APP_ID || "8d21c418598b4496907513003a6e123c";

interface User {
  id: string;
  fullName: string;
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
        return parsed.user;
      }
    } catch (e) {}
    return null;
  };

  // Initialize socket connection
  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;

    const socket = io(API_BASE_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('CallsPage: Socket connected');
    });

    socket.on('call:incoming', (data: IncomingCall) => {
      console.log('Incoming call:', data);
      setIncomingCall(data);
    });

    socket.on('call:accepted', async (data: { channelName: string; token: string }) => {
      console.log('Call accepted:', data);
      toast.success('Call accepted!');
    });

    socket.on('call:rejected', () => {
      toast.info('Call was rejected');
      endCall();
    });

    socket.on('call:ended', () => {
      toast.info('Call ended');
      endCall();
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/api/calls/users`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
          setFilteredUsers(data);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
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
        await clientRef.current?.subscribe(user, mediaType);
        console.log('Subscribed to', mediaType);
        
        if (mediaType === 'video' && remoteVideoRef.current) {
          user.videoTrack?.play(remoteVideoRef.current);
        }
        if (mediaType === 'audio') {
          user.audioTrack?.play();
        }
      });

      clientRef.current.on('user-unpublished', (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
        console.log('User unpublished', mediaType);
      });

      clientRef.current.on('user-left', () => {
        console.log('Remote user left');
        toast.info('The other user left the call');
        endCall();
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
      
      // Initialize Agora
      const client = initAgoraClient();
      await client.join(AGORA_APP_ID, data.channelName, data.token, 0);

      // Create and publish tracks
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      localAudioTrackRef.current = audioTrack;
      
      if (callType === 'video' || callType === 'meeting') {
        const videoTrack = await AgoraRTC.createCameraVideoTrack();
        localVideoTrackRef.current = videoTrack;
        if (localVideoRef.current) {
          videoTrack.play(localVideoRef.current);
        }
        await client.publish([audioTrack, videoTrack]);
      } else {
        await client.publish([audioTrack]);
      }

      // Notify recipient via socket
      socketRef.current?.emit('call:initiate', {
        recipientId: selectedUser.id,
        channelName: data.channelName,
        callType: callType === 'meeting' ? 'video' : callType,
        caller: currentUser,
        token: data.token,
      });

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
    if (!incomingCall) return;

    try {
      const token = getAuthToken();
      
      // Get token for this channel
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

      if (!response.ok) throw new Error('Failed to get token');
      
      const data = await response.json();

      // Initialize Agora
      const client = initAgoraClient();
      await client.join(AGORA_APP_ID, incomingCall.channelName, data.token, 0);

      // Create and publish tracks
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      localAudioTrackRef.current = audioTrack;
      
      if (incomingCall.callType === 'video') {
        const videoTrack = await AgoraRTC.createCameraVideoTrack();
        localVideoTrackRef.current = videoTrack;
        if (localVideoRef.current) {
          videoTrack.play(localVideoRef.current);
        }
        await client.publish([audioTrack, videoTrack]);
      } else {
        await client.publish([audioTrack]);
      }

      // Notify caller
      socketRef.current?.emit('call:accept', {
        channelName: incomingCall.channelName,
        callerId: incomingCall.caller.id,
      });

      // Set call state
      setCallState({
        isInCall: true,
        callType: incomingCall.callType,
        channelName: incomingCall.channelName,
        remoteUser: incomingCall.caller,
        isMuted: false,
        isVideoOff: false,
        callDuration: 0,
      });

      // Start call timer
      callTimerRef.current = setInterval(() => {
        setCallState(prev => prev ? { ...prev, callDuration: prev.callDuration + 1 } : null);
      }, 1000);

      setIncomingCall(null);
      toast.success('Call connected!');
    } catch (error) {
      console.error('Error answering call:', error);
      toast.error('Failed to answer call');
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
      // Stop timer
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }

      // Close tracks
      localAudioTrackRef.current?.close();
      localVideoTrackRef.current?.close();
      localAudioTrackRef.current = null;
      localVideoTrackRef.current = null;

      // Leave channel
      await clientRef.current?.leave();

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
    } catch (error) {
      console.error('Error ending call:', error);
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

  // Active call UI
  if (callState?.isInCall) {
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className={`flex-1 flex flex-col items-center justify-center ${isDark ? 'bg-[#0b0f17]' : 'bg-[#f6f8fd]'} p-6`}>
          {/* Call Info */}
          <div className="text-center mb-8">
            <h2 className={`text-2xl font-bold ${textPrimary} mb-2`}>
              {callState.remoteUser?.fullName || 'Unknown'}
            </h2>
            <p className={`${textMuted} text-lg`}>
              {callState.callType === 'video' ? 'Video Call' : 'Voice Call'} • {formatDuration(callState.callDuration)}
            </p>
          </div>

          {/* Video containers */}
          <div className="relative w-full max-w-4xl aspect-video mb-8">
            {/* Remote video (large) */}
            <div 
              ref={remoteVideoRef}
              className={`w-full h-full rounded-2xl ${cardBg} border ${cardBorder} ${shadow} overflow-hidden flex items-center justify-center`}
            >
              {callState.callType === 'voice' && (
                <div className="text-center">
                  <div className={`w-32 h-32 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-300'} flex items-center justify-center mb-4 mx-auto`}>
                    <span className={`text-4xl font-bold ${textPrimary}`}>
                      {callState.remoteUser?.fullName?.charAt(0) || '?'}
                    </span>
                  </div>
                  <p className={textMuted}>Voice call in progress...</p>
                </div>
              )}
            </div>

            {/* Local video (small, picture-in-picture) */}
            {callState.callType === 'video' && (
              <div 
                ref={localVideoRef}
                className={`absolute bottom-4 right-4 w-48 h-36 rounded-xl ${cardBg} border ${cardBorder} ${shadow} overflow-hidden`}
              />
            )}
          </div>

          {/* Call Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleMute}
              className={`p-4 rounded-full transition-colors ${
                callState.isMuted 
                  ? 'bg-red-500 text-white' 
                  : isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
              title={callState.isMuted ? 'Unmute' : 'Mute'}
            >
              {callState.isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            {callState.callType === 'video' && (
              <button
                onClick={toggleVideo}
                className={`p-4 rounded-full transition-colors ${
                  callState.isVideoOff 
                    ? 'bg-red-500 text-white' 
                    : isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
                title={callState.isVideoOff ? 'Turn on camera' : 'Turn off camera'}
              >
                {callState.isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
              </button>
            )}

            <button
              onClick={endCall}
              className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
              title="End call"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Incoming Call Modal */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className={`${cardBg} rounded-2xl ${shadow} p-8 max-w-sm w-full text-center`}>
            <div className={`w-20 h-20 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center mx-auto mb-4`}>
              <span className={`text-3xl font-bold ${textPrimary}`}>
                {incomingCall.caller.fullName?.charAt(0) || '?'}
              </span>
            </div>
            <h3 className={`text-xl font-bold ${textPrimary} mb-2`}>
              {incomingCall.caller.fullName}
            </h3>
            <p className={`${textMuted} mb-6`}>
              Incoming {incomingCall.callType} call...
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={rejectCall}
                className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
              <button
                onClick={answerCall}
                className="p-4 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
              >
                <Phone className="w-6 h-6" />
              </button>
            </div>
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
              <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full border ${badgeBorder} ${badgeBg} ${textMuted} text-xs`}>
                Voice • Video
              </span>
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
              {filteredUsers.length > 0 && (
                <div className={`max-h-40 overflow-y-auto rounded-lg border ${inputBorder}`}>
                  {filteredUsers.map(user => (
                    <button
                      key={user.id}
                      onClick={() => { setSelectedUser(user); setDialInput(user.fullName); }}
                      className={`w-full px-3 py-2 text-left flex items-center gap-3 transition-colors ${
                        selectedUser?.id === user.id 
                          ? buttonActive 
                          : `hover:${isDark ? 'bg-gray-800' : 'bg-gray-100'}`
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-300'} flex items-center justify-center`}>
                        <span className={`text-sm font-medium ${textPrimary}`}>
                          {user.fullName?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${textPrimary}`}>{user.fullName}</p>
                        <p className={`text-xs ${user.isOnline ? 'text-green-500' : textMuted}`}>
                          {user.isOnline ? 'Online' : 'Offline'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
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
