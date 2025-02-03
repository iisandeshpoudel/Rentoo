const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

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
    
    res.json({
      reviews,
      stats: product.reviewStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a review
router.post('/', auth, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({
      product: productId,
      user: req.user._id || req.user.id
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = new Review({
      product: productId,
      user: req.user._id || req.user.id,
      rating,
      comment
    });

    await review.save();
    const stats = await updateProductReviewStats(productId);

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name')
      .lean();

    res.status(201).json({
      review: populatedReview,
      stats
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Edit a review
router.put('/:reviewId', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this review' });
    }

    review.rating = rating;
    review.comment = comment;
    await review.save();

    const stats = await updateProductReviewStats(review.product);
    const updatedReview = await Review.findById(review._id)
      .populate('user', 'name')
      .lean();

    res.json({
      review: updatedReview,
      stats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a review
router.delete('/:reviewId', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    const productId = review.product;
    await Review.deleteOne({ _id: req.params.reviewId });
    const stats = await updateProductReviewStats(productId);

    res.json({
      message: 'Review deleted successfully',
      stats
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
