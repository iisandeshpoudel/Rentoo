const express = require('express');
const router = express.Router();
const RentalRequest = require('../models/RentalRequest');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const { 
  createRentalRequestNotification, 
  createRentalStatusNotification,
  createPaymentNotification,
  createReturnNotification 
} = require('../services/notificationService');

// Create a rental request
router.post('/', auth, async (req, res) => {
  try {
    const { productId, startDate, endDate } = req.body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start < now) {
      return res.status(400).json({ message: 'Start date cannot be in the past' });
    }

    if (end <= start) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    // Get product and check availability
    const product = await Product.findById(productId).populate('vendor');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.availability) {
      return res.status(400).json({ message: 'Product is not available for rent' });
    }

    // Check for overlapping rentals
    const overlappingRental = await RentalRequest.findOne({
      product: productId,
      status: 'approved',
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });

    if (overlappingRental) {
      return res.status(400).json({ message: 'Product is not available for these dates' });
    }

    // Calculate total price
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalPrice = days * product.dailyRate;

    // Create rental request
    const rentalRequest = new RentalRequest({
      customer: req.user.id,
      vendor: product.vendor._id,
      product: productId,
      startDate,
      endDate,
      totalPrice,
      status: 'pending'
    });

    await rentalRequest.save();

    // Create notifications
    await createRentalRequestNotification(await rentalRequest.populate(['product', 'customer']));

    res.status(201).json(rentalRequest);
  } catch (error) {
    console.error('Error creating rental request:', error);
    res.status(500).json({ message: 'Error creating rental request' });
  }
});

// Get paginated rental requests for customer
router.get('/customer', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const rentals = await RentalRequest.find({ customer: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('product')
      .populate('vendor', 'name email');

    const total = await RentalRequest.countDocuments({ customer: req.user.id });

    res.json({
      rentals,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRentals: total
    });
  } catch (error) {
    console.error('Error fetching customer rentals:', error);
    res.status(500).json({ message: 'Error fetching rentals' });
  }
});

// Get paginated rental requests for vendor
router.get('/vendor', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const rentals = await RentalRequest.find({ vendor: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('product')
      .populate('customer', 'name email');

    const total = await RentalRequest.countDocuments({ vendor: req.user.id });

    res.json({
      rentals,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRentals: total
    });
  } catch (error) {
    console.error('Error fetching vendor rentals:', error);
    res.status(500).json({ message: 'Error fetching rentals' });
  }
});

// Update rental request status (vendor only)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const rental = await RentalRequest.findOne({
      _id: req.params.id,
      vendor: req.user.id
    }).populate(['product', 'customer']);

    if (!rental) {
      return res.status(404).json({ message: 'Rental request not found' });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    if (rental.status !== 'pending') {
      return res.status(400).json({ message: 'Can only update pending rental requests' });
    }

    rental.status = status;
    await rental.save();

    // Create notification
    await createRentalStatusNotification(rental, status);

    res.json(rental);
  } catch (error) {
    console.error('Error updating rental status:', error);
    res.status(500).json({ message: 'Error updating rental status' });
  }
});

// Mark rental as paid
router.patch('/:id/paid', auth, async (req, res) => {
  try {
    const rental = await RentalRequest.findOne({
      _id: req.params.id,
      customer: req.user.id,
      status: 'approved',
      paid: false
    }).populate(['product', 'vendor']);

    if (!rental) {
      return res.status(404).json({ message: 'Rental request not found' });
    }

    rental.paid = true;
    rental.paidAt = new Date();
    await rental.save();

    // Create payment notifications
    await createPaymentNotification(rental);

    res.json(rental);
  } catch (error) {
    console.error('Error marking rental as paid:', error);
    res.status(500).json({ message: 'Error updating rental' });
  }
});

// Mark rental as returned (vendor only)
router.patch('/:id/returned', auth, async (req, res) => {
  try {
    const rental = await RentalRequest.findOne({
      _id: req.params.id,
      vendor: req.user.id,
      status: 'approved',
      paid: true,
      returned: false
    }).populate(['product', 'customer']);

    if (!rental) {
      return res.status(404).json({ message: 'Rental request not found' });
    }

    rental.returned = true;
    rental.returnedAt = new Date();
    await rental.save();

    // Create return notification
    await createReturnNotification(rental);

    res.json(rental);
  } catch (error) {
    console.error('Error marking rental as returned:', error);
    res.status(500).json({ message: 'Error updating rental' });
  }
});

module.exports = router;
