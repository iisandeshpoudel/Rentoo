const express = require('express');
const router = express.Router();
const rentalRequestController = require('../controllers/rentalRequestController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const RentalRequest = require('../models/RentalRequest'); // Assuming RentalRequest model is defined in this file

// Customer routes
router.post('/rental-requests', auth, checkRole('customer'), rentalRequestController.createRentalRequest);
router.get('/customer/rental-requests', auth, async (req, res) => {
  try {
    const rentalRequests = await RentalRequest.find({ customer: req.user._id })
      .populate({
        path: 'product',
        populate: {
          path: 'vendor',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 });

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
router.post('/rental-requests/:id/cancel', auth, checkRole('customer'), rentalRequestController.cancelRequest);

// Vendor routes
router.get('/vendor/rental-requests', auth, checkRole('vendor'), rentalRequestController.getVendorRequests);
router.patch('/rental-requests/:id/status', auth, checkRole('vendor'), rentalRequestController.updateRequestStatus);

// Shared routes (both customer and vendor)
router.get('/rental-requests/:id', auth, rentalRequestController.getRequestDetails);

module.exports = router; 