import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import API_BASE_URL, { authFetch } from '../../config/api';
import './ChatBot.css';
import botIcon from '../../assets/bot-icon.png';

const ChatBot = ({ context = "You are the RecruitSmart AI Assistant." }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! I'm your RecruitSmart AI. How can I help you today?", sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const quickActions = [
        { label: "Find Jobs", query: "What are the latest job openings for me?" },
        { label: "Check Status", query: "What is the status of my applications?" },
        { label: "Profile Tips", query: "How can I improve my student profile?" }
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, loading, isOpen]);

    const handleSend = async (overrideMessage = null) => {
        const messageToSend = overrideMessage || input;
        if (!messageToSend.trim() || loading) return;

        const userMsg = { text: messageToSend, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const response = await authFetch(`${API_BASE_URL}/api/ai/chat`, {
                method: 'POST',
                body: JSON.stringify({
                    message: messageToSend,
                    context: context
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'AI response failed');
            }

            // Read the stream
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedResponse = "";

            // Add an initial empty AI message to stream into
            setMessages(prev => [...prev, { text: "", sender: 'ai' }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                // SSE chunks usually look like "data: text\n\n"
                // But spring's SseEmitter might just send raw text in some configs
                // We'll handle both basic text chunks and "data:" prefixed ones
                const lines = chunk.split('\n');
                for (let line of lines) {
                    if (line.startsWith('data:')) {
                        line = line.substring(5).trim();
                    }
                    if (line) {
                        accumulatedResponse += line;
                        setMessages(prev => {
                            const newMsgs = [...prev];
                            newMsgs[newMsgs.length - 1] = { text: accumulatedResponse, sender: 'ai' };
                            return newMsgs;
                        });
                    }
                }
            }

        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, {
                text: `Sorry, I encountered an error: ${error.message}`,
                sender: 'ai'
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chatbot-wrapper">
            {isOpen ? (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <h3>RecruitSmart AI</h3>
                        <button onClick={() => setIsOpen(false)}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg, i) => (
                            <div key={i} className={`message ${msg.sender}`}>
                                {msg.sender === 'ai' && (
                                    <img src={botIcon} alt="bot" className="message-icon" />
                                )}
                                <div className="message-bubble">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {msg.text}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        ))}
                        {loading && !messages[messages.length - 1]?.text && (
                            <div className="message ai">
                                <img src={botIcon} alt="bot" className="message-icon" />
                                <div className="message-bubble">
                                    <div className="loading-dots">
                                        <div className="dot"></div>
                                        <div className="dot"></div>
                                        <div className="dot"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="quick-actions">
                        {quickActions.map((action, i) => (
                            <button
                                key={i}
                                onClick={() => handleSend(action.query)}
                                disabled={loading}
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>

                    <div className="chatbot-input-container">
                        <div className="chatbot-input">
                            <input
                                type="text"
                                placeholder="Ask RecruitSmart..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                disabled={loading}
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={loading || !input.trim()}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
                    <img src={botIcon} alt="AI" className="toggle-icon" />
                </button>
            )}
        </div>
    );
};

export default ChatBot;
