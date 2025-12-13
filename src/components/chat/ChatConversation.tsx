import React, { useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { MessageSquare, Paperclip, Send, Smile, Mic, Radio, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
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
}

const ChatConversation: React.FC<ChatConversationProps> = ({
  messages,
  currentUserId,
  inputValue,
  onInputChange,
  onSendMessage,
  typingUsers,
  isRecording,
  recordingTime,
  onStartRecording,
  onStopRecording,
  onCancelRecording,
  onSendVoice,
  audioBlob,
  onFileSelect,
  isMessageRead,
  formatRecordingTime,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <section className={`flex-1 flex flex-col ${
      isDark ? 'bg-card' : 'bg-white'
    }`}>
      {/* Header */}
      <div className={`p-4 border-b ${isDark ? 'border-border' : 'border-border'}`}>
        <div className="flex items-center justify-between">
          <h2 className={`font-semibold text-lg ${isDark ? 'text-foreground' : 'text-foreground'}`}>
            Conversation
          </h2>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            isDark ? 'bg-muted text-muted-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            Thread-ready
          </span>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className={`text-xs mb-4 ${isDark ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
          Message timeline (render messages here).
        </div>

        <div className="space-y-3">
          {messages.map((message) => {
            const isOwn = message.senderId === currentUserId;
            const isRead = isMessageRead(message);

            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[78%] ${
                  isDark 
                    ? isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                    : isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                } rounded-lg px-4 py-2 shadow-sm`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">
                      {isOwn ? 'You' : message.sender?.fullName || 'Unknown'}
                    </span>
                    <span className={`text-xs ${
                      isOwn 
                        ? 'text-primary-foreground/70' 
                        : isDark ? 'text-muted-foreground' : 'text-muted-foreground'
                    }`}>
                      • {format(new Date(message.createdAt), 'HH:mm')}
                    </span>
                  </div>

                  {message.type === 'image' && message.fileUrl && (
                    <img src={message.fileUrl} alt={message.content} className="max-w-full rounded-lg mb-1 max-h-64 object-cover" />
                  )}
                  {message.type === 'video' && message.fileUrl && (
                    <video src={message.fileUrl} controls className="max-w-full rounded-lg mb-1 max-h-64" />
                  )}
                  {message.type === 'audio' && message.fileUrl && (
                    <audio src={message.fileUrl} controls className="max-w-full mb-1" />
                  )}
                  {message.type === 'file' && (
                    <div className="flex items-center gap-2 mb-1">
                      <Paperclip className="w-4 h-4" />
                      <span className="text-sm">{message.fileName || message.content}</span>
                    </div>
                  )}
                  {message.type === 'live_stream' && (
                    <div className="flex items-center gap-2 p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                      <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                      <span className="text-sm">{message.content}</span>
                    </div>
                  )}
                  {!['image', 'video', 'audio', 'file', 'live_stream'].includes(message.type) && (
                    <p className="text-sm">{message.content}</p>
                  )}

                  {isOwn && (
                    <div className="flex justify-end mt-1">
                      <span className="text-xs">
                        {isRead ? (
                          <span className="text-primary-foreground/70">✓✓</span>
                        ) : (
                          <span className="text-primary-foreground/50">✓</span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {typingUsers.size > 0 && (
            <div className="flex justify-start">
              <div className={`px-4 py-2 rounded-lg ${
                isDark ? 'bg-muted' : 'bg-muted'
              }`}>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Divider */}
      <div className={`mx-4 h-px ${isDark ? 'bg-border' : 'bg-border'}`} />

      {/* Message Composer */}
      <form onSubmit={onSendMessage} className="p-4 space-y-3">
        <label className={`text-xs ${isDark ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
          Message
        </label>
        <textarea
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
          className={`w-full px-4 py-3 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring ${
            isDark 
              ? 'bg-muted text-foreground placeholder:text-muted-foreground' 
              : 'bg-muted text-foreground placeholder:text-muted-foreground'
          }`}
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onFileSelect}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isDark 
                  ? 'bg-muted hover:bg-muted/80 text-foreground' 
                  : 'bg-muted hover:bg-muted/80 text-foreground'
              }`}
            >
              Attach
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isDark 
                  ? 'bg-muted hover:bg-muted/80 text-foreground' 
                  : 'bg-muted hover:bg-muted/80 text-foreground'
              }`}
            >
              Emoji
            </button>
            {isRecording ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500 text-white">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-sm font-medium">{formatRecordingTime(recordingTime)}</span>
                </div>
                <button
                  type="button"
                  onClick={onCancelRecording}
                  className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-muted' : 'hover:bg-muted'}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onStartRecording}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isDark 
                    ? 'bg-muted hover:bg-muted/80 text-foreground' 
                    : 'bg-muted hover:bg-muted/80 text-foreground'
                }`}
              >
                Voice
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Send
          </button>
        </div>
      </form>
    </section>
  );
};

export default ChatConversation;
