const mongoose = require('mongoose');

const rentalRequestSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  renter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  message: {
    type: String,
    trim: true
  },
  paid: {
    type: Boolean,
    default: false
  },
  paidAt: {
    type: Date
  },
  returned: {
    type: Boolean,
    default: false
  },
  returnedAt: {
    type: Date
  },
  productDeleted: {
    type: Boolean,
    default: false
  },
  productDeletedAt: {
    type: Date
  },
  productSnapshot: {
    name: String,
    description: String,
    category: String,
    dailyRate: Number,
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, {
  timestamps: true
});

// Index for faster queries
rentalRequestSchema.index({ renter: 1, status: 1 });
rentalRequestSchema.index({ vendor: 1, status: 1 });
rentalRequestSchema.index({ product: 1 });
rentalRequestSchema.index({ paid: 1, returned: 1 });

const RentalRequest = mongoose.model('RentalRequest', rentalRequestSchema);

module.exports = RentalRequest;