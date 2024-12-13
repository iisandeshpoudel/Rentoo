const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Public routes
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProduct);

// Vendor routes (protected)
router.post('/products', auth, checkRole('vendor'), productController.createProduct);
router.get('/vendor/products', auth, checkRole('vendor'), productController.getVendorProducts);
router.patch('/products/:id', auth, checkRole('vendor'), productController.updateProduct);
router.delete('/products/:id', auth, checkRole('vendor'), productController.deleteProduct);

module.exports = router; 