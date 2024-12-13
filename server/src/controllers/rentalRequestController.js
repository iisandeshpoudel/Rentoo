const RentalRequest = require('../models/RentalRequest');
const Product = require('../models/Product');
const User = require('../models/User');

// Create a new rental request
exports.createRentalRequest = async (req, res) => {
  try {
    const { productId, startDate, endDate, message } = req.body;
    
    // Validate user role
    if (req.user.role !== 'customer') {
      return res.status(403).json({ error: 'Only customers can create rental requests' });
    }

    // Find the product and validate
    const product = await Product.findById(productId).populate('vendor');
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if product is available
    if (!product.availability) {
      return res.status(400).json({ error: 'Product is not available for rent' });
    }

    // Prevent renting own product
    if (product.vendor._id.toString() === req.user._id) {
      return res.status(400).json({ error: 'You cannot rent your own product' });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start < now) {
      return res.status(400).json({ error: 'Start date cannot be in the past' });
    }

    if (end <= start) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    // Check for overlapping rentals
    const overlappingRental = await RentalRequest.findOne({
      product: productId,
      status: { $in: ['pending', 'approved'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } },
        { startDate: { $gte: start, $lte: end } },
        { endDate: { $gte: start, $lte: end } }
      ]
    });

    if (overlappingRental) {
      return res.status(400).json({ error: 'Product is already booked for these dates' });
    }

    // Calculate total days and price
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalPrice = totalDays * product.dailyRate;

    // Create rental request
    const rentalRequest = new RentalRequest({
      product: productId,
      customer: req.user._id,
      vendor: product.vendor._id,
      startDate,
      endDate,
      totalPrice,
      message,
      status: 'pending'
    });

    await rentalRequest.save();

    // Update populate without execPopulate
    const populatedRequest = await RentalRequest.findById(rentalRequest._id)
      .populate('product')
      .populate('customer', 'name email')
      .populate('vendor', 'name email');
    
    res.status(201).json(populatedRequest);
  } catch (error) {
    console.error('Rental request error:', error);
    res.status(400).json({ error: error.message || 'Failed to create rental request' });
  }
};

// Get rental requests for customer
exports.getCustomerRequests = async (req, res) => {
  try {
    console.log('Fetching requests for customer:', req.user._id);
    const requests = await RentalRequest.find({ customer: req.user._id })
      .populate({
        path: 'product',
        populate: {
          path: 'vendor',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 });
    
    // Debug log the first request and check product existence
    if (requests.length > 0) {
      const firstRequest = requests[0];
      console.log('First request details:', {
        id: firstRequest._id,
        productId: firstRequest.product ? firstRequest.product._id : firstRequest.product,
        productRef: firstRequest.toObject().product, // Get the raw product reference
        status: firstRequest.status
      });

      // Check if any requests have missing products and try to recover them
      const brokenRequests = requests.filter(req => !req.product);
      if (brokenRequests.length > 0) {
        console.log(`Found ${brokenRequests.length} requests with missing products`);
        // Get the raw product IDs from the broken requests
        const brokenProductIds = brokenRequests.map(req => req.toObject().product);
        console.log('Missing product IDs:', brokenProductIds);
        
        // Try to find these products directly
        const recoveredProducts = await Product.find({
          '_id': { $in: brokenProductIds }
        }).select('_id');
        
        if (recoveredProducts.length > 0) {
          console.log('Found some products that still exist:', 
            recoveredProducts.map(p => p._id));
        } else {
          console.log('None of the missing products exist in the database');
        }
      }
    } else {
      console.log('No requests found');
    }
    
    res.json(requests);
  } catch (error) {
    console.error('Get customer requests error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get rental requests for vendor
exports.getVendorRequests = async (req, res) => {
  try {
    const requests = await RentalRequest.find({ vendor: req.user._id })
      .populate('product')
      .populate('customer', 'name email')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error('Get vendor requests error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update rental request status
exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['approved', 'rejected', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const request = await RentalRequest.findById(id)
      .populate('product')
      .populate('customer', 'name email')
      .populate('vendor', 'name email');

    if (!request) {
      return res.status(404).json({ error: 'Rental request not found' });
    }

    // Validate permissions
    if (status === 'cancelled') {
      // Only customer can cancel their request
      if (request.customer._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Only the customer can cancel the request' });
      }
      // Can only cancel pending requests
      if (request.status !== 'pending') {
        return res.status(400).json({ error: 'Can only cancel pending requests' });
      }
    } else {
      // Only vendor can approve/reject/complete
      if (request.vendor._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Only the vendor can update this request' });
      }
      // Can't update cancelled requests
      if (request.status === 'cancelled') {
        return res.status(400).json({ error: 'Cannot update cancelled requests' });
      }
    }

    // Update request status
    request.status = status;
    await request.save();

    // If approved, mark product as unavailable
    if (status === 'approved') {
      await Product.findByIdAndUpdate(request.product._id, { availability: false });
    }
    // If rejected/cancelled/completed, mark product as available
    if (['rejected', 'cancelled', 'completed'].includes(status)) {
      await Product.findByIdAndUpdate(request.product._id, { availability: true });
    }

    res.json(request);
  } catch (error) {
    console.error('Update request status error:', error);
    res.status(400).json({ error: error.message });
  }
};

// Cancel rental request (customer only)
exports.cancelRequest = async (req, res) => {
  try {
    const request = await RentalRequest.findOne({
      _id: req.params.id,
      customer: req.user._id,
      status: { $in: ['pending', 'approved'] }
    });

    if (!request) {
      return res.status(404).json({
        error: 'Rental request not found or cannot be cancelled'
      });
    }

    request.status = 'cancelled';
    if (req.body.message) {
      request.message = req.body.message;
    }

    await request.save();
    res.json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get single rental request details
exports.getRequestDetails = async (req, res) => {
  try {
    const request = await RentalRequest.findOne({
      _id: req.params.id,
      $or: [
        { customer: req.user._id },
        { vendor: req.user._id }
      ]
    })
      .populate('product')
      .populate('customer', 'name email')
      .populate('vendor', 'name email');

    if (!request) {
      return res.status(404).json({ error: 'Rental request not found' });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 