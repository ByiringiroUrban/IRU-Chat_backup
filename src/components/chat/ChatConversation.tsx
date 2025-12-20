import React, { useRef, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Paperclip, Send, Smile, Mic, Trash2, Phone, Video } from 'lucide-react';
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
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  createdAt: string;
  sender: User;
  readBy?: string[];
  isPinned?: boolean;
  isDeleted?: boolean;
}

interface ChatConversationProps {
  messages: Message[];
  currentUserId: string;
  inputValue: string;
  onInputChange: (value: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  typingUsers: Set<string>;
  isRecording: boolean;
  recordingTime: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onCancelRecording: () => void;
  onSendVoice: () => void;
  audioBlob: Blob | null;
  onFileSelect: () => void;
  onDeleteMessage?: (messageId: string) => void;
  isMessageRead: (message: Message) => boolean;
  formatRecordingTime: (seconds: number) => string;
  chatName?: string;
  chatAvatar?: string;
  onVoiceCall?: () => void;
  onVideoCall?: () => void;
}

type MessageFilter = 'all' | 'unread' | 'pinned';

const ChatConversation: React.FC<ChatConversationProps> = ({
  messages,
  currentUserId,
  inputValue,
  onInputChange,
  onSendMessage,
  onFileSelect,
  onDeleteMessage,
  isMessageRead,
  isRecording,
  recordingTime,
  onStartRecording,
  onStopRecording,
  onCancelRecording,
  onSendVoice,
  audioBlob,
  formatRecordingTime,
  chatName = 'Conversation',
  chatAvatar,
  onVoiceCall,
  onVideoCall,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messageFilter, setMessageFilter] = useState<MessageFilter>('all');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Theme-aware colors
  const cardBg = isDark ? 'bg-[#101828]' : 'bg-white';
  const cardBorder = isDark ? 'border-[rgba(255,255,255,0.09)]' : 'border-[rgba(15,23,42,0.10)]';
  const cardHeaderBg = isDark ? 'bg-[rgba(255,255,255,0.02)]' : 'bg-[rgba(15,23,42,0.02)]';
  const textPrimary = isDark ? 'text-[#e7eefc]' : 'text-[#0f172a]';
  const textMuted = isDark ? 'text-[#9bb0d0]' : 'text-[#475569]';
  const shadow = isDark ? 'shadow-[0_12px_30px_rgba(0,0,0,0.35)]' : 'shadow-[0_10px_25px_rgba(2,6,23,0.08)]';
  const badgeBg = isDark ? 'bg-[rgba(255,255,255,0.02)]' : 'bg-[rgba(15,23,42,0.02)]';
  const badgeBorder = isDark ? 'border-[rgba(255,255,255,0.09)]' : 'border-[rgba(15,23,42,0.10)]';
  const inputBg = isDark ? 'bg-[rgba(255,255,255,0.02)]' : 'bg-[rgba(15,23,42,0.02)]';
  const inputBorder = isDark ? 'border-[rgba(255,255,255,0.09)]' : 'border-[rgba(15,23,42,0.10)]';
  const inputText = isDark ? 'text-[#e7eefc]' : 'text-[#0f172a]';
  const inputPlaceholder = isDark ? 'placeholder-[#9bb0d0]' : 'placeholder-[#475569]';
  const buttonBg = isDark 
    ? 'bg-[rgba(110,168,255,0.14)] border-[rgba(110,168,255,0.35)] text-[#e7eefc]'
    : 'bg-[rgba(37,99,235,0.14)] border-[rgba(37,99,235,0.35)] text-[#0f172a]';
  const messageOwn = isDark 
    ? 'bg-[rgba(110,168,255,0.20)]' 
    : 'bg-[rgba(37,99,235,0.20)]';
  const messageOther = isDark 
    ? 'bg-[rgba(255,255,255,0.05)]' 
    : 'bg-[rgba(15,23,42,0.05)]';
  const divider = isDark ? 'bg-[rgba(255,255,255,0.09)]' : 'bg-[rgba(15,23,42,0.10)]';
  const tabActive = isDark 
    ? 'bg-[rgba(110,168,255,0.14)] border-[rgba(110,168,255,0.35)] text-[#e7eefc]'
    : 'bg-[rgba(37,99,235,0.14)] border-[rgba(37,99,235,0.35)] text-[#0f172a]';
  const tabInactive = isDark
    ? 'bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.09)] text-[#9bb0d0] hover:bg-[rgba(255,255,255,0.05)]'
    : 'bg-[rgba(15,23,42,0.02)] border-[rgba(15,23,42,0.10)] text-[#475569] hover:bg-[rgba(15,23,42,0.05)]';

  // Filter messages based on selected filter
  const filteredMessages = React.useMemo(() => {
    if (messageFilter === 'all') {
      return messages.filter(msg => !msg.isDeleted);
    } else if (messageFilter === 'unread') {
      return messages.filter(msg => !msg.isDeleted && !isMessageRead(msg));
    } else if (messageFilter === 'pinned') {
      return messages.filter(msg => !msg.isDeleted && msg.isPinned);
    }
    return messages.filter(msg => !msg.isDeleted);
  }, [messages, messageFilter, isMessageRead]);

  return (
    <section className={`flex-1 flex flex-col h-full ${cardBg} border-r ${cardBorder} rounded-none ${shadow} overflow-hidden`}>
      {/* Header */}
      <div className={`px-4 py-3.5 flex items-center justify-between gap-2.5 border-b ${cardBorder} ${cardHeaderBg}`}>
        <div className="flex items-center gap-2">
          {chatAvatar ? (
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              <img src={chatAvatar} alt={chatName} className="w-full h-8 object-cover" />
            </div>
          ) : (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              isDark ? 'bg-gray-600' : 'bg-gray-300'
            }`}>
              <span className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {chatName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </span>
            </div>
          )}
          <div>
            <h2 className={`text-sm font-medium tracking-wide m-0 ${textPrimary}`}>
              {chatName && chatName !== 'Conversation' && chatName !== 'Group Chat' && chatName !== 'Unknown User'
                ? `Conversation with ${chatName}`
                : chatName || 'Conversation'}
            </h2>
            {chatName && chatName !== 'Conversation' && chatName !== 'Group Chat' && chatName !== 'Unknown User' && (
              <p className={`text-xs ${textMuted} m-0`}>
                {chatName}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Call Buttons */}
          {onVoiceCall && (
            <button
              onClick={onVoiceCall}
              className={`p-2 rounded-lg border transition-colors ${buttonBg} hover:opacity-80`}
              title="Voice Call"
            >
              <Phone className="w-4 h-4" />
            </button>
          )}
          {onVideoCall && (
            <button
              onClick={onVideoCall}
              className={`p-2 rounded-lg border transition-colors ${buttonBg} hover:opacity-80`}
              title="Video Call"
            >
              <Video className="w-4 h-4" />
            </button>
          )}
          <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full border ${badgeBorder} ${badgeBg} ${textMuted} text-xs`}>
            Thread-ready
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className={`px-4 py-2 border-b ${cardBorder} ${cardHeaderBg} flex items-center gap-2`}>
        <button
          onClick={() => setMessageFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
            messageFilter === 'all' ? tabActive : tabInactive
          }`}
        >
          All
        </button>
        <button
          onClick={() => setMessageFilter('unread')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
            messageFilter === 'unread' ? tabActive : tabInactive
          }`}
        >
          Unread
        </button>
        <button
          onClick={() => setMessageFilter('pinned')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
            messageFilter === 'pinned' ? tabActive : tabInactive
          }`}
        >
          Pinned
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredMessages.length === 0 ? (
          <>
            {/* Placeholder when no messages */}
            <div className={`mb-4 ${textMuted} text-xs text-center py-8`}>
              <p>No messages yet. Start the conversation!</p>
            </div>
          </>
        ) : (
          filteredMessages.map((message, index) => {
            const isOwn = message.senderId === currentUserId;
            const isRead = isMessageRead(message);

            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in group`}
                style={{ animationDelay: `${index * 50}ms` }}
                onMouseEnter={() => setHoveredMessageId(message.id)}
                onMouseLeave={() => setHoveredMessageId(null)}
              >
                <div className={`max-w-[78%] rounded-lg px-3 py-2 transition-all duration-300 hover:shadow-md relative ${
                  isOwn ? messageOwn : messageOther
                }`}>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className={`text-xs font-medium ${textMuted}`}>
                      {isOwn ? 'You' : (message.sender?.fullName || 'Unknown')} • {format(new Date(message.createdAt), 'HH:mm')}
                    </div>
                    {isOwn && onDeleteMessage && hoveredMessageId === message.id && (
                      <button
                        onClick={() => onDeleteMessage(message.id)}
                        className={`p-1 rounded hover:bg-opacity-20 transition-colors ${
                          isDark ? 'hover:bg-red-500 text-red-400' : 'hover:bg-red-500 text-red-600'
                        }`}
                        title="Delete message"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className={`text-sm ${textPrimary}`}>
                    {message.type === 'image' && message.fileUrl && (
                      <div className="mb-1">
                        <img 
                          src={message.fileUrl} 
                          alt={message.content || 'Image'} 
                          className="max-w-full rounded-lg max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(message.fileUrl, '_blank')}
                        />
                        {message.content && message.content !== message.fileName && (
                          <p className="mt-2">{message.content}</p>
                        )}
                      </div>
                    )}
                    {message.type === 'video' && message.fileUrl && (
                      <div className="mb-1">
                        <video 
                          src={message.fileUrl} 
                          controls 
                          className="max-w-full rounded-lg max-h-64"
                        >
                          Your browser does not support the video tag.
                        </video>
                        {message.content && message.content !== message.fileName && (
                          <p className="mt-2">{message.content}</p>
                        )}
                      </div>
                    )}
                    {message.type === 'audio' && message.fileUrl && (
                      <div className="mb-1 flex items-center gap-2">
                        <audio 
                          src={message.fileUrl} 
                          controls 
                          className="flex-1"
                        >
                          Your browser does not support the audio tag.
                        </audio>
                      </div>
                    )}
                    {message.type === 'file' && (
                      <div className="flex items-center gap-2 p-2 rounded bg-opacity-50 hover:bg-opacity-70 transition-colors">
                        <Paperclip className="w-4 h-4 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <a 
                            href={message.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline truncate block"
                          >
                            {message.fileName || message.content}
                          </a>
                          {message.fileSize && (
                            <span className={`text-xs ${textMuted}`}>
                              {(message.fileSize / 1024).toFixed(1)} KB
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    {message.type === 'text' && (
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    )}
                    {!['image', 'video', 'audio', 'file', 'text'].includes(message.type) && (
                      <p>{message.content}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
          )}
          <div ref={messagesEndRef} />
        </div>

      {/* Divider */}
      <div className={`h-px ${divider}`} />

      {/* Voice Recording UI */}
      {audioBlob && !isRecording && (
        <div className={`px-4 py-3 border-t ${cardBorder} ${cardHeaderBg} flex items-center justify-between gap-3`}>
          <div className="flex items-center gap-3 flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isDark ? 'bg-red-500/20' : 'bg-red-500/10'
            }`}>
              <Mic className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${textPrimary}`}>Voice message ready</p>
              <p className={`text-xs ${textMuted}`}>Click send to share</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancelRecording}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                isDark ? 'border-gray-600 text-gray-400 hover:bg-gray-800' : 'border-gray-300 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSendVoice}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isDark 
                  ? 'bg-[rgba(110,168,255,0.14)] border-[rgba(110,168,255,0.35)] text-[#e7eefc] hover:bg-[rgba(110,168,255,0.20)]'
                  : 'bg-[rgba(37,99,235,0.14)] border-[rgba(37,99,235,0.35)] text-[#0f172a] hover:bg-[rgba(37,99,235,0.20)]'
              } border`}
            >
              <Send className="w-3 h-3 inline mr-1" />
              Send
            </button>
          </div>
        </div>
      )}

      {/* Message Composer */}
      <div className="p-4 space-y-3">
        <label className={`block text-xs ${textMuted}`} htmlFor="messageInput">
          Message
        </label>
            <textarea
          id="messageInput"
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSendMessage(e);
                }
              }}
          placeholder="Type a message…"
          rows={3}
          disabled={isRecording}
          className={`w-full px-3 py-2 rounded-lg ${inputBg} border ${inputBorder} ${inputText} text-sm ${inputPlaceholder} focus:outline-none focus:ring-2 ${
            isDark ? 'focus:ring-[rgba(110,168,255,0.35)]' : 'focus:ring-[rgba(37,99,235,0.35)]'
          } resize-none disabled:opacity-50 disabled:cursor-not-allowed`}
            />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onFileSelect}
                disabled={isRecording}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonBg} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
              <Paperclip className="w-4 h-4 inline mr-1" />
              Attach
              </button>
              <button
                type="button"
                onClick={() => {
                  // Simple emoji picker - insert common emojis
                  const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '😶‍🌫️', '😵', '😵‍💫', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'];
                  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                  onInputChange(inputValue + randomEmoji);
                  setShowEmojiPicker(false);
                }}
                disabled={isRecording}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonBg} disabled:opacity-50 disabled:cursor-not-allowed relative`}
                title="Add emoji"
              >
              <Smile className="w-4 h-4 inline mr-1" />
              Emoji
              </button>
            <button
              type="button"
              onClick={isRecording ? onStopRecording : onStartRecording}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                isRecording 
                  ? (isDark ? 'bg-red-500/20 border-red-500/50 text-red-400 animate-pulse' : 'bg-red-500/20 border-red-500/50 text-red-600 animate-pulse')
                  : buttonBg
              }`}
            >
              <Mic className="w-4 h-4 inline mr-1" />
              {isRecording ? `Stop (${formatRecordingTime(recordingTime)})` : 'Voice'}
            </button>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onSendMessage(e as any);
            }}
            disabled={(!inputValue.trim() && !audioBlob) || isRecording}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonBg} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Send className="w-4 h-4 inline mr-1" />
            Send
          </button>
        </div>
      </div>
    </section>
  );
};

export default ChatConversation;
