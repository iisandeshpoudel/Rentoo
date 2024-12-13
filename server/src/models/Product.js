const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Electronics', 'Furniture', 'Tools', 'Sports', 'Others']
  },
  dailyRate: {
    type: Number,
    required: true,
    min: 0
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  images: [{
    type: String, // URLs to images
    required: true
  }],
  availability: {
    type: Boolean,
    default: true
  },
  location: {
    type: String,
    required: true
  },
  condition: {
    type: String,
    required: true,
    enum: ['New', 'Like New', 'Good', 'Fair']
  },
  contactDetails: {
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    preferredMethod: {
      type: String,
      enum: ['phone', 'email', 'both'],
      default: 'both'
    }
  }
}, {
  timestamps: true
});

// Index for faster queries
productSchema.index({ category: 1, availability: 1 });
productSchema.index({ vendor: 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;