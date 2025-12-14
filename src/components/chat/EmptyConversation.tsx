import React from 'react';
import { useTheme } from 'next-themes';
import { MessageSquare, ArrowLeft } from 'lucide-react';

const EmptyConversation: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Theme-aware colors
  const cardBg = isDark ? 'bg-[#101828]' : 'bg-white';
  const cardBorder = isDark ? 'border-[rgba(255,255,255,0.09)]' : 'border-[rgba(15,23,42,0.10)]';
  const textPrimary = isDark ? 'text-[#e7eefc]' : 'text-[#0f172a]';
  const textMuted = isDark ? 'text-[#9bb0d0]' : 'text-[#475569]';
  const shadow = isDark ? 'shadow-[0_12px_30px_rgba(0,0,0,0.35)]' : 'shadow-[0_10px_25px_rgba(2,6,23,0.08)]';
  const iconBg = isDark 
    ? 'bg-[rgba(110,168,255,0.20)] border-[rgba(110,168,255,0.30)]' 
    : 'bg-[rgba(37,99,235,0.20)] border-[rgba(37,99,235,0.30)]';
  const iconColor = isDark ? 'text-[#6ea8ff]' : 'text-[#2563eb]';

  return (
    <section className={`flex-1 flex flex-col h-full ${cardBg} border-r ${cardBorder} rounded-none ${shadow} overflow-hidden`}>
      {/* This section should fill the space below the top bar */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center px-6">
          {/* Large chat bubble icon in rounded square */}
          <div className={`w-24 h-24 mx-auto mb-6 rounded-2xl ${iconBg} flex items-center justify-center border-2`}>
            <MessageSquare className={`w-12 h-12 ${iconColor}`} />
        </div>
          
          {/* Welcome heading */}
          <h3 className={`text-xl font-semibold ${textPrimary} mb-2`}>Welcome to Chat</h3>
          
          {/* Instruction text */}
          <p className={`text-sm ${textMuted} max-w-xs mx-auto mb-6 leading-relaxed`}>
          Select a conversation from the list or start a new chat to begin messaging
        </p>
          
          {/* Bottom hint with arrow */}
          <div className={`flex items-center justify-center ${textMuted}`}>
            <span className="text-xs">← Select a chat to get started</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmptyConversation;
