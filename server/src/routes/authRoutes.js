const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { register, login, getProfile } = require('../controllers/authController');

// Register
router.post('/register', register);

// Login
router.post('/login', login);

// Get current user profile
router.get('/me', protect, getProfile);

// Admin Routes
router.get('/admin/users', protect, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error('Get users error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.delete('/admin/users/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        await user.remove();
        res.json({ message: 'User deleted' });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
