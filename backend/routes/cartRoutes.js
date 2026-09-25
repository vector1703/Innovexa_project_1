const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

// Ensure all cart endpoints require authentication
router.use(protect);

// GET /api/cart - View cart contents
// POST /api/cart - Add item to cart
// DELETE /api/cart - Clear whole cart
router
  .route('/')
  .get(getCart)
  .post(addToCart)
  .delete(clearCart);

// POST /api/cart/items - Alias for adding item
router.post('/items', addToCart);

// PUT /api/cart/items/:itemId - Update item quantity
// DELETE /api/cart/items/:itemId - Remove item from cart
router
  .route('/items/:itemId')
  .put(updateCartItemQuantity)
  .delete(removeCartItem);

module.exports = router;
