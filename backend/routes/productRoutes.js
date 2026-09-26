const express = require("express");
const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { auth, admin } = require("../middleware/auth");

/**
 * Product Catalog Routes
 * Base path: /api/products
 */

// @route   GET /api/products
// @desc    Fetch all products with optional category query filter (?category=dresses)
// @access  Public
router.get("/", getProducts);

// @route   GET /api/products/:id
// @desc    Fetch a single product by MongoDB ObjectId
// @access  Public
router.get("/:id", getProductById);

// @route   POST /api/products
// @desc    Create a new fashion product
// @access  Protected (Admin only)
router.post("/", auth, admin, createProduct);

// @route   PUT /api/products/:id
// @desc    Update an existing fashion product
// @access  Protected (Admin only)
router.put("/:id", auth, admin, updateProduct);

// @route   DELETE /api/products/:id
// @desc    Delete a fashion product
// @access  Protected (Admin only)
router.delete("/:id", auth, admin, deleteProduct);
  seedProducts
} = require('../controllers/productController');

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/seed', seedProducts);

module.exports = router;
