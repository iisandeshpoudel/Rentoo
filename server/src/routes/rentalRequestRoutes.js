const express = require('express');
const router = express.Router();
const { protect, isVendor } = require('../middleware/auth');
const RentalRequest = require('../models/RentalRequest');
const Product = require('../models/Product');
const { createNotification } = require('../utils/notificationUtils');

// Debug route to verify the router is working
router.get('/test', (req, res) => {
    res.json({ message: 'Rental request routes are working' });
});

// Get customer's rental requests
router.get('/customer', protect, async (req, res) => {
    try {
        const requests = await RentalRequest.find({ renter: req.user._id })
            .populate('product', 'name images pricePerDay')
            .populate('vendor', 'name email')
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (error) {
        console.error('Get customer requests error:', error);
        res.status(500).json({ message: 'Error getting rental requests' });
    }
});

// Create a new rental request
router.post('/', protect, async (req, res) => {
    try {
        const { productId, startDate, endDate, message } = req.body;

        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        const now = new Date();

        if (start < now) {
            return res.status(400).json({ message: 'Start date must be in the future' });
        }

        if (end <= start) {
            return res.status(400).json({ message: 'End date must be after start date' });
        }

        // Get product details
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if user is trying to rent their own product
        if (product.vendor.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'You cannot rent your own product' });
        }

        // Calculate total price
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        const totalPrice = days * product.pricePerDay;

        // Create rental request
        const rentalRequest = new RentalRequest({
            product: productId,
            renter: req.user._id,
            vendor: product.vendor,
            startDate: start,
            endDate: end,
            totalPrice,
            message: message?.trim()
        });

        await rentalRequest.save();

        // Send notification to vendor
        await createNotification({
            recipient: product.vendor,
            type: 'NEW_RENTAL_REQUEST',
            message: `New rental request for ${product.name}`,
            data: {
                rentalRequestId: rentalRequest._id,
                productId: product._id,
                productName: product.name
            }
        });

        // Populate product and user details
        await rentalRequest.populate([
            { path: 'product', select: 'name images pricePerDay' },
            { path: 'renter', select: 'name email' },
            { path: 'vendor', select: 'name email' }
        ]);

        res.status(201).json(rentalRequest);
    } catch (error) {
        console.error('Create rental request error:', error);
        res.status(500).json({ message: 'Error creating rental request' });
    }
});

// Get vendor's rental requests
router.get('/vendor', protect, isVendor, async (req, res) => {
    try {
        const requests = await RentalRequest.find({ vendor: req.user._id })
            .populate('product', 'name images pricePerDay')
            .populate('renter', 'name email')
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (error) {
        console.error('Get vendor requests error:', error);
        res.status(500).json({ message: 'Error getting rental requests' });
    }
});

// Get rental request details
router.get('/:id', protect, async (req, res) => {
    try {
        const request = await RentalRequest.findById(req.params.id)
            .populate('product', 'name images pricePerDay')
            .populate('renter', 'name email')
            .populate('vendor', 'name email');

        if (!request) {
            return res.status(404).json({ message: 'Rental request not found' });
        }

        // Check if user is authorized to view this request
        if (request.renter._id.toString() !== req.user._id.toString() && 
            request.vendor._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to view this request' });
        }

        res.json(request);
    } catch (error) {
        console.error('Get request details error:', error);
        res.status(500).json({ message: 'Error getting rental request details' });
    }
});

// Update rental request status (vendor only)
router.put('/:id/status', protect, isVendor, async (req, res) => {
    try {
        const { status } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const request = await RentalRequest.findById(req.params.id)
            .populate('product', 'name vendor')
            .populate('renter', 'name email');

        if (!request) {
            return res.status(404).json({ message: 'Rental request not found' });
        }

        // Check if user is the vendor
        if (request.vendor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this request' });
        }

        // Check if request can be updated
        if (request.status !== 'pending') {
            return res.status(400).json({ message: `Cannot update request that is ${request.status}` });
        }

        request.status = status;
        await request.save();

        // Send notification to renter
        await createNotification({
            recipient: request.renter._id,
            type: 'RENTAL_REQUEST_STATUS_UPDATED',
            message: `Your rental request for ${request.product.name} has been ${status}`,
            data: {
                rentalRequestId: request._id,
                productId: request.product._id,
                productName: request.product.name,
                status
            }
        });

        res.json(request);
    } catch (error) {
        console.error('Update request status error:', error);
        res.status(500).json({ message: 'Error updating rental request status' });
    }
});

// Cancel rental request (customer only)
router.post('/:id/cancel', protect, async (req, res) => {
    try {
        const request = await RentalRequest.findById(req.params.id)
            .populate('product', 'name vendor')
            .populate('vendor', 'name email');

        if (!request) {
            return res.status(404).json({ message: 'Rental request not found' });
        }

        // Check if user is the renter
        if (request.renter.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to cancel this request' });
        }

        // Check if request can be cancelled
        if (!['pending', 'approved'].includes(request.status)) {
            return res.status(400).json({ message: `Cannot cancel request that is ${request.status}` });
        }

        request.status = 'cancelled';
        await request.save();

        // Send notification to vendor
        await createNotification({
            recipient: request.vendor._id,
            type: 'RENTAL_REQUEST_CANCELLED',
            message: `Rental request for ${request.product.name} has been cancelled`,
            data: {
                rentalRequestId: request._id,
                productId: request.product._id,
                productName: request.product.name
            }
        });

        res.json(request);
    } catch (error) {
        console.error('Cancel request error:', error);
        res.status(500).json({ message: 'Error cancelling rental request' });
    }
});

module.exports = router;