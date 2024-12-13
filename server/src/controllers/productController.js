const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const RentalRequest = require('../models/RentalRequest'); // Assuming RentalRequest model is defined in this file

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/products');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Clean the original filename
    const cleanFileName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${cleanFileName}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed!'));
    }
  }
}).array('images', 5); // Allow up to 5 images

// Helper function to get image URL
const getImageUrl = (filename) => {
  return `http://localhost:5000/uploads/products/${filename}`;
};

// Helper function to delete file
const deleteFile = async (filepath) => {
  try {
    await fs.unlink(filepath);
  } catch (error) {
    console.error(`Error deleting file ${filepath}:`, error);
  }
};

const validateProduct = (data) => {
  const errors = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (!data.description || data.description.trim().length === 0) {
    errors.push('Description is required');
  }

  if (!data.category || !['Electronics', 'Furniture', 'Tools', 'Sports', 'Others'].includes(data.category)) {
    errors.push('Valid category is required');
  }

  if (!data.dailyRate || data.dailyRate <= 0) {
    errors.push('Daily rate must be greater than 0');
  }

  if (!data.location || data.location.trim().length === 0) {
    errors.push('Location is required');
  }

  if (!data.condition || !['New', 'Like New', 'Good', 'Fair'].includes(data.condition)) {
    errors.push('Valid condition is required');
  }

  return errors;
};

// Create a new product
exports.createProduct = async (req, res) => {
  upload(req, res, async (err) => {
    try {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({ error: err.message });
      }

      console.log('Request body:', req.body);
      const productData = JSON.parse(req.body.productData || '{}');
      console.log('Parsed product data:', productData);

      const validationErrors = validateProduct(productData);
      if (validationErrors.length > 0) {
        // Delete uploaded files if validation fails
        if (req.files) {
          await Promise.all(req.files.map(file => deleteFile(file.path)));
        }
        return res.status(400).json({ error: validationErrors.join(', ') });
      }

      // Create image URLs
      const imageUrls = req.files ? req.files.map(file => getImageUrl(file.filename)) : [];

      if (imageUrls.length === 0) {
        return res.status(400).json({ error: 'At least one image is required' });
      }

      const product = new Product({
        ...productData,
        images: imageUrls,
        vendor: req.user._id
      });

      await product.save();
      await product.populate('vendor', 'name email');
      
      console.log('Created product:', {
        id: product._id,
        images: product.images
      });
      
      res.status(201).json(product);
    } catch (error) {
      console.error('Error in createProduct:', error);
      // Delete uploaded files if product creation fails
      if (req.files) {
        await Promise.all(req.files.map(file => deleteFile(file.path)));
      }
      res.status(400).json({ error: error.message });
    }
  });
};

// Get all products (with filters)
exports.getProducts = async (req, res) => {
  try {
    const { category, available, search, minPrice, maxPrice } = req.query;
    const filter = {};
    
    if (category) filter.category = category;
    if (available) filter.availability = available === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (minPrice || maxPrice) {
      filter.dailyRate = {};
      if (minPrice) filter.dailyRate.$gte = parseFloat(minPrice);
      if (maxPrice) filter.dailyRate.$lte = parseFloat(maxPrice);
    }

    const products = await Product.find(filter)
      .populate('vendor', 'name email')
      .sort({ createdAt: -1 });
      
    console.log('Found products:', products.length);
    res.json(products);
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get vendor's products
exports.getVendorProducts = async (req, res) => {
  try {
    const products = await Product.find({ vendor: req.user._id })
      .sort({ createdAt: -1 });
    console.log('Found vendor products:', products.length);
    res.json(products);
  } catch (error) {
    console.error('Error getting vendor products:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get single product
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('vendor', 'name email');
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    console.log('Found product:', {
      id: product._id,
      images: product.images
    });
    res.json(product);
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  upload(req, res, async (err) => {
    try {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({ error: err.message });
      }

      console.log('Update request body:', req.body);
      const productData = JSON.parse(req.body.productData || '{}');
      console.log('Parsed update data:', productData);

      const validationErrors = validateProduct(productData);
      if (validationErrors.length > 0) {
        if (req.files) {
          await Promise.all(req.files.map(file => deleteFile(file.path)));
        }
        return res.status(400).json({ error: validationErrors.join(', ') });
      }

      const product = await Product.findOne({
        _id: req.params.id,
        vendor: req.user._id
      });

      if (!product) {
        if (req.files) {
          await Promise.all(req.files.map(file => deleteFile(file.path)));
        }
        return res.status(404).json({ error: 'Product not found' });
      }

      // Handle image updates
      if (req.files && req.files.length > 0) {
        // Delete old images
        const oldImageUrls = product.images;
        const oldFilePaths = oldImageUrls.map(url => {
          const filename = url.split('/').pop();
          return path.join(__dirname, '../../uploads/products', filename);
        });
        
        await Promise.all(oldFilePaths.map(filepath => deleteFile(filepath)));

        // Add new images
        productData.images = req.files.map(file => getImageUrl(file.filename));
      }

      Object.assign(product, productData);
      await product.save();
      await product.populate('vendor', 'name email');
      
      console.log('Updated product:', {
        id: product._id,
        images: product.images
      });
      
      res.json(product);
    } catch (error) {
      console.error('Error in updateProduct:', error);
      if (req.files) {
        await Promise.all(req.files.map(file => deleteFile(file.path)));
      }
      res.status(400).json({ error: error.message });
    }
  });
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the product first to get its images
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Ensure the user is the vendor of the product
    if (product.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this product' });
    }

    // Find any active rental requests for this product
    const activeRequests = await RentalRequest.find({
      product: id,
      status: { $in: ['pending', 'approved'] }
    });

    if (activeRequests.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete product with active rental requests. Please complete or cancel all active rentals first.'
      });
    }

    // Update all completed/cancelled rental requests to mark the product as deleted
    await RentalRequest.updateMany(
      { 
        product: id,
        status: { $in: ['completed', 'cancelled', 'rejected'] }
      },
      {
        $set: {
          productDeleted: true,
          productDeletedAt: new Date(),
          productSnapshot: {
            name: product.name,
            description: product.description,
            category: product.category,
            dailyRate: product.dailyRate,
            deletedBy: req.user._id
          }
        }
      }
    );

    // Delete the product
    await Product.findByIdAndDelete(id);

    // Delete associated images
    if (product.images && product.images.length > 0) {
      await Promise.all(product.images.map(async (image) => {
        const imagePath = path.join(__dirname, '../../uploads/products', image.split('/').pop());
        await deleteFile(imagePath);
      }));
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: error.message });
  }
};