import { createContext, useContext, useState, ReactNode } from 'react';

interface ChatbotContextType {
  isOpen: boolean;
  openChatbot: () => void;
  closeChatbot: () => void;
  sendFeatureQuery: (featureName: string, featureDescription: string) => void;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export const ChatbotProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [featureQuery, setFeatureQuery] = useState<{ name: string; description: string } | null>(null);

  const openChatbot = () => setIsOpen(true);
  const closeChatbot = () => setIsOpen(false);

  const sendFeatureQuery = (featureName: string, featureDescription: string) => {
    setFeatureQuery({ name: featureName, description: featureDescription });
    setIsOpen(true);
  };

  return (
    <ChatbotContext.Provider
      value={{
        isOpen,
        openChatbot,
        closeChatbot,
        sendFeatureQuery,
      }}
    >
      {children}
      {/* Store feature query in a way that chatbot can access */}
      {featureQuery && (
        <div
          id="chatbot-feature-query"
          data-feature-name={featureQuery.name}
          data-feature-description={featureQuery.description}
          style={{ display: 'none' }}
        />
      )}
    </ChatbotContext.Provider>
  );
};

export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (context === undefined) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
};

