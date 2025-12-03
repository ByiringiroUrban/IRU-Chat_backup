import React from 'react';

const ChatbotComponent = () => {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
            <div className="flex flex-col md:flex-row max-w-6xl w-full bg-white rounded-lg shadow-xl overflow-hidden">
                {/* Chatbot Interface Section */}
                <div className="relative flex-1 bg-white p-6 md:p-8 flex flex-col justify-between">
                    {/* Chat Header */}
                    <div className="bg-red-500 text-white p-4 rounded-t-lg flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
                                <img src="/Girl.png" alt="Retro AI" className="w-6 h-6" /> {/* Replace with your logo path */}
                            </div>
                            <div>
                                <p className="font-bold text-lg">Retro AI</p>
                                <p className="text-sm">Online</p>
                            </div>
                        </div>
                        <div className="flex space-x-1">
                            <span className="h-1 w-1 bg-white rounded-full"></span>
                            <span className="h-1 w-1 bg-white rounded-full"></span>
                            <span className="h-1 w-1 bg-white rounded-full"></span>
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                        {/* Incoming Message */}
                        <div className="flex items-start">
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                                <span className="text-sm font-bold">JD</span> {/* User initials */}
                            </div>
                            <div className="bg-gray-200 text-gray-800 p-3 rounded-tr-xl rounded-bl-xl rounded-br-xl max-w-xs">
                                How are you?
                            </div>
                        </div>

                        {/* Outgoing Message */}
                        <div className="flex justify-end">
                            <div className="bg-green-500 text-white p-3 rounded-tl-xl rounded-bl-xl rounded-br-xl max-w-xs">
                                Can you solve the current design model?
                            </div>
                        </div>
                        <p className="text-right text-xs text-gray-500">10:20PM</p>

                        {/* Incoming Message */}
                        <div className="flex items-start">
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                                <span className="text-sm font-bold">JD</span> {/* User initials */}
                            </div>
                            <div className="bg-gray-200 text-gray-800 p-3 rounded-tr-xl rounded-bl-xl rounded-br-xl max-w-xs">
                                I'm fine? Are you ok?
                            </div>
                        </div>

                        {/* Outgoing Message */}
                        <div className="flex justify-end">
                            <div className="bg-purple-500 text-white p-3 rounded-tl-xl rounded-bl-xl rounded-br-xl max-w-xs">
                                Sure, Let me find the solution
                            </div>
                        </div>
                        <p className="text-right text-xs text-gray-500">10:21PM</p>
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-gray-200 flex items-center">
                        <input
                            type="text"
                            placeholder="Ask me anything..."
                            className="flex-grow p-3 rounded-full bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button className="ml-3 p-3 bg-blue-600 text-white rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* "60x Faster" Overlay */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-cyan-400 text-white text-3xl font-bold p-4 rounded-lg shadow-lg rotate-12" style={{ zIndex: 10 }}>
                        60x <br /> Faster
                    </div>
                </div>

                {/* Text Content Section */}
                <div className="flex-1 p-8 md:p-12 flex flex-col justify-center bg-gray-50">
                    <p className="text-sm font-semibold text-gray-600 uppercase mb-2">Fastest AI Chatbot</p>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
                        Accurate, fast & source backed responses
                    </h2>
                    <p className="text-lg text-gray-700 leading-relaxed">
                        Business-ready chatbot responses backed by file & webpage sources, designed with anti-hallucination features to prevent irrelevant answers.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChatbotComponent;