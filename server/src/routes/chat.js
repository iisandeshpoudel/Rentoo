const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    sendMessage,
    getMessages,
    getChatUsers,
    getUnreadCount
} = require('../controllers/chatController');

// Get all users that have chatted with the current user
router.get('/users', protect, getChatUsers);

// Get messages between current user and another user
router.get('/messages/:userId', protect, getMessages);

// Send a message
router.post('/send', protect, sendMessage);

// Get unread message count
router.get('/unread', protect, getUnreadCount);

module.exports = router;
