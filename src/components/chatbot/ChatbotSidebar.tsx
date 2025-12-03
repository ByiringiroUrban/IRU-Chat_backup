import { useState, useEffect, useRef } from 'react';
import { Send, X } from 'lucide-react';
import iruLogo from '@/assets/iruchatlogo.png';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatbotSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatbotSidebar = ({ isOpen, onClose }: ChatbotSidebarProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! 👋 Welcome to IRU Chat. How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get user name from localStorage or use default
  const getUserName = () => {
    try {
      const authData = localStorage.getItem('iru-auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.user?.name || 'Guest';
      }
    } catch (e) {
      // Ignore errors
    }
    return 'Guest';
  };

  const userName = getUserName();

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      
      // Check for feature query from localStorage
      const featureQuery = localStorage.getItem('chatbot-feature-query');
      if (featureQuery) {
        try {
          const parsed = JSON.parse(featureQuery);
          // Check if it's recent (within last 5 seconds)
          if (Date.now() - parsed.timestamp < 5000) {
            // Auto-send feature query
            setTimeout(() => {
              const queryMessage = `Tell me more about ${parsed.name}: ${parsed.description}`;
              const userMessage: Message = {
                id: Date.now().toString(),
                text: queryMessage,
                sender: 'user',
                timestamp: new Date(),
              };
              setMessages((prev) => [...prev, userMessage]);
              setIsTyping(true);
              
              // Generate bot response
              setTimeout(() => {
                setIsTyping(false);
                const botResponse: Message = {
                  id: (Date.now() + 1).toString(),
                  text: generateFeatureResponse(parsed.name, parsed.description),
                  sender: 'bot',
                  timestamp: new Date(),
                };
                setMessages((prev) => [...prev, botResponse]);
              }, 1000 + Math.random() * 1000);
              
              // Clear the feature query
              localStorage.removeItem('chatbot-feature-query');
            }, 500);
          }
        } catch (e) {
          // Ignore errors
        }
      }
      
      // Focus input when sidebar opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [messages, isTyping, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateFeatureResponse = (featureName: string, featureDescription: string): string => {
    // Generate detailed response about the specific feature
    const responses: { [key: string]: string } = {
      "AI-Powered Conversation Intelligence": `Great choice! ${featureName} is one of our most powerful features. ${featureDescription}

This feature uses advanced AI to:
• Remember context across conversations for more natural interactions
• Automatically summarize meetings with actionable insights
• Analyze sentiment in real-time to help you respond appropriately

Would you like to know how to set this up, or do you have specific questions about how it works?`,
      
      "Multi-Layer Privacy & Security": `Excellent! ${featureName} ensures your data stays private and secure. ${featureDescription}

Key benefits include:
• Self-destructing rooms for sensitive conversations that automatically delete
• On-device processing means your data never leaves your device
• Stealth mode helps you communicate privately without detection

This is perfect for businesses handling confidential information. Want to learn more about our security protocols?`,
      
      "Built-in Business & Collaboration Tools": `Perfect! ${featureName} helps teams work together seamlessly. ${featureDescription}

With this feature, you can:
• Create dedicated spaces for projects with their own tools and storage
• Host high-quality meetings without leaving the app
• Sign contracts and documents directly in chat
• Convert voice messages into trackable tasks automatically

This eliminates the need for multiple apps. Would you like a demo of how this works?`,
      
      "Community & Broadcast Messaging": `Awesome! ${featureName} is perfect for large-scale communication. ${featureDescription}

This includes:
• Community channels for large discussions with threaded topics
• Broadcast messaging to reach unlimited subscribers
• Interest-based communities (public or private) for connecting people

Great for organizations, communities, or businesses that need to reach many people. Want to know how to set up your first community?`,
      
      "Real-Time Multilingual Collaboration": `Fantastic! ${featureName} breaks down language barriers. ${featureDescription}

Features include:
• Instant translation for text and voice in real-time
• Group translation mode for mixed-language teams
• Seamless communication across different languages

Perfect for global teams! Would you like to know which languages we support?`,
      
      "Advanced Media & File Features": `Excellent! ${featureName} makes file management effortless. ${featureDescription}

Capabilities include:
• AI-powered search inside images, audio, and documents
• Smart document scanner built right into chat
• Find exact details instantly without opening files

This saves tons of time! Want to see how the AI search works?`,
      
      "Productivity-First Experience": `Great choice! ${featureName} helps you stay focused and organized. ${featureDescription}

Includes:
• Topic threads within chats to organize discussions
• AI meeting scheduler that understands context
• Focus mode to block non-essential notifications during work

This helps maximize your productivity! Want tips on setting up focus mode?`
    };

    // Try to find a specific response, otherwise generate a generic one
    for (const [key, value] of Object.entries(responses)) {
      if (featureName.includes(key) || key.includes(featureName.split(' ')[0])) {
        return value;
      }
    }

    // Generic response
    return `Great question about ${featureName}! ${featureDescription}

This is one of our most popular features. It helps users by providing advanced capabilities that enhance productivity and collaboration.

Would you like to know:
• How to get started with this feature?
• Pricing information?
• See a live demo?
• Get technical details?

Just let me know what you'd like to explore!`;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      setIsTyping(false);
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(inputValue),
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000 + Math.random() * 1000);
  };

  const generateBotResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();

    // Order tracking
    if (lowerInput.includes('order') || lowerInput.includes('#') || /\d{4,}/.test(lowerInput)) {
      const orderMatch = lowerInput.match(/#?(\d{4,})/);
      const orderNum = orderMatch ? orderMatch[1] : '1788';
      return `Your order #${orderNum} has been dispatched and is on its way. You'll receive a tracking number via email shortly.`;
    }

    // Pricing
    if (lowerInput.includes('pricing') || lowerInput.includes('price') || lowerInput.includes('cost')) {
      return 'Our pricing varies based on the service. Please visit our Pricing page or let me know which service you\'re interested in, and I can provide more details.';
    }

    // Services
    if (lowerInput.includes('service') || lowerInput.includes('what do you offer')) {
      return 'We offer AI-powered chat, team collaboration, secure messaging, and enterprise solutions. Check out our Features page for more details!';
    }

    // Contact
    if (lowerInput.includes('contact') || lowerInput.includes('email') || lowerInput.includes('phone') || lowerInput.includes('whatsapp')) {
      return 'You can reach us by:\n📞 Phone: 0795 381 733 / 0736 318 111\n💬 WhatsApp: 0795381733\n📍 Address: Gahanga, Kicukiro, Kigali, Rwanda\n\nOur support team is available to assist you!';
    }

    // Features/Portfolio
    if (lowerInput.includes('feature') || lowerInput.includes('portfolio') || lowerInput.includes('example')) {
      return 'We have many exciting features! Visit our Features page to see AI-powered conversation intelligence, security features, and collaboration tools.';
    }

    // Booking/Sign up
    if (lowerInput.includes('book') || lowerInput.includes('sign up') || lowerInput.includes('register') || lowerInput.includes('trial')) {
      return 'Great! You can sign up for a free trial by clicking "Get Started" in the header. It only takes a minute!';
    }

    // Greetings
    if (lowerInput.includes('hi') || lowerInput.includes('hello') || lowerInput.includes('hey')) {
      return 'Hello! I\'m here to help with any questions about IRU Chat. What would you like to know?';
    }

    // Default responses
    const responses = [
      'I understand. Let me help you with that. Can you provide more details?',
      'Thanks for reaching out! I\'m here to assist you. What specific information do you need?',
      'I can help with that! Could you share a bit more information so I can assist you better?',
      'Got it! Let me look into that for you. Is there anything else you\'d like to know?',
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleQuickAction = (action: string) => {
    let message = '';
    switch (action) {
      case 'pricing':
        message = 'I would like to know about pricing';
        break;
      case 'book':
        message = 'I want to book a session or sign up';
        break;
      case 'services':
        message = 'Tell me about your services';
        break;
      case 'contact':
        message = 'I need contact information';
        break;
      case 'portfolio':
        message = 'Show me portfolio examples or features';
        break;
      default:
        message = action;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      setIsTyping(false);
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(message),
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000 + Math.random() * 1000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - only on mobile */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed right-4 bottom-4 top-auto h-[600px] max-h-[85vh] w-full max-w-sm md:w-80 bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out rounded-lg overflow-hidden ${
          isOpen ? 'translate-x-0 translate-y-0' : 'translate-x-full translate-y-full'
        }`}
      >
        {/* Yellow Header */}
        <div className="bg-yellow-400 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
              <img src={iruLogo} alt="IRU Chat" className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-gray-900 font-semibold text-xs truncate">IRU Chat Support</h3>
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
                <span className="text-gray-800 text-[10px]">We're online now</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-5 h-5 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors flex-shrink-0"
            aria-label="Close chat"
          >
            <X size={12} className="text-white" />
          </button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-white">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-2 ${
                message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center ${
                  message.sender === 'bot'
                    ? 'bg-gradient-to-br from-brand-blue to-brand-cyan text-white font-bold text-[10px]'
                    : 'bg-gray-300'
                }`}
              >
                {message.sender === 'bot' ? (
                  <span className="text-[10px]">IRU</span>
                ) : (
                  <span className="text-[10px] text-gray-600">{userName.charAt(0).toUpperCase()}</span>
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[75%] rounded-lg px-2.5 py-1.5 ${
                  message.sender === 'user'
                    ? 'bg-yellow-400 text-gray-900 rounded-br-sm'
                    : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100'
                }`}
              >
                <p className="text-xs leading-relaxed">{message.text}</p>
                <p
                  className={`text-[10px] mt-0.5 ${
                    message.sender === 'user' ? 'text-gray-700' : 'text-gray-500'
                  }`}
                >
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-blue to-brand-cyan flex-shrink-0 flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">IRU</span>
              </div>
              <div className="bg-white rounded-lg rounded-bl-sm px-2.5 py-1.5 shadow-sm border border-gray-100">
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Action Buttons - Show only if no messages beyond initial greeting */}
          {messages.length <= 1 && (
            <div className="space-y-1.5 pt-2">
              <button
                onClick={() => handleQuickAction('pricing')}
                className="w-full text-left px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-xs text-gray-700 border border-gray-200"
              >
                💰 Pricing Information
              </button>
              <button
                onClick={() => handleQuickAction('book')}
                className="w-full text-left px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-xs text-gray-700 border border-gray-200"
              >
                📅 Book a Session
              </button>
              <button
                onClick={() => handleQuickAction('services')}
                className="w-full text-left px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-xs text-gray-700 border border-gray-200"
              >
                🛠️ Our Services
              </button>
              <button
                onClick={() => handleQuickAction('contact')}
                className="w-full text-left px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-xs text-gray-700 border border-gray-200"
              >
                📞 Contact Details
              </button>
              <button
                onClick={() => handleQuickAction('portfolio')}
                className="w-full text-left px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-xs text-gray-700 border border-gray-200"
              >
                🎨 Portfolio Examples
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-2.5 bg-white border-t border-gray-200">
          <form onSubmit={handleSendMessage} className="mb-2">
            <div className="flex items-center space-x-1.5">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full px-2.5 py-1.5 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-400 text-xs"
                />
              </div>
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="p-1.5 rounded-md bg-yellow-400 hover:bg-yellow-500 text-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                aria-label="Send message"
              >
                <Send size={14} />
              </button>
            </div>
          </form>

          {/* Contact Information */}
          <div className="space-y-0.5 text-[10px] text-gray-600">
            <div className="flex items-center space-x-1 truncate">
              <span>📞</span>
              <a href="tel:+250795381733" className="truncate hover:text-brand-blue">0795 381 733 / 0736 318 111</a>
            </div>
            <div className="flex items-center space-x-1 truncate">
              <span>💬</span>
              <a href="https://wa.me/250795381733" target="_blank" rel="noopener noreferrer" className="truncate hover:text-brand-blue">WhatsApp: 0795381733</a>
            </div>
            <div className="flex items-center space-x-1 truncate">
              <span>📍</span>
              <span className="truncate">Gahanga, Kicukiro, Kigali, Rwanda</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatbotSidebar;

