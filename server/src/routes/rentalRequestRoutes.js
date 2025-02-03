const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const RentalRequest = require('../models/RentalRequest');
const Product = require('../models/Product');
const { createNotification } = require('../utils/notificationUtils');

// Debug route to verify the router is working
router.get('/test', (req, res) => {
  res.json({ message: 'Rental request routes are working' });
});

// Customer routes
router.get('/customer/rental-requests', auth, async (req, res) => {
  console.log('Fetching customer rental requests for user:', req.user._id);
  try {
    const rentalRequests = await RentalRequest.find({ renter: req.user._id })
      .populate({
        path: 'product',
        populate: {
          path: 'vendor',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 });

    console.log('Found rental requests:', rentalRequests.length);

    // Format the response to include vendor information
    const formattedRequests = rentalRequests.map(request => {
      const formattedRequest = request.toObject();
      if (formattedRequest.product && formattedRequest.product.vendor) {
        formattedRequest.vendor = formattedRequest.product.vendor;
      }
      return formattedRequest;
    });

    res.json(formattedRequests);
  } catch (error) {
    console.error('Error fetching rental requests:', error);
    res.status(500).json({ message: 'Error fetching rental requests' });
  }
});

router.post('/', auth, checkRole('customer'), async (req, res) => {
  try {
    const { productId, startDate, endDate, totalPrice, message } = req.body;
    
    // Validate required fields
    if (!productId || !startDate || !endDate || !totalPrice) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        details: {
          productId: !productId ? 'Product ID is required' : null,
          startDate: !startDate ? 'Start date is required' : null,
          endDate: !endDate ? 'End date is required' : null,
          totalPrice: !totalPrice ? 'Total price is required' : null
        }
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    if (end < start) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    if (start < new Date()) {
      return res.status(400).json({ message: 'Start date cannot be in the past' });
    }

    // Find the product and its vendor
    const product = await Product.findById(productId).populate('vendor');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Validate that the product is available
    if (!product.availability) {
      return res.status(400).json({ message: 'Product is not available for rent' });
    }

    // Validate that the user is not trying to rent their own product
    if (product.vendor._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot rent your own product' });
    }

    // Check for overlapping rental requests
    const overlappingRequests = await RentalRequest.find({
      product: productId,
      status: 'approved',
      $or: [
        {
          startDate: { $lte: endDate },
          endDate: { $gte: startDate }
        }
      ]
    });

    if (overlappingRequests.length > 0) {
      return res.status(400).json({ 
        message: 'Product is already booked for the selected dates',
        overlappingDates: overlappingRequests.map(r => ({
          start: r.startDate,
          end: r.endDate
        }))
      });
    }

    // Create rental request
    const rentalRequest = new RentalRequest({
      product: productId,
      renter: req.user._id,
      vendor: product.vendor._id,
      startDate,
      endDate,
      totalPrice,
      message: message || 'Rental request from customer',
      status: 'pending'
    });

    await rentalRequest.save();

    // Create notification for vendor
    await createNotification(
      product.vendor._id,
      'RENTAL_REQUEST',
      'New Rental Request',
      `You have a new rental request for ${product.name}`,
      { relatedRental: rentalRequest._id, relatedProduct: productId }
    );

    // Return the created request with populated fields
    const populatedRequest = await RentalRequest.findById(rentalRequest._id)
      .populate('product')
      .populate('vendor', 'name email')
      .populate('renter', 'name email');

    res.status(201).json(populatedRequest);
  } catch (error) {
    console.error('Error creating rental request:', error);
    res.status(400).json({ message: error.message });
  }
});

router.post('/:id/cancel', auth, async (req, res) => {
  try {
    const rentalRequest = await RentalRequest.findById(req.params.id)
      .populate('product');

    if (!rentalRequest) {
      return res.status(404).json({ message: 'Rental request not found' });
    }

    // Check if user is the renter
    if (rentalRequest.renter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Only allow cancellation of pending requests
    if (rentalRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Can only cancel pending requests' });
    }

    rentalRequest.status = 'cancelled';
    await rentalRequest.save();

    // Notify vendor about cancellation
    await createNotification(
      rentalRequest.vendor,
      'RENTAL_CANCELLED',
      'Rental Request Cancelled',
      `A rental request for ${rentalRequest.product.name} has been cancelled by the renter`,
      { relatedRental: rentalRequest._id, relatedProduct: rentalRequest.product._id }
    );

    res.json(rentalRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const rentalRequest = await RentalRequest.findById(req.params.id);
    
    if (!rentalRequest) {
      return res.status(404).json({ message: 'Rental request not found' });
    }

    // Check if user is authorized (must be the renter)
    if (rentalRequest.renter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this rental request' });
    }

    // Only allow deletion of completed, rejected, or cancelled requests
    if (!['completed', 'rejected', 'cancelled'].includes(rentalRequest.status)) {
      return res.status(400).json({ 
        message: 'Can only delete completed, rejected, or cancelled rental requests'
      });
    }

    await RentalRequest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Rental request deleted successfully' });
  } catch (error) {
    console.error('Error deleting rental request:', error);
    res.status(500).json({ message: 'Error deleting rental request' });
  }
});

// Vendor routes
router.get('/vendor/rental-requests', auth, checkRole('vendor'), async (req, res) => {
  console.log('Fetching vendor rental requests for user:', req.user._id);
  try {
    const rentalRequests = await RentalRequest.find({ vendor: req.user._id })
      .populate({
        path: 'product',
        populate: {
          path: 'vendor',
          select: 'name email'
        }
      })
      .populate('renter', 'name email')
      .sort({ createdAt: -1 });

    console.log('Found rental requests:', rentalRequests.length);

    // Format the response
    const formattedRequests = rentalRequests.map(request => {
      const formattedRequest = request.toObject();
      if (formattedRequest.renter) {
        formattedRequest.customer = {
          name: formattedRequest.renter.name,
          email: formattedRequest.renter.email
        };
      }
      return formattedRequest;
    });

    res.json(formattedRequests);
  } catch (error) {
    console.error('Error fetching rental requests:', error);
    res.status(500).json({ message: 'Error fetching rental requests' });
  }
});

router.put('/:id/status', auth, checkRole('vendor'), async (req, res) => {
  try {
    const { status } = req.body;
    console.log('Updating rental request status:', { id: req.params.id, status });
    
    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const rentalRequest = await RentalRequest.findById(req.params.id)
      .populate('product')
      .populate('renter');

    if (!rentalRequest) {
      return res.status(404).json({ message: 'Rental request not found' });
    }

    // Check if user is the vendor
    if (rentalRequest.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Validate status transition
    if (rentalRequest.status === 'completed' && status !== 'completed') {
      return res.status(400).json({ message: 'Cannot change status of completed request' });
    }

    if (rentalRequest.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot change status of cancelled request' });
    }

    if (rentalRequest.status === 'rejected' && status !== 'rejected') {
      return res.status(400).json({ message: 'Cannot change status of rejected request' });
    }

    // Update status
    rentalRequest.status = status;
    await rentalRequest.save();

    // Create notification for renter
    const notificationType = status === 'approved' ? 'RENTAL_APPROVED' : 
                           status === 'rejected' ? 'RENTAL_REJECTED' :
                           status === 'completed' ? 'RENTAL_COMPLETED' : 'RENTAL_STATUS_UPDATED';
                           
    const notificationTitle = status === 'approved' ? 'Rental Request Approved' :
                            status === 'rejected' ? 'Rental Request Rejected' :
                            status === 'completed' ? 'Rental Completed' : 'Rental Status Updated';
                            
    const notificationMessage = status === 'approved'
      ? `Your rental request for ${rentalRequest.product.name} has been approved`
      : status === 'rejected'
      ? `Your rental request for ${rentalRequest.product.name} has been rejected`
      : status === 'completed'
      ? `Your rental for ${rentalRequest.product.name} has been marked as completed`
      : `Your rental request for ${rentalRequest.product.name} status has been updated to ${status}`;

    await createNotification(
      rentalRequest.renter._id,
      notificationType,
      notificationTitle,
      notificationMessage,
      { relatedRental: rentalRequest._id, relatedProduct: rentalRequest.product._id }
    );

    // Return the updated request with populated fields
    const updatedRequest = await RentalRequest.findById(rentalRequest._id)
      .populate('product')
      .populate('vendor', 'name email')
      .populate('renter', 'name email');

    console.log('Updated rental request:', updatedRequest);
    res.json(updatedRequest);
  } catch (error) {
    console.error('Error updating rental request status:', error);
    res.status(500).json({ message: 'Error updating rental request status' });
  }
});

router.patch('/:id/status', auth, checkRole('vendor'), async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const rentalRequest = await RentalRequest.findById(req.params.id)
      .populate('product')
      .populate('renter');

    if (!rentalRequest) {
      return res.status(404).json({ message: 'Rental request not found' });
    }

    // Check if user is the vendor
    if (rentalRequest.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Validate status transition
    if (rentalRequest.status === 'completed' && status !== 'completed') {
      return res.status(400).json({ message: 'Cannot change status of completed request' });
    }

    if (rentalRequest.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot change status of cancelled request' });
    }

    if (rentalRequest.status === 'rejected' && status !== 'rejected') {
      return res.status(400).json({ message: 'Cannot change status of rejected request' });
    }

    // Update status
    rentalRequest.status = status;
    await rentalRequest.save();

    // Create notification for renter
    const notificationType = status === 'approved' ? 'RENTAL_APPROVED' : 
                           status === 'rejected' ? 'RENTAL_REJECTED' :
                           status === 'completed' ? 'RENTAL_COMPLETED' : 'RENTAL_STATUS_UPDATED';
                           
    const notificationTitle = status === 'approved' ? 'Rental Request Approved' :
                            status === 'rejected' ? 'Rental Request Rejected' :
                            status === 'completed' ? 'Rental Completed' : 'Rental Status Updated';
                            
    const notificationMessage = status === 'approved'
      ? `Your rental request for ${rentalRequest.product.name} has been approved`
      : status === 'rejected'
      ? `Your rental request for ${rentalRequest.product.name} has been rejected`
      : status === 'completed'
      ? `Your rental for ${rentalRequest.product.name} has been marked as completed`
      : `Your rental request for ${rentalRequest.product.name} status has been updated to ${status}`;

    await createNotification(
      rentalRequest.renter._id,
      notificationType,
      notificationTitle,
      notificationMessage,
      { relatedRental: rentalRequest._id, relatedProduct: rentalRequest.product._id }
    );

    // Return the updated request with populated fields
    const updatedRequest = await RentalRequest.findById(rentalRequest._id)
      .populate('product')
      .populate('vendor', 'name email')
      .populate('renter', 'name email');

    res.json(updatedRequest);
  } catch (error) {
    console.error('Error updating rental request status:', error);
    res.status(400).json({ message: error.message });
  }
});

// Shared routes
router.get('/:id', auth, async (req, res) => {
  try {
    const rentalRequest = await RentalRequest.findById(req.params.id)
      .populate('product')
      .populate('renter', 'name email')
      .populate('vendor', 'name email');

    if (!rentalRequest) {
      return res.status(404).json({ message: 'Rental request not found' });
    }

    // Check if user is authorized to view this request
    if (rentalRequest.renter._id.toString() !== req.user._id.toString() &&
        rentalRequest.vendor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(rentalRequest);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rental request' });
  }
});

module.exports = router;