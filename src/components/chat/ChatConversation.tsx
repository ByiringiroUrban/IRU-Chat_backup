import React, { useRef, useEffect } from 'react';
import { Paperclip, Send, Smile, X, Image, Mic, MoreVertical, Phone, Video } from 'lucide-react';
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
  chatName?: string;
  chatAvatar?: string;
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
  onCancelRecording,
  onFileSelect,
  isMessageRead,
  formatRecordingTime,
  chatName = 'Conversation',
  chatAvatar,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <section className="flex-1 flex flex-col h-full bg-[#0f2847]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#1e3a5f] bg-[#0d1f35]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center overflow-hidden">
              {chatAvatar ? (
                <img src={chatAvatar} alt={chatName} className="w-full h-full object-cover" />
              ) : (
                <span className="font-semibold text-sm text-white">{chatName.slice(0, 2).toUpperCase()}</span>
              )}
            </div>
            <div>
              <h2 className="font-semibold text-white">{chatName}</h2>
              <p className="text-xs text-emerald-400">Online</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2.5 rounded-xl bg-[#162d4a] text-slate-400 hover:text-white hover:bg-[#1e3a5f] transition-all">
              <Phone className="w-4 h-4" />
            </button>
            <button className="p-2.5 rounded-xl bg-[#162d4a] text-slate-400 hover:text-white hover:bg-[#1e3a5f] transition-all">
              <Video className="w-4 h-4" />
            </button>
            <button className="p-2.5 rounded-xl bg-[#162d4a] text-slate-400 hover:text-white hover:bg-[#1e3a5f] transition-all">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#162d4a] flex items-center justify-center">
                <Send className="w-10 h-10 text-slate-500" />
              </div>
              <p className="text-slate-400">No messages yet</p>
              <p className="text-xs text-slate-500 mt-1">Send a message to start the conversation</p>
            </div>
          )}

          {messages.map((message) => {
            const isOwn = message.senderId === currentUserId;
            const isRead = isMessageRead(message);

            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                {!isOwn && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-xs text-white font-medium">
                      {message.sender?.fullName?.slice(0, 2).toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                <div className={`max-w-[70%] ${
                  isOwn 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl rounded-br-md' 
                    : 'bg-[#162d4a] text-white rounded-2xl rounded-bl-md'
                } px-4 py-3 shadow-lg`}>
                  {!isOwn && (
                    <p className="text-xs text-cyan-400 font-medium mb-1">
                      {message.sender?.fullName || 'Unknown'}
                    </p>
                  )}

                  {message.type === 'image' && message.fileUrl && (
                    <img src={message.fileUrl} alt={message.content} className="max-w-full rounded-lg mb-2 max-h-64 object-cover" />
                  )}
                  {message.type === 'video' && message.fileUrl && (
                    <video src={message.fileUrl} controls className="max-w-full rounded-lg mb-2 max-h-64" />
                  )}
                  {message.type === 'audio' && message.fileUrl && (
                    <audio src={message.fileUrl} controls className="max-w-full mb-2" />
                  )}
                  {message.type === 'file' && (
                    <div className="flex items-center gap-2 mb-2 p-2 bg-white/10 rounded-lg">
                      <Paperclip className="w-4 h-4" />
                      <span className="text-sm">{message.fileName || message.content}</span>
                    </div>
                  )}
                  {!['image', 'video', 'audio', 'file', 'live_stream'].includes(message.type) && (
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  )}

                  <div className={`flex items-center gap-2 mt-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <span className={`text-[10px] ${isOwn ? 'text-white/70' : 'text-slate-500'}`}>
                      {format(new Date(message.createdAt), 'HH:mm')}
                    </span>
                    {isOwn && (
                      <span className="text-[10px] text-white/70">
                        {isRead ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {typingUsers.size > 0 && (
            <div className="flex justify-start">
              <div className="bg-[#162d4a] px-4 py-3 rounded-2xl rounded-bl-md">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Composer */}
      <div className="p-4 border-t border-[#1e3a5f] bg-[#0d1f35]">
        <form onSubmit={onSendMessage} className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSendMessage(e);
                }
              }}
              placeholder="Type your message..."
              rows={1}
              className="w-full px-4 py-3 pr-24 rounded-xl bg-[#162d4a] border border-[#1e3a5f] text-white placeholder:text-slate-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <button
                type="button"
                onClick={onFileSelect}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <Image className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onFileSelect}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <Smile className="w-4 h-4" />
              </button>
            </div>
          </div>

          {isRecording ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-sm font-medium">{formatRecordingTime(recordingTime)}</span>
              </div>
              <button
                type="button"
                onClick={onCancelRecording}
                className="p-2.5 rounded-xl bg-[#162d4a] text-slate-400 hover:text-white hover:bg-[#1e3a5f] transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onStartRecording}
              className="p-3 rounded-xl bg-[#162d4a] text-slate-400 hover:text-white hover:bg-[#1e3a5f] transition-all"
            >
              <Mic className="w-5 h-5" />
            </button>
          )}

          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:opacity-90 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </section>
  );
};

export default ChatConversation;
