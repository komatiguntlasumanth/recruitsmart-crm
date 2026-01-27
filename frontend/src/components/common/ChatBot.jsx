import React, { useState, useEffect, useRef } from 'react';
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
        scrollToBottom();
    }, [messages]);

    const formatMessage = (text) => {
        // Simple markdown-like formatting
        return text.split('\n').map((line, i) => {
            // Headers
            if (line.startsWith('### ')) return <h4 key={i}>{line.replace('### ', '')}</h4>;
            if (line.startsWith('## ')) return <h3 key={i}>{line.replace('## ', '')}</h3>;

            // Bullet points
            if (line.startsWith('- ')) return <li key={i} style={{ marginLeft: '10px' }}>{parseInline(line.replace('- ', ''))}</li>;

            // Regular text with inline parsing
            return <p key={i}>{parseInline(line)}</p>;
        });
    };

    const parseInline = (text) => {
        // Handle bold **text**
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i}>{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    const handleSend = async (overrideMessage = null) => {
        const messageToSend = overrideMessage || input;
        if (!messageToSend.trim()) return;

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

            if (!response.ok) throw new Error('AI response failed');
            const data = await response.json();
            const fullText = data.response;
            setLoading(false);

            // Display directly for better performance or keep typing effect
            setMessages(prev => [...prev, { text: fullText, sender: 'ai' }]);

        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting right now. Please check if the server is running and you are logged in.", sender: 'ai' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`chatbot-wrapper ${isOpen ? 'open' : ''}`}>
            {isOpen ? (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img src={botIcon} alt="bot" className="header-icon" />
                            <h3>RecruitSmart AI</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)}>&times;</button>
                    </div>
                    <div className="chatbot-messages">
                        {messages.map((msg, i) => (
                            <div key={i} className={`message ${msg.sender}`}>
                                {msg.sender === 'ai' && (
                                    <img src={botIcon} alt="bot" className="message-icon" />
                                )}
                                <div className="message-bubble">{formatMessage(msg.text)}</div>
                            </div>
                        ))}
                        {loading && (
                            <div className="message ai">
                                <img src={botIcon} alt="bot" className="message-icon" />
                                <div className="message-bubble loading">...</div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="quick-actions">
                        {quickActions.map((action, i) => (
                            <button key={i} onClick={() => handleSend(action.query)}>
                                {action.label}
                            </button>
                        ))}
                    </div>

                    <div className="chatbot-input">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button onClick={() => handleSend()}>Send</button>
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
