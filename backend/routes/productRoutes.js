const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  seedProducts
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * Product Catalog Routes
 * Base path: /api/products
 */

// @route   GET  /api/products        – Fetch all products (filtering, search, sort)
// @route   POST /api/products        – Create a new product (Admin only)
// @access  Public (GET) | Protected Admin (POST)
router
  .route('/')
  .get(getProducts)
  .post(protect, authorize('admin'), createProduct);

// @route   POST /api/products/seed   – Seed demo products (Admin only)
// IMPORTANT: Must be declared BEFORE /:id route to avoid 'seed' being
// matched as an ObjectId parameter.
// @access  Protected Admin
router.post('/seed', protect, authorize('admin'), seedProducts);

// @route   GET    /api/products/:id  – Fetch single product by ID
// @route   PUT    /api/products/:id  – Update product (Admin only)
// @route   DELETE /api/products/:id  – Delete product (Admin only)
// @access  Public (GET) | Protected Admin (PUT, DELETE)
router
  .route('/:id')
  .get(getProductById)
  .put(protect, authorize('admin'), updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

module.exports = router;
