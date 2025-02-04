import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import Chat from './Chat';
import './VendorChatSection.css'; // We can reuse the same styles

interface ChatUser {
    _id: string;
    name: string;
    email: string;
    lastMessage?: {
        message: string;
        timestamp: string;
        unread: boolean;
    };
}

const CustomerChatSection: React.FC = () => {
    const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
    const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const fetchChatUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/v1/chat/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setChatUsers(response.data.users);
            setError(null);
        } catch (err) {
            console.error('Error fetching chat users:', err);
            setError('Failed to load chat users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChatUsers();
        // Poll for new messages every 30 seconds
        const interval = setInterval(fetchChatUsers, 30000);
        return () => clearInterval(interval);
    }, []);

    const formatLastSeen = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor(diff / (1000 * 60));

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    };

    return (
        <div className="vendor-chat-section">
            <div className="chat-users-list">
                <h2>My Chats</h2>
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

export default CustomerChatSection; 