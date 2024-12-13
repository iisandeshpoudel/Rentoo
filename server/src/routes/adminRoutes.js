const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const RentalRequest = require('../models/RentalRequest');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Get all users
router.get('/users', auth, checkRole(['admin']), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user
router.delete('/users/:id', auth, checkRole(['admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await user.deleteOne(); // Using deleteOne instead of remove
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user
router.put('/users/:id', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;

    await user.save();
    res.json({ message: 'User updated successfully', user: { 
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }});
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all products
router.get('/products', auth, checkRole(['admin']), async (req, res) => {
  try {
    const products = await Product.find()
      .populate('vendor', 'name email')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all rental requests
router.get('/rentals', auth, checkRole(['admin']), async (req, res) => {
  try {
    const rentals = await RentalRequest.find()
      .populate('product')
      .populate('customer', 'name email')
      .populate('vendor', 'name email')
      .sort({ createdAt: -1 });
    res.json(rentals);
  } catch (err) {
    console.error('Get rentals error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user statistics
router.get('/stats', auth, checkRole(['admin']), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalProducts = await Product.countDocuments();
    const totalRentals = await RentalRequest.countDocuments();
    const rentalsByStatus = await RentalRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      totalUsers,
      usersByRole: usersByRole.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      totalProducts,
      totalRentals,
      rentalsByStatus: rentalsByStatus.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {})
    });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;