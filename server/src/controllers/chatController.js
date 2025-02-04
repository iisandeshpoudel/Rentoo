const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Get all users that have chatted with the current user
exports.getChatUsers = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        
        // Find all unique users who have chatted with the current user
        const chatUsers = await ChatMessage.aggregate([
            {
                $match: {
                    $or: [
                        { sender: currentUserId },
                        { receiver: currentUserId }
                    ]
                }
            },
            {
                $sort: { timestamp: -1 }
            },
            {
                $group: {
                    _id: {
                        $cond: {
                            if: { $eq: ['$sender', currentUserId] },
                            then: '$receiver',
                            else: '$sender'
                        }
                    },
                    lastMessage: { $first: '$message' },
                    timestamp: { $first: '$timestamp' },
                    unread: {
                        $first: {
                            $and: [
                                { $ne: ['$sender', currentUserId] },
                                { $eq: ['$read', false] }
                            ]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            {
                $unwind: '$userDetails'
            },
            {
                $project: {
                    _id: '$userDetails._id',
                    name: '$userDetails.name',
                    email: '$userDetails.email',
                    role: '$userDetails.role',
                    lastMessage: {
                        message: '$lastMessage',
                        timestamp: '$timestamp',
                        unread: '$unread'
                    }
                }
            }
        ]);

        res.json({ users: chatUsers });
    } catch (error) {
        console.error('Error getting chat users:', error);
        res.status(500).json({ message: 'Error getting chat users', error: error.message });
    }
};

// Get messages between current user and another user
exports.getMessages = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id;

        // Validate that the other user exists
        const otherUser = await User.findById(userId);
        if (!otherUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get messages between the two users
        const messages = await ChatMessage.find({
            $or: [
                { sender: currentUserId, receiver: userId },
                { sender: userId, receiver: currentUserId }
            ]
        })
        .populate('sender', 'name email')
        .populate('receiver', 'name email')
        .sort({ timestamp: 1 });

        // Mark unread messages as read
        await ChatMessage.updateMany(
            {
                sender: userId,
                receiver: currentUserId,
                read: false
            },
            {
                $set: { read: true }
            }
        );

        res.json({ messages });
    } catch (error) {
        console.error('Error getting messages:', error);
        res.status(500).json({ message: 'Error getting messages', error: error.message });
    }
};

// Send a message
exports.sendMessage = async (req, res) => {
    try {
        const { receiverId, message } = req.body;
        const senderId = req.user._id;

        // Validate receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ message: 'Receiver not found' });
        }

        // Create and save the message
        const newMessage = await ChatMessage.create({
            sender: senderId,
            receiver: receiverId,
            message: message.trim(),
            timestamp: new Date(),
            read: false
        });

        // Create notification for the receiver
        await Notification.create({
            user: receiverId,
            type: 'NEW_MESSAGE',
            title: 'New Message',
            message: `You have a new message from ${req.user.name}`,
            read: false,
            relatedData: {
                senderId: senderId,
                messageId: newMessage._id
            }
        });

        // Populate sender and receiver details
        const populatedMessage = await ChatMessage.findById(newMessage._id)
            .populate('sender', 'name email')
            .populate('receiver', 'name email');

        res.status(201).json({ message: populatedMessage });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Error sending message', error: error.message });
    }
};

// Get unread message count
exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Count unread messages where user is the receiver
        const unreadCount = await ChatMessage.countDocuments({
            receiver: userId,
            read: false
        });

        res.json({ unreadCount });
    } catch (error) {
        console.error('Error getting unread count:', error);
        res.status(500).json({ message: 'Error getting unread count', error: error.message });
    }
};
