const express = require('express');
const router = express.Router();
const rentalRequestController = require('../controllers/rentalRequestController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Customer routes
router.post('/rental-requests', auth, checkRole('customer'), rentalRequestController.createRentalRequest);
router.get('/customer/rental-requests', auth, checkRole('customer'), rentalRequestController.getCustomerRequests);
router.post('/rental-requests/:id/cancel', auth, checkRole('customer'), rentalRequestController.cancelRequest);

// Vendor routes
router.get('/vendor/rental-requests', auth, checkRole('vendor'), rentalRequestController.getVendorRequests);
router.patch('/rental-requests/:id/status', auth, checkRole('vendor'), rentalRequestController.updateRequestStatus);

// Shared routes (both customer and vendor)
router.get('/rental-requests/:id', auth, rentalRequestController.getRequestDetails);

module.exports = router; 