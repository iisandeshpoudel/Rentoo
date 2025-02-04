import React, { useState } from 'react';
import Chat from './Chat';
import './ChatButton.css';

interface ChatButtonProps {
    otherUserId: string;
    otherUserName: string;
}

const ChatButton: React.FC<ChatButtonProps> = ({ otherUserId, otherUserName }) => {
    const [isChatOpen, setIsChatOpen] = useState(false);

    const handleClose = () => {
        setIsChatOpen(false);
    };

    return (
        <div className="chat-button-container">
            {isChatOpen ? (
                <div className="chat-popup">
                    <Chat 
                        otherUserId={otherUserId} 
                        otherUserName={otherUserName}
                        onClose={handleClose}
                    />
                </div>
            ) : (
                <button 
                    className="chat-button"
                    onClick={() => setIsChatOpen(true)}
                >
                    <i className="fas fa-comment"></i>
                    Chat with {otherUserName}
                </button>
            )}
        </div>
    );
};

export default ChatButton;
