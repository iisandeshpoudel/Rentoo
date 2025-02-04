const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Review = require('../models/Review');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Format review response
const formatReview = (review) => ({
    _id: review._id,
    rating: review.rating,
    comment: review.comment,
    user: {
        _id: review.user._id.toString(),
        id: review.user._id.toString(), 
        name: review.user.name
    },
    createdAt: review.createdAt
});

// Get reviews for a product
router.get('/product/:productId', protect, async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.productId })
            .populate('user', 'name')
            .sort({ createdAt: -1 });

        const formattedReviews = reviews.map(formatReview);

        const stats = {
            totalReviews: reviews.length,
            averageRating: reviews.reduce((acc, review) => acc + review.rating, 0) / (reviews.length || 1)
        };

        res.json({ reviews: formattedReviews, stats });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews' });
    }
});

// Create a review
router.post('/', protect, async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;

        // Check if user has already reviewed this product
        const existingReview = await Review.findOne({
            product: productId,
            user: req.user._id
        });

        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this product' });
        }

        const review = await Review.create({
            product: productId,
            user: req.user._id,
            rating,
            comment
        });

        const populatedReview = await Review.findById(review._id).populate('user', 'name');
        const formattedReview = formatReview(populatedReview);

        // Get updated stats
        const reviews = await Review.find({ product: productId });
        const stats = {
            totalReviews: reviews.length,
            averageRating: reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
        };

        res.status(201).json({ review: formattedReview, stats });
    } catch (error) {
        res.status(500).json({ message: 'Error creating review' });
    }
});

// Update a review
router.put('/:id', protect, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if user owns the review
        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this review' });
        }

        const { rating, comment } = req.body;
        review.rating = rating;
        review.comment = comment;
        await review.save();

        const populatedReview = await Review.findById(review._id).populate('user', 'name');
        const formattedReview = formatReview(populatedReview);

        // Get updated stats
        const reviews = await Review.find({ product: review.product });
        const stats = {
            totalReviews: reviews.length,
            averageRating: reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
        };

        res.json({ review: formattedReview, stats });
    } catch (error) {
        res.status(500).json({ message: 'Error updating review' });
    }
});

// Delete a review
router.delete('/:id', protect, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if user owns the review
        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this review' });
        }

        await review.deleteOne();

        // Get updated stats
        const reviews = await Review.find({ product: review.product });
        const stats = {
            totalReviews: reviews.length,
            averageRating: reviews.length > 0 
                ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length 
                : 0
        };

        res.json({ message: 'Review deleted successfully', stats });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting review' });
    }
});

module.exports = router;
