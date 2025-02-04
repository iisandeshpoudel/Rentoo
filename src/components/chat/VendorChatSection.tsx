import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Chat from './Chat';
import { useAuth } from '../../contexts/AuthContext';
import './VendorChatSection.css';

interface ChatUser {
    _id: string;
    name: string;
    lastMessage?: {
        message: string;
        timestamp: string;
        unread: boolean;
    };
}

const VendorChatSection: React.FC = () => {
    const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
    const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        fetchChatUsers();
        const interval = setInterval(fetchChatUsers, 10000); // Refresh every 10 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchChatUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const { data } = await axios.get('/api/v1/chat/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setChatUsers(data.users);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching chat users:', error);
            setError('Failed to load chat users');
            setLoading(false);
        }
    };

    const formatLastSeen = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="vendor-chat-section">
            <div className="chat-users-list">
                <h2>Customer Chats</h2>
                {loading && <div className="loading">Loading chats...</div>}
                {error && <div className="error">{error}</div>}
                {!loading && chatUsers.length === 0 && (
                    <div className="no-chats">No active chats</div>
                )}
                {chatUsers.map(chatUser => (
                    <div
                        key={chatUser._id}
                        className={`chat-user-item ${selectedUser?._id === chatUser._id ? 'selected' : ''}`}
                        onClick={() => setSelectedUser(chatUser)}
                    >
                        <div className="chat-user-info">
                            <h3>{chatUser.name}</h3>
                            {chatUser.lastMessage && (
                                <>
                                    <p className="last-message">
                                        {chatUser.lastMessage.message.substring(0, 30)}
                                        {chatUser.lastMessage.message.length > 30 ? '...' : ''}
                                    </p>
                                    <span className="last-seen">
                                        {formatLastSeen(chatUser.lastMessage.timestamp)}
                                    </span>
                                    {chatUser.lastMessage.unread && (
                                        <span className="unread-badge">New</span>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="chat-window">
                {selectedUser ? (
                    <Chat
                        otherUserId={selectedUser._id}
                        otherUserName={selectedUser.name}
                        onClose={() => setSelectedUser(null)}
                    />
                ) : (
                    <div className="no-chat-selected">
                        <p>Select a chat to start messaging</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorChatSection;
