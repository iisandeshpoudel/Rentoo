const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Public routes
router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);

// Vendor routes (protected)
router.post('/', auth, checkRole('vendor'), productController.createProduct);
router.get('/vendor', auth, checkRole('vendor'), productController.getVendorProducts);
router.patch('/:id', auth, checkRole('vendor'), productController.updateProduct);
router.delete('/:id', auth, checkRole('vendor'), productController.deleteProduct);

module.exports = router;