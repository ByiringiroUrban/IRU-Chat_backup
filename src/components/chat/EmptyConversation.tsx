import React from 'react';
import { MessageSquare, ArrowLeft } from 'lucide-react';

const EmptyConversation: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center bg-[#0f2847]">
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/20">
          <MessageSquare className="w-12 h-12 text-cyan-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Welcome to Chat</h3>
        <p className="text-sm text-slate-400 max-w-xs mx-auto">
          Select a conversation from the list or start a new chat to begin messaging
        </p>
        <div className="mt-6 flex items-center justify-center gap-2 text-slate-500">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs">Select a chat to get started</span>
        </div>
      </div>
    </div>
  );
};

export default EmptyConversation;
