import React from 'react';
import { useTheme } from 'next-themes';
import { MessageSquare } from 'lucide-react';

const EmptyConversation: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`flex-1 flex items-center justify-center ${
      isDark ? 'bg-muted/30' : 'bg-muted/30'
    }`}>
      <div className="text-center">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
          isDark ? 'bg-muted' : 'bg-muted'
        }`}>
          <MessageSquare className={`w-8 h-8 ${isDark ? 'text-muted-foreground' : 'text-muted-foreground'}`} />
        </div>
        <p className={`text-sm ${isDark ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
          Select a chat to start messaging
        </p>
      </div>
    </div>
  );
};

export default EmptyConversation;
