const express = require('express');
const router = express.Router();
const { protect, isVendor } = require('../middleware/auth');
const {
    createProduct,
    getProducts,
    getProduct,
    getVendorProducts,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);

// Vendor routes (protected)
router.post('/', protect, isVendor, createProduct);
router.get('/vendor/products', protect, isVendor, getVendorProducts);
router.put('/:id', protect, isVendor, updateProduct);
router.delete('/:id', protect, isVendor, deleteProduct);

module.exports = router;