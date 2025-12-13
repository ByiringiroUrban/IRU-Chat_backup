import React, { useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Paperclip, Send, Smile, Mic } from 'lucide-react';
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
  fileUrl?: string;
  fileName?: string;
  createdAt: string;
  sender: User;
  readBy?: string[];
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
  isMessageRead: (message: Message) => boolean;
  formatRecordingTime: (seconds: number) => string;
  chatName?: string;
  chatAvatar?: string;
}

const ChatConversation: React.FC<ChatConversationProps> = ({
  messages,
  currentUserId,
  inputValue,
  onInputChange,
  onSendMessage,
  onFileSelect,
  isMessageRead,
  chatName = 'Conversation',
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  return (
    <section className={`flex-1 flex flex-col h-full ${cardBg} border-r ${cardBorder} rounded-none ${shadow} overflow-hidden`}>
      {/* Header */}
      <div className={`px-4 py-3.5 flex items-center justify-between gap-2.5 border-b ${cardBorder} ${cardHeaderBg}`}>
        <h2 className={`text-sm font-medium tracking-wide m-0 ${textPrimary}`}>Conversation</h2>
        <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full border ${badgeBorder} ${badgeBg} ${textMuted} text-xs`}>
          Thread-ready
        </span>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {/* Placeholder text */}
        <div className={`mb-4 ${textMuted} text-xs`}>
          Message timeline (render messages here).
        </div>

        {messages.length === 0 ? (
          <>
            {/* Static example messages for wireframe */}
            {/* Message from Alex */}
            <div className="flex justify-start">
              <div className={`max-w-[78%] rounded-lg px-3 py-2 ${messageOther}`}>
                <div className={`text-xs font-medium mb-1 ${textMuted}`}>
                  Alex • 10:14
                </div>
                <div className={`text-sm ${textPrimary}`}>
                  <p>Wireframe message bubble.</p>
                </div>
              </div>
            </div>

            {/* Message from You */}
            <div className="flex justify-end">
              <div className={`max-w-[78%] rounded-lg px-3 py-2 ${messageOwn}`}>
                <div className={`text-xs font-medium mb-1 ${textMuted}`}>
                  You • 10:15
                </div>
                <div className={`text-sm ${textPrimary}`}>
                  <p>Reply bubble (align right).</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === currentUserId;
            const isRead = isMessageRead(message);

            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[78%] rounded-lg px-3 py-2 ${
                  isOwn ? messageOwn : messageOther
                }`}>
                  <div className={`text-xs font-medium mb-1 ${textMuted}`}>
                    {isOwn ? 'You' : (message.sender?.fullName || 'Unknown')} • {format(new Date(message.createdAt), 'HH:mm')}
                  </div>
                  <div className={`text-sm ${textPrimary}`}>
                    {message.type === 'image' && message.fileUrl && (
                      <img src={message.fileUrl} alt={message.content} className="max-w-full rounded-lg mb-1 max-h-64 object-cover" />
                    )}
                    {message.type === 'file' && (
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4" />
                        <span>{message.fileName || message.content}</span>
                      </div>
                    )}
                    {!['image', 'file'].includes(message.type) && (
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
          className={`w-full px-3 py-2 rounded-lg ${inputBg} border ${inputBorder} ${inputText} text-sm ${inputPlaceholder} focus:outline-none focus:ring-2 ${
            isDark ? 'focus:ring-[rgba(110,168,255,0.35)]' : 'focus:ring-[rgba(37,99,235,0.35)]'
          } resize-none`}
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onFileSelect}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonBg}`}
            >
              <Paperclip className="w-4 h-4 inline mr-1" />
              Attach
            </button>
            <button
              type="button"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonBg}`}
            >
              <Smile className="w-4 h-4 inline mr-1" />
              Emoji
            </button>
            <button
              type="button"
              onClick={() => {}}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonBg}`}
            >
              <Mic className="w-4 h-4 inline mr-1" />
              Voice
            </button>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onSendMessage(e as any);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${buttonBg}`}
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
