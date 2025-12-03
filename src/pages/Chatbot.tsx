import React, { useState, useEffect, useRef } from 'react';


const IruChat = () => {
    const [activeSpace, setActiveSpace] = useState('product');
    const [activeChannel, setActiveChannel] = useState('general');
    const [channels, setChannels] = useState([]);
    const [messages, setMessages] = useState([]);
    const [convoHistory, setConvoHistory] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const channelsBySpace = {
        product: [{ id: 'general', name: 'general', unread: 0 }, { id: 'roadmap', name: 'roadmap', unread: 2 }, { id: 'design', name: 'design', unread: 0 }],
        support: [{ id: 'tickets', name: 'tickets', unread: 3 }, { id: 'oncall', name: 'oncall', unread: 0 }],
        community: [{ id: 'announcements', name: 'announcements', unread: 0 }, { id: 'events', name: 'events', unread: 5 }],
        research: [{ id: 'ml', name: 'machine-learning', unread: 0 }, { id: 'papers', name: 'papers', unread: 0 }],
    };

    const seedMessages = {
        general: [{ from: 'assistant', text: "Welcome to IRU Chat! Ask me anything or type /help to see tips.", time: Date.now() - 3600000 }, { from: 'me', text: 'Hi show me latest roadmap updates.', time: Date.now() - 3500000 }],
        roadmap: [{ from: 'assistant', text: 'Roadmap: Q3 AI assistants, Q4 — White label', time: Date.now() - 86400000 }],
        tickets: [{ from: 'assistant', text: 'Ticket #432 needs triage', time: Date.now() - 7200000 }],
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSelectSpace = (space) => {
        setActiveSpace(space);
        const firstChannel = channelsBySpace[space]?.[0];
        if (firstChannel) {
            handleSelectChannel(firstChannel);
        }
    };

    const handleSelectChannel = (channel) => {
        setActiveChannel(channel.id);
        setMessages(seedMessages[channel.id] || []);
        setIsLeftSidebarOpen(false); // Close sidebar after selection on mobile
    };

    const formatTime = (timestamp) => {
        const d = new Date(timestamp);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const simulatedBotReply = (userText) => {
        const responses = [
            'I can summarize that for you — want a short or detailed summary?',
            'Got it. I created a task for this and assigned it to the team.',
            'Here are 3 quick suggestions based on your message.',
            'I found a similar discussion — would you like to open it?'
        ];
        let reply = 'Thanks — noted.';
        if (/roadmap|plan|q3|q4/i.test(userText)) reply = 'Roadmap update: Q3 — AI Assistants; Q4 — White label. Need details?';
        else if (/summar/i.test(userText)) reply = 'Summary: 3 action items — 1) design spec, 2) assign team, 3) schedule review.';
        else if (/bug|issue|ticket/i.test(userText)) reply = 'I created ticket #451 and assigned it to the on-call team.';
        else reply = responses[Math.floor(Math.random() * responses.length)];

        setTimeout(() => {
            setIsTyping(false);
            const newAssistantMessage = { from: 'assistant', text: reply, time: Date.now() };
            setMessages(prev => [...prev, newAssistantMessage]);
            setConvoHistory(prev => [...prev, newAssistantMessage]);
        }, 1000 + Math.random() * 900);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const newMessage = { from: 'me', text: inputValue, time: Date.now() };
        setMessages(prev => [...prev, newMessage]);
        setConvoHistory(prev => [...prev, newMessage]);
        setInputValue('');
        setIsTyping(true);
        simulatedBotReply(newMessage.text);
    };

    const handleQuickReply = (text) => {
        setInputValue(text);
        setIsRightSidebarOpen(false); // Close sidebar after selection on mobile
    };

    const handleSuggestion = (text) => {
        if (text.includes('summarize')) {
            setInputValue('Please summarize this conversation.');
        } else if (text.includes('create tasks')) {
            setInputValue('Create tasks from this chat.');
        } else if (text.includes('translate')) {
            setInputValue('Translate this chat to Kinyarwanda.');
        } else if (text.includes('export')) {
            setInputValue('Export transcript as PDF.');
        }
        setIsRightSidebarOpen(false); // Close sidebar after selection on mobile
    };

    const handleNewConversation = () => {
        setMessages([{ from: 'assistant', text: "New conversation started. How can I help?", time: Date.now() }]);
        setConvoHistory([]);
        setIsLeftSidebarOpen(false);
        setIsRightSidebarOpen(false);
    };

    const handleEmojiClick = () => {
        setInputValue(prevValue => prevValue + '😀');
    };

    const handleFileAttach = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const newMessage = { from: 'me', text: `[File attached: ${file.name}]`, time: Date.now() };
            setMessages(prev => [...prev, newMessage]);
            setConvoHistory(prev => [...prev, newMessage]);
            e.target.value = null; // Reset file input
        }
    };

    const handleStartRecording = () => {
        setIsRecording(true);
    };

    const handleStopRecording = () => {
        setIsRecording(false);
        const newMessage = { from: 'me', text: `[Voice message recorded]`, time: Date.now() };
        setMessages(prev => [...prev, newMessage]);
        setConvoHistory(prev => [...prev, newMessage]);
    };

    const handleTranslate = () => {
        setInputValue('Please translate the last message to English.');
    };

    useEffect(() => {
        setChannels(channelsBySpace[activeSpace]);
    }, [activeSpace]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    useEffect(() => {
        // Check for feature query from Features page
        const featureQuery = localStorage.getItem('chatbot-feature-query');
        if (featureQuery) {
            try {
                const parsed = JSON.parse(featureQuery);
                // Check if it's recent (within last 10 seconds)
                if (Date.now() - parsed.timestamp < 10000) {
                    // Auto-send feature query message
                    const featureMessage = `Tell me more about ${parsed.name}: ${parsed.description}`;
                    const userMessage = { from: 'me', text: featureMessage, time: Date.now() };
                    const initialAssistantMessage = { 
                        from: 'assistant', 
                        text: generateFeatureResponse(parsed.name, parsed.description), 
                        time: Date.now() 
                    };
                    setMessages([userMessage, initialAssistantMessage]);
                    setConvoHistory([userMessage, initialAssistantMessage]);
                    // Clear the feature query
                    localStorage.removeItem('chatbot-feature-query');
                    return;
                }
            } catch (e) {
                // Ignore errors
            }
        }
        
        // Default initial message
        const initialAssistantMessage = { from: 'assistant', text: "Hello I'm IRU Assistant. I can summarize, create tasks, translate, and integrate with your systems. Try: 'Summarize this chat'", time: Date.now() };
        setMessages([initialAssistantMessage]);
        setConvoHistory([initialAssistantMessage]);
    }, []);

    const generateFeatureResponse = (featureName, featureDescription) => {
        const responses = {
            "AI-Powered Conversation Intelligence": `Great choice! ${featureName} is one of our most powerful features. ${featureDescription}\n\nThis feature uses advanced AI to:\n• Remember context across conversations for more natural interactions\n• Automatically summarize meetings with actionable insights\n• Analyze sentiment in real-time to help you respond appropriately\n\nWould you like to know how to set this up, or do you have specific questions about how it works?`,
            
            "Multi-Layer Privacy & Security": `Excellent! ${featureName} ensures your data stays private and secure. ${featureDescription}\n\nKey benefits include:\n• Self-destructing rooms for sensitive conversations that automatically delete\n• On-device processing means your data never leaves your device\n• Stealth mode helps you communicate privately without detection\n\nThis is perfect for businesses handling confidential information. Want to learn more about our security protocols?`,
            
            "Built-in Business & Collaboration Tools": `Perfect! ${featureName} helps teams work together seamlessly. ${featureDescription}\n\nWith this feature, you can:\n• Create dedicated spaces for projects with their own tools and storage\n• Host high-quality meetings without leaving the app\n• Sign contracts and documents directly in chat\n• Convert voice messages into trackable tasks automatically\n\nThis eliminates the need for multiple apps. Would you like a demo of how this works?`,
            
            "Community & Broadcast Messaging": `Awesome! ${featureName} is perfect for large-scale communication. ${featureDescription}\n\nThis includes:\n• Community channels for large discussions with threaded topics\n• Broadcast messaging to reach unlimited subscribers\n• Interest-based communities (public or private) for connecting people\n\nGreat for organizations, communities, or businesses that need to reach many people. Want to know how to set up your first community?`,
            
            "Real-Time Multilingual Collaboration": `Fantastic! ${featureName} breaks down language barriers. ${featureDescription}\n\nFeatures include:\n• Instant translation for text and voice in real-time\n• Group translation mode for mixed-language teams\n• Seamless communication across different languages\n\nPerfect for global teams! Would you like to know which languages we support?`,
            
            "Advanced Media & File Features": `Excellent! ${featureName} makes file management effortless. ${featureDescription}\n\nCapabilities include:\n• AI-powered search inside images, audio, and documents\n• Smart document scanner built right into chat\n• Find exact details instantly without opening files\n\nThis saves tons of time! Want to see how the AI search works?`,
            
            "Productivity-First Experience": `Great choice! ${featureName} helps you stay focused and organized. ${featureDescription}\n\nIncludes:\n• Topic threads within chats to organize discussions\n• AI meeting scheduler that understands context\n• Focus mode to block non-essential notifications during work\n\nThis helps maximize your productivity! Want tips on setting up focus mode?`
        };

        // Try to find a specific response
        for (const [key, value] of Object.entries(responses)) {
            if (featureName.includes(key) || key.includes(featureName.split(' ')[0])) {
                return value;
            }
        }

        // Generic response
        return `Great question about ${featureName}! ${featureDescription}\n\nThis is one of our most popular features. It helps users by providing advanced capabilities that enhance productivity and collaboration.\n\nWould you like to know:\n• How to get started with this feature?\n• Pricing information?\n• See a live demo?\n• Get technical details?\n\nJust let me know what you'd like to explore!`;
    };

    return (
        <div className="flex h-screen bg-gradient-to-b from-[#041223] to-[#07122a] text-[#eaf3ff] p-4 sm:p-7">
            <style>{`
        .sidebar-bg {
          background: linear-gradient(180deg, #0d1624, rgba(13, 22, 36, 0.6));
        }
        .chat-panel-bg {
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.01));
        }
        .right-panel-bg {
          background: linear-gradient(180deg, #0d1624, rgba(13, 22, 36, 0.4));
        }
        .logo-bg {
          background: linear-gradient(135deg, #6aa1ff, #5ad1c8);
        }
        .send-btn-bg {
          background: linear-gradient(90deg, #6aa1ff, #5ad1c8);
        }
        .active-space-bg {
          background: linear-gradient(90deg, #6aa1ff, #5ad1c8);
        }
        .glass-bg {
          background: rgba(255, 255, 255, 0.04);
        }
        .glass-2-bg {
          background: rgba(255, 255, 255, 0.02);
        }
        .chip-bg {
          background: rgba(255, 255, 255, 0.03);
        }
        .icon-btn-bg {
          background: rgba(255, 255, 255, 0.04);
        }
        .new-space-bg {
          background: linear-gradient(90deg, rgba(106, 161, 255, 0.08), rgba(90, 209, 200, 0.06));
        }
        .dot {
          animation: blink 1s infinite;
        }
        .dot:nth-child(2) {
          animation-delay: 0.15s;
        }
        .dot:nth-child(3) {
          animation-delay: 0.3s;
        }
        .pulse {
          animation: pulse-animation 1s infinite;
        }
        @keyframes pulse-animation {
          0% { box-shadow: 0 0 0 0px rgba(255, 0, 0, 0.6); }
          100% { box-shadow: 0 0 0 10px rgba(255, 0, 0, 0); }
        }
        @keyframes blink {
          0% { opacity: 0.2; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-4px); }
          100% { opacity: 0.2; transform: translateY(0); }
        }
      `}</style>

            {/* Mobile Sidebar Overlay (Left) */}
            {isLeftSidebarOpen && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex md:hidden">
                    <div className="sidebar-bg w-3/4 h-full p-4 rounded-r-[14px]">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <div className="logo-bg w-8 h-8 rounded-[8px] grid place-items-center text-[#061026] font-black">IR</div>
                                <span className="font-extrabold text-lg">IRU Chat</span>
                            </div>
                            <button onClick={() => setIsLeftSidebarOpen(false)} className="text-xl">
                                &times;
                            </button>
                        </div>
                        <div className="flex flex-col gap-2 overflow-auto p-1">
                            {Object.keys(channelsBySpace).map(space => (
                                <div
                                    key={space}
                                    className={`p-2 px-3 rounded-full cursor-pointer font-bold ${activeSpace === space ? 'active-space-bg text-[#041126]' : 'glass-bg'}`}
                                    onClick={() => handleSelectSpace(space)}
                                >
                                    {space.charAt(0).toUpperCase() + space.slice(1)}
                                </div>
                            ))}
                        </div>
                        <div className="mt-1 overflow-auto flex flex-col gap-1">
                            {channels.map(channel => (
                                <div
                                    key={channel.id}
                                    className={`flex items-center gap-2 p-2 rounded-[10px] cursor-pointer hover:glass-bg ${activeChannel === channel.id ? 'glass-bg' : ''}`}
                                    onClick={() => handleSelectChannel(channel)}
                                >
                                    <div className="w-9 h-9 rounded-[8px] bg-[rgba(255,255,255,0.03)] grid place-items-center font-extrabold text-xl">{channel.name[0].toUpperCase()}</div>
                                    <div className="flex-1">
                                        <div className="font-bold">{channel.name}</div>
                                        <div className="text-xs text-[#9fb0d0]">{channel.unread} unread</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div onClick={handleNewConversation} className="mt-auto p-3 rounded-[10px] new-space-bg text-center font-bold cursor-pointer">+ New Chat</div>
                    </div>
                </div>
            )}

            {/* Mobile Sidebar Overlay (Right) */}
            {isRightSidebarOpen && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex justify-end md:hidden">
                    <div className="right-panel-bg w-3/4 h-full p-4 rounded-l-[14px] overflow-y-auto">
                        <div className="flex justify-end items-center mb-4">
                            <button onClick={() => setIsRightSidebarOpen(false)} className="text-xl">
                                &times;
                            </button>
                        </div>
                        <div className="glass-2-bg p-3 rounded-[12px]">
                            <h4 className="font-bold mb-2">IRU Assistant</h4>
                            <p className="text-sm text-[#9fb0d0]">Smart actions, context memory, and customizable prompts.</p>
                            <div className="mt-3 flex gap-2 flex-wrap">
                                {['Summarize chat', 'Create tasks', 'Translate', 'Export transcript'].map(suggestion => (
                                    <div
                                        key={suggestion}
                                        className="p-2 px-3 rounded-[10px] glass-bg text-sm cursor-pointer"
                                        onClick={() => handleSuggestion(suggestion)}
                                    >
                                        {suggestion}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="glass-2-bg p-3 rounded-[12px] mt-4">
                            <h4 className="font-bold mb-2">Quick Replies</h4>
                            <div className="flex gap-2 flex-wrap">
                                {['On it — will update soon', 'Thanks got it!', 'Can you share the file?'].map(reply => (
                                    <div
                                        key={reply}
                                        className="p-2 px-3 rounded-[10px] glass-bg text-sm cursor-pointer"
                                        onClick={() => handleQuickReply(reply)}
                                    >
                                        {reply}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Left Sidebar (Desktop) */}
            <aside className="sidebar-bg rounded-[14px] shadow-2xl p-3 flex-col gap-3 w-[15%] hidden md:flex">
                <div className="flex items-center gap-3 p-2">
                    <div className="logo-bg w-10 h-10 rounded-[10px] grid place-items-center text-[#061026] font-black">IR</div>
                    <div>
                        <div className="font-extrabold text-lg">IRU Chat</div>
                        <div className="text-xs text-[#9fb0d0]">AI • Spaces • Live</div>
                    </div>
                </div>
                <div className="flex flex-col gap-2 overflow-auto p-1">
                    {Object.keys(channelsBySpace).map(space => (
                        <div
                            key={space}
                            className={`p-2 px-3 rounded-full cursor-pointer font-bold ${activeSpace === space ? 'active-space-bg text-[#041126]' : 'glass-bg'}`}
                            onClick={() => handleSelectSpace(space)}
                        >
                            {space.charAt(0).toUpperCase() + space.slice(1)}
                        </div>
                    ))}
                </div>
                <div className="mt-1 overflow-auto flex flex-col gap-1">
                    {channels.map(channel => (
                        <div
                            key={channel.id}
                            className={`flex items-center gap-2 p-2 rounded-[10px] cursor-pointer hover:glass-bg ${activeChannel === channel.id ? 'glass-bg' : ''}`}
                            onClick={() => handleSelectChannel(channel)}
                        >
                            <div className="w-9 h-9 rounded-[8px] bg-[rgba(255,255,255,0.03)] grid place-items-center font-extrabold text-xl">{channel.name[0].toUpperCase()}</div>
                            <div className="flex-1">
                                <div className="font-bold">{channel.name}</div>
                                <div className="text-xs text-[#9fb0d0]">{channel.unread} unread</div>
                            </div>
                        </div>
                    ))}
                </div>
                <div onClick={handleNewConversation} className="mt-auto p-3 rounded-[10px] new-space-bg text-center font-bold cursor-pointer">+ New Chat</div>
            </aside>

            {/* Main Chat Panel */}
            <section className="flex flex-col rounded-[14px] chat-panel-bg shadow-2xl flex-1 mx-0 md:mx-5">
                <div className="flex items-center justify-between p-4 border-b border-[rgba(255,255,255,0.03)]">
                    <div className="flex items-center gap-3">
                        <div className="flex md:hidden items-center">
                            <button onClick={() => setIsLeftSidebarOpen(true)} className="icon-btn-bg rounded-[10px] p-2 mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                            </button>
                        </div>
                        <div className="logo-bg w-11 h-11 rounded-[10px] grid place-items-center text-[#041026] font-black">CB</div>
                        <div>
                            <div className="font-extrabold text-lg">IRU Assistant</div>
                            <div className="text-sm text-[#9fb0d0]">Ask anything AI-powered assistant</div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="icon-btn-bg rounded-[10px] p-2 cursor-pointer" title="Search">🔎</button>
                        <button className="icon-btn-bg rounded-[10px] p-2 cursor-pointer" title="Settings">⚙️</button>
                        <button onClick={handleNewConversation} className="icon-btn-bg rounded-[10px] p-2 cursor-pointer hidden md:block" title="New conversation">✚</button>
                        <button onClick={() => setIsRightSidebarOpen(true)} className="icon-btn-bg rounded-[10px] p-2 cursor-pointer md:hidden">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                        </button>
                    </div>
                </div>

                <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-3">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`max-w-[78%] p-3 rounded-[12px] shadow-lg ${msg.from === 'me' ? 'ml-auto send-btn-bg text-[#041026]' : 'chat-panel-bg'}`}
                        >
                            <div className="text-xs text-[#9fb0d0] mb-1">{msg.from === 'me' ? 'You' : 'IRU'} • {formatTime(msg.time)}</div>
                            <div className="whitespace-pre-wrap">{msg.text}</div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex items-center gap-2">
                            <div className="text-xs text-[#9fb0d0]">IRU • {formatTime(Date.now())}</div>
                            <div className="flex gap-1">
                                <span className="dot w-2 h-2 rounded-full bg-[rgba(255,255,255,0.18)]"></span>
                                <span className="dot w-2 h-2 rounded-full bg-[rgba(255,255,255,0.18)]"></span>
                                <span className="dot w-2 h-2 rounded-full bg-[rgba(255,255,255,0.18)]"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="p-3 border-t border-[rgba(255,255,255,0.03)] flex gap-3 items-end">
                    {isRecording ? (
                        <div className="flex-1 flex items-center gap-3">
                            <span className="text-sm text-[#9fb0d0]">Recording...</span>
                            <div className="h-3 w-3 bg-red-500 rounded-full pulse"></div>
                            <button
                                type="button"
                                onClick={handleStopRecording}
                                className="py-2 px-4 rounded-full border-none text-[#eaf3ff] font-bold cursor-pointer bg-red-500 hover:bg-red-600"
                            >
                                Stop
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="flex gap-2 items-center hidden sm:flex">
                                <button type="button" className="chip-bg rounded-full p-2 text-sm cursor-pointer" onClick={handleEmojiClick}>😊</button>
                                <button type="button" className="chip-bg rounded-full p-2 text-sm cursor-pointer" onClick={handleFileAttach}>📎</button>
                                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
                                <button type="button" className="chip-bg rounded-full p-2 text-sm cursor-pointer" onClick={handleStartRecording}>🎙️</button>
                                <button type="button" className="chip-bg rounded-full p-2 text-sm cursor-pointer" onClick={handleTranslate}>🌐</button>
                            </div>
                            <textarea
                                className="flex-1 min-h-[46px] max-h-40 p-3 rounded-[12px] border border-[rgba(255,255,255,0.06)] bg-transparent text-[#eaf3ff] outline-none resize-none"
                                placeholder="Type a message or ask the assistant..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleSendMessage(e); }}
                                rows={1}
                            />
                            <button type="submit" className="send-btn-bg py-3 px-5 rounded-full border-none text-[#041026] font-extrabold cursor-pointer">Send</button>
                        </>
                    )}
                </form>
            </section>

            {/* Right Panel (Desktop) */}
            <aside className="right-panel-bg rounded-[14px] p-3 shadow-2xl flex-col gap-3 w-[15%] hidden md:flex">
                <div className="glass-2-bg p-3 rounded-[12px]">
                    <h4 className="font-bold mb-2">IRU Assistant</h4>
                    <p className="text-sm text-[#9fb0d0]">Smart actions, context memory, and customizable prompts.</p>
                    <div className="mt-3 flex gap-2 flex-wrap">
                        {['Summarize chat', 'Create tasks', 'Translate', 'Export transcript'].map(suggestion => (
                            <div
                                key={suggestion}
                                className="p-2 px-3 rounded-[10px] glass-bg text-sm cursor-pointer"
                                onClick={() => handleSuggestion(suggestion)}
                            >
                                {suggestion}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="glass-2-bg p-3 rounded-[12px]">
                    <h4 className="font-bold mb-2">Quick Replies</h4>
                    <div className="flex gap-2 flex-wrap">
                        {['On it will update soon', 'Thanks got it!', 'Can you share the file?'].map(reply => (
                            <div
                                key={reply}
                                className="p-2 px-3 rounded-[10px] glass-bg text-sm cursor-pointer"
                                onClick={() => handleQuickReply(reply)}
                            >
                                {reply}
                            </div>
                        ))}
                    </div>
                </div>
            </aside>
        </div>
    );
};

export default IruChat;