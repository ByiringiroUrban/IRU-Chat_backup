import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Monitor, Smile, Hand, MoreVertical, Info, Grid3x3, Lock, Captions, MessageSquare, Send, X } from 'lucide-react';
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

interface CallData {
  channelName: string;
  callType: 'voice' | 'video';
  remoteUser?: User;
  caller?: User;
  token?: string;
}

const CallRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [callData, setCallData] = useState<CallData | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [callMessages, setCallMessages] = useState<Array<{id: string; sender: string; senderId: string; text: string; timestamp: Date}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);
  const [hasLocalVideo, setHasLocalVideo] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [participantCount, setParticipantCount] = useState(1);

  // Refs
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localAudioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
  const localVideoTrackRef = useRef<ICameraVideoTrack | null>(null);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<Socket | null>(null);

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

  const getCurrentUser = (): User | null => {
    try {
      const authData = localStorage.getItem('iru-auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        const user = parsed.user;
        if (user) {
          return {
            ...user,
            fullName: user.fullName || user.name || 'Unknown User',
          };
        }
      }
    } catch (e) {
      console.error('Error parsing auth data:', e);
    }
    return null;
  };

  // Initialize socket connection
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      toast.error('Not authenticated. Redirecting to login...');
      navigate('/auth');
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
      console.log('CallRoomPage: Socket connected');
    });

    socket.on('call:ended', () => {
      console.log('CallRoomPage: Call ended');
      toast.info('Call ended');
      handleEndCall();
    });

    const handleCallMessage = (data: {channelName: string; message: typeof callMessages[0]}) => {
      // Check channel name when message is received
      const currentCall = callData;
      if (currentCall && data.channelName === currentCall.channelName) {
        setCallMessages(prev => [...prev, data.message]);
      }
    };

    socket.on('call:message', handleCallMessage);

    socketRef.current = socket;

    return () => {
      socket.off('call:message', handleCallMessage);
      socket.disconnect();
    };
  }, [callData]);

  // Join call function
  const joinCall = async (data: CallData) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      // Get token if not provided
      let agoraToken = data.token;
      if (!agoraToken) {
        const response = await fetch(`${API_BASE_URL}/api/calls/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            channelName: data.channelName,
            uid: 0,
          }),
        });

        if (!response.ok) throw new Error('Failed to get token');
        const tokenData = await response.json();
        agoraToken = tokenData.token;
      }

      // Initialize client
      const client = initAgoraClient();

      // Join channel
      await client.join(AGORA_APP_ID, data.channelName, agoraToken, 0);
      console.log('CallRoomPage: Joined Agora channel');

      // Request media permissions
      await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: data.callType === 'video' 
      });

      // Create and publish tracks
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      localAudioTrackRef.current = audioTrack;

      if (data.callType === 'video') {
        const videoTrack = await AgoraRTC.createCameraVideoTrack();
        localVideoTrackRef.current = videoTrack;
        setHasLocalVideo(true);
        
        if (localVideoRef.current) {
          videoTrack.play(localVideoRef.current);
        }
        
        await client.publish([audioTrack, videoTrack]);
      } else {
        await client.publish([audioTrack]);
      }

      // Start call timer
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

      toast.success('Call connected!');
    } catch (error: any) {
      console.error('Error joining call:', error);
      toast.error(`Failed to join call: ${error.message}`);
      navigate('/chat');
    }
  };

  // Load call data from URL params or sessionStorage
  useEffect(() => {
    const channelName = searchParams.get('channel');
    const callType = (searchParams.get('type') || 'video') as 'voice' | 'video';
    
    if (channelName) {
      // Load from URL params
      const storedCall = sessionStorage.getItem(`call:${channelName}`);
      let data: CallData | null = null;
      
      if (storedCall) {
        try {
          data = JSON.parse(storedCall);
        } catch (e) {
          console.error('Error parsing stored call data:', e);
        }
      }

      if (!data) {
        // Try to get from incoming call data
        const incomingCall = sessionStorage.getItem('incoming-call');
        if (incomingCall) {
          try {
            const incoming = JSON.parse(incomingCall);
            if (incoming.channelName === channelName) {
              data = {
                channelName: incoming.channelName,
                callType: incoming.callType || callType,
                caller: incoming.caller,
                token: incoming.token,
              };
            }
          } catch (e) {
            console.error('Error parsing incoming call:', e);
          }
        }
      }

      if (data) {
        setCallData(data);
        joinCall(data);
      } else {
        toast.error('Call data not found');
        navigate('/chat');
      }
    } else {
      // No channel in URL, redirect to chat
      navigate('/chat');
    }
  }, [searchParams, navigate]);

  // Initialize Agora client
  const initAgoraClient = () => {
    if (!clientRef.current) {
      clientRef.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      
      clientRef.current.on('user-published', async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
        try {
          await clientRef.current?.subscribe(user, mediaType);
          
          if (mediaType === 'video' && user.videoTrack) {
            setHasRemoteVideo(true);
            if (remoteVideoRef.current) {
              user.videoTrack.play(remoteVideoRef.current);
            }
          }
          if (mediaType === 'audio' && user.audioTrack) {
            await user.audioTrack.play();
          }
        } catch (error) {
          console.error('Error handling user-published:', error);
        }
      });

      clientRef.current.on('user-unpublished', (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
        if (mediaType === 'video') {
          setHasRemoteVideo(false);
        }
      });

      clientRef.current.on('user-left', () => {
        toast.info('The other user left the call');
        handleEndCall();
      });

      clientRef.current.on('user-joined', () => {
        setParticipantCount(2);
      });
    }
    return clientRef.current;
  };

  // End call
  const handleEndCall = async () => {
    try {
      // Stop timer
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }

      // Unpublish tracks
      if (clientRef.current) {
        await clientRef.current.unpublish();
      }

      // Close tracks
      localAudioTrackRef.current?.close();
      localVideoTrackRef.current?.close();
      localAudioTrackRef.current = null;
      localVideoTrackRef.current = null;

      // Leave channel
      if (clientRef.current) {
        await clientRef.current.leave();
      }

      // Notify other user
      if (callData && socketRef.current) {
        socketRef.current.emit('call:end', {
          channelName: callData.channelName,
          recipientId: callData.remoteUser?.id || callData.caller?.id,
        });
      }

      // Redirect to chat
      navigate('/chat');
    } catch (error) {
      console.error('Error ending call:', error);
      navigate('/chat');
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (localAudioTrackRef.current) {
      const newMuted = !isMuted;
      localAudioTrackRef.current.setEnabled(!newMuted);
      setIsMuted(newMuted);
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localVideoTrackRef.current) {
      const newVideoOff = !isVideoOff;
      localVideoTrackRef.current.setEnabled(!newVideoOff);
      setIsVideoOff(newVideoOff);
      setHasLocalVideo(!newVideoOff);
    }
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Send chat message
  const sendCallMessage = () => {
    if (!chatInput.trim() || !callData) return;
    
    const currentUser = getCurrentUser();
    const newMessage = {
      id: Date.now().toString(),
      sender: currentUser?.fullName || 'You',
      senderId: currentUser?.id || '',
      text: chatInput.trim(),
      timestamp: new Date(),
    };
    
    setCallMessages([...callMessages, newMessage]);
    
    if (socketRef.current && callData) {
      socketRef.current.emit('call:message', {
        channelName: callData.channelName,
        message: newMessage,
      });
    }
    
    setChatInput('');
  };

  if (!callData) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#202124]">
        <div className="text-white">Loading call...</div>
      </div>
    );
  }

  const currentUser = getCurrentUser();
  const remoteUser = callData.remoteUser || callData.caller;
  const remoteUserInitials = remoteUser?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const localUserInitials = currentUser?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const meetingCode = callData.channelName.substring(0, 12).replace(/_/g, '-');

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#202124] relative">
      {/* Top bar - Participant count with profile picture (top-right) */}
      <div className="absolute top-0 right-0 z-20 p-4">
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5">
          {remoteUser?.profilePicture ? (
            <img 
              src={remoteUser.profilePicture} 
              alt={remoteUser.fullName || 'Participant'} 
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-[#3c4043] flex items-center justify-center">
              <span className="text-xs font-medium text-white">{remoteUserInitials[0]}</span>
            </div>
          )}
          <span className="text-white text-sm font-medium">{participantCount}</span>
        </div>
      </div>

      {/* Main content area with video and chat */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Main video area - Full screen */}
        <div className={`flex-1 relative flex items-center justify-center transition-all duration-300 ${showChat ? 'mr-80' : ''}`}>
          {/* Remote video (main, large) - Full screen container */}
          <div 
            ref={remoteVideoRef}
            className="absolute inset-0 w-full h-full bg-[#8B1538] flex items-center justify-center"
            style={{ minHeight: '100%' }}
          >
            {/* Fallback avatar when no video */}
            {(!hasRemoteVideo || callData.callType === 'voice') && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="w-32 h-32 rounded-full bg-[#3c4043] flex items-center justify-center mx-auto shadow-2xl border-4 border-pink-500">
                    {remoteUser?.profilePicture ? (
                      <img 
                        src={remoteUser.profilePicture} 
                        alt={remoteUser.fullName || 'Unknown'} 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-5xl font-medium text-white">
                        {remoteUserInitials}
                      </span>
                    )}
                  </div>
                  {callData.callType === 'video' && !hasRemoteVideo && (
                    <p className="text-gray-300 text-sm mt-4">Waiting for video...</p>
                  )}
                </div>
              </div>
            )}
            
            {/* Participant name in bottom-left */}
            <div className="absolute bottom-4 left-4 z-20">
              <p className="text-white text-base font-medium bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                {remoteUser?.fullName || 'Unknown'}
              </p>
            </div>
          </div>

          {/* Local video (picture-in-picture, bottom-right) */}
          {callData.callType === 'video' && (
            <div className="absolute bottom-20 right-6 w-64 h-48 rounded-xl overflow-hidden bg-[#1a1a1a] border-2 border-white/30 shadow-2xl z-10">
              <div 
                ref={localVideoRef}
                className="w-full h-full bg-[#1a1a1a] flex items-center justify-center"
                style={{ minHeight: '100%' }}
              >
                {/* Fallback when local video is off */}
                {(isVideoOff || !hasLocalVideo) && (
                  <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-[#3c4043] z-10">
                    {currentUser?.profilePicture ? (
                      <img 
                        src={currentUser.profilePicture} 
                        alt={currentUser?.fullName || 'You'} 
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
                {currentUser?.fullName || 'You'}
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
            <span className="text-gray-400 font-mono">{meetingCode}</span>
          </div>

          {/* Center: Main controls */}
          <div className="flex items-center gap-1">
            {/* Mute button */}
            <button
              onClick={toggleMute}
              className={`p-3 rounded-full transition-all ${
                isMuted 
                  ? 'bg-[#ea4335] text-white hover:bg-[#d33b2c]' 
                  : 'bg-[#3c4043] text-white hover:bg-[#5f6368]'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Video button */}
            {callData.callType === 'video' && (
              <button
                onClick={toggleVideo}
                className={`p-3 rounded-full transition-all ${
                  isVideoOff 
                    ? 'bg-[#ea4335] text-white hover:bg-[#d33b2c]' 
                    : 'bg-[#3c4043] text-white hover:bg-[#5f6368]'
                }`}
                title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
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
              onClick={handleEndCall}
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
};

export default CallRoomPage;

