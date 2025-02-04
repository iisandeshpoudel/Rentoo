const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Product = require('../models/Product');
const RentalRequest = require('../models/RentalRequest');

// Middleware to ensure only admins can access these routes
router.use(protect);
router.use(isAdmin);

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const [users, products, rentals] = await Promise.all([
      User.find(),
      Product.find(),
      RentalRequest.find()
    ]);

    // Calculate user statistics
    const usersByRole = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    // Calculate rental statistics
    const rentalsByStatus = rentals.reduce((acc, rental) => {
      acc[rental.status] = (acc[rental.status] || 0) + 1;
      return acc;
    }, { pending: 0, approved: 0, rejected: 0, completed: 0, cancelled: 0 });

    const stats = {
      totalUsers: users.length,
      usersByRole,
      totalProducts: products.length,
      totalRentals: rentals.length,
      rentalsByStatus,
      recentActivity: {
        newUsers: users.filter(u => {
          const daysSinceCreation = (Date.now() - new Date(u.createdAt).getTime()) / (1000 * 60 * 60 * 24);
          return daysSinceCreation <= 7;
        }).length,
        newProducts: products.filter(p => {
          const daysSinceCreation = (Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24);
          return daysSinceCreation <= 7;
        }).length,
        newRentals: rentals.filter(r => {
          const daysSinceCreation = (Date.now() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60 * 24);
          return daysSinceCreation <= 7;
        }).length
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Error fetching admin statistics' });
  }
});

// User Management
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user' });
  }
});

router.patch('/users/:id', async (req, res) => {
  try {
    const { role, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user' });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// Product Management
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find().populate('vendor', 'name email');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products' });
  }
});

router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('vendor', 'name email');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product' });
  }
});

router.patch('/products/:id', async (req, res) => {
  try {
    const { availability, status } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { availability, status },
      { new: true, runValidators: true }
    ).populate('vendor', 'name email');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product' });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product' });
  }
});

// Rental Management
router.get('/rentals', async (req, res) => {
  try {
    const rentals = await RentalRequest.find()
      .populate('product')
      .populate('renter', '-password')
      .populate('vendor', '-password');
    res.json(rentals);
  } catch (error) {
    console.error('Error fetching rentals:', error);
    res.status(500).json({ message: 'Error fetching rentals' });
  }
});

router.get('/rentals/:id', async (req, res) => {
  try {
    const rental = await RentalRequest.findById(req.params.id)
      .populate('product')
      .populate('renter', '-password')
      .populate('vendor', '-password');
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }
    res.json(rental);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rental' });
  }
});

router.patch('/rentals/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const rental = await RentalRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('product')
      .populate('renter', '-password')
      .populate('vendor', '-password');

    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    res.json(rental);
  } catch (error) {
    res.status(500).json({ message: 'Error updating rental' });
  }
});

module.exports = router;