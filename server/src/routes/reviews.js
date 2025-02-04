const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Review = require('../models/Review');
const Product = require('../models/Product');

// Helper function to update product review stats
async function updateProductReviewStats(productId) {
  const reviews = await Review.find({ product: productId });
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews
    : 0;

  await Product.findByIdAndUpdate(productId, {
    'reviewStats.totalReviews': totalReviews,
    'reviewStats.averageRating': Number(averageRating.toFixed(1))
  });

  return { totalReviews, averageRating: Number(averageRating.toFixed(1)) };
}

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    const product = await Product.findById(productId).select('reviewStats');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      reviews,
      stats: product.reviewStats
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Error getting reviews' });
  }
});

// Add a review
router.post('/', protect, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({
      product: productId,
      user: req.user._id
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = new Review({
      product: productId,
      user: req.user._id,
      rating,
      comment: comment?.trim()
    });

    await review.save();
    const stats = await updateProductReviewStats(productId);

    await review.populate('user', 'name');

    res.status(201).json({
      review,
      stats
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Error creating review' });
  }
});

// Edit a review
router.put('/:reviewId', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    // Validate rating
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const review = await Review.findById(req.params.reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this review' });
    }

    if (rating) review.rating = rating;
    if (comment !== undefined) review.comment = comment.trim();
    await review.save();

    const stats = await updateProductReviewStats(review.product);

    await review.populate('user', 'name');

    res.json({
      review,
      stats
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Error updating review' });
  }
});

// Delete a review
router.delete('/:reviewId', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    const productId = review.product;
    await review.deleteOne();

    const stats = await updateProductReviewStats(productId);

    res.json({
      message: 'Review deleted successfully',
      stats
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Error deleting review' });
  }
});

module.exports = router;
