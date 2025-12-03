import { useState, useEffect, useRef } from 'react';
import { Paperclip, Camera, Send, X } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import iruLogo from '@/assets/iruchatlogo.png';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const CustomerSupport = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

    // Shipping
    if (lowerInput.includes('shipping') || lowerInput.includes('delivery') || lowerInput.includes('when')) {
      return 'Standard shipping takes 3-5 business days. Express shipping (1-2 days) is available at checkout.';
    }

    // Returns/Refunds
    if (lowerInput.includes('return') || lowerInput.includes('refund') || lowerInput.includes('cancel')) {
      return 'You can return items within 30 days of purchase. Please visit our Returns page or reply with your order number for assistance.';
    }

    // Payment
    if (lowerInput.includes('payment') || lowerInput.includes('charge') || lowerInput.includes('billing')) {
      return 'For payment inquiries, please provide your order number and I can check the status of your transaction.';
    }

    // Product questions
    if (lowerInput.includes('product') || lowerInput.includes('item') || lowerInput.includes('available')) {
      return 'I can help you find products! What are you looking for? You can also browse our catalog on the website.';
    }

    // Contact
    if (lowerInput.includes('contact') || lowerInput.includes('email') || lowerInput.includes('phone') || lowerInput.includes('whatsapp') || lowerInput.includes('address')) {
      return 'You can reach us by:\n📞 Phone: 0795 381 733 / 0736 318 111\n💬 WhatsApp: 0795381733\n📍 Address: Gahanga, Kicukiro, Kigali, Rwanda\n\nOur support team is available to assist you!';
    }

    // Greetings
    if (lowerInput.includes('hi') || lowerInput.includes('hello') || lowerInput.includes('hey')) {
      return 'Hello! I\'m here to help with any questions about your orders, products, or account. What can I assist you with?';
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

  const handleFileAttach = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileMessage: Message = {
        id: Date.now().toString(),
        text: `📎 ${file.name}`,
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fileMessage]);
      e.target.value = '';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh] max-h-[800px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-blue to-brand-cyan px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <img src={iruLogo} alt="IRU Chat" className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">Hi, this is {userName}!</h2>
                <p className="text-white/80 text-sm">Customer Support</p>
              </div>
            </div>
            <button
              onClick={() => window.history.back()}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-end space-x-2 ${
                  message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                    message.sender === 'bot'
                      ? 'bg-gradient-to-br from-brand-blue to-brand-cyan text-white font-bold'
                      : 'bg-gray-300'
                  }`}
                >
                  {message.sender === 'bot' ? (
                    <span className="text-sm">IRU</span>
                  ) : (
                    <span className="text-sm text-gray-600">{userName.charAt(0).toUpperCase()}</span>
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bg-yellow-400 text-gray-900 rounded-br-sm'
                      : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
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
              <div className="flex items-end space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue to-brand-cyan flex-shrink-0 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">IRU</span>
                </div>
                <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200">
            <div className="flex items-end space-x-2">
              <button
                type="button"
                onClick={handleFileAttach}
                className="p-2 text-gray-500 hover:text-brand-blue transition-colors flex-shrink-0"
                aria-label="Attach file"
              >
                <Paperclip size={20} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept="image/*,application/pdf,.doc,.docx"
              />

              <button
                type="button"
                className="p-2 text-gray-500 hover:text-brand-blue transition-colors flex-shrink-0"
                aria-label="Take photo"
              >
                <Camera size={20} />
              </button>

              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message here"
                  className="w-full px-4 py-3 pr-12 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-400"
                />
              </div>

              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="p-3 rounded-full bg-gradient-to-r from-brand-blue to-brand-cyan text-white hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CustomerSupport;

