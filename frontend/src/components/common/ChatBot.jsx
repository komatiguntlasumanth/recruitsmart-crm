import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import './ChatBot.css';
import botIcon from '../../assets/bot-icon.png';

const ChatBot = ({ context = "You are the RecruitSmart AI Assistant." }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! I'm your RecruitSmart AI. How can I help you today?", sender: 'ai' }
    ]);
    // ... existing states ...
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${API_BASE_URL}/api/ai/chat`, {
                message: input,
                context: context
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const fullText = response.data.response;
            setLoading(false);

            // Simulate typing effect
            let displayedText = "";
            const words = fullText.split(" ");

            setMessages(prev => [...prev, { text: "", sender: 'ai' }]);

            for (let i = 0; i < words.length; i++) {
                displayedText += (i === 0 ? "" : " ") + words[i];
                setTimeout(() => {
                    setMessages(prev => {
                        const newMsgs = [...prev];
                        newMsgs[newMsgs.length - 1] = { text: displayedText, sender: 'ai' };
                        return newMsgs;
                    });
                }, i * 50); // Speed of typing
            }
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
                                <div className="message-bubble">{msg.text}</div>
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
                    <div className="chatbot-input">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button onClick={handleSend}>Send</button>
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
