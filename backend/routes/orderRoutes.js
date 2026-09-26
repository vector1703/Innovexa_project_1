const router = require("express").Router();
const c = require("../controllers/orderController");
const { auth } = require("../middleware/auth");
router.use(auth);
router.post("/", c.createOrder);
router.get("/", c.myOrders);
router.get("/:id", c.getOrder);
const express = require('express');
const router = express.Router();
const {
  createOrderFromCart,
  getUserOrders,
  getOrderById,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// Ensure all order endpoints require authentication
router.use(protect);

// POST /api/orders - Convert cart into order (Checkout)
// GET /api/orders - Retrieve order history for current user
router
  .route('/')
  .post(createOrderFromCart)
  .get(getUserOrders);

// GET /api/orders/:id - Retrieve order details
router.route('/:id').get(getOrderById);

// PATCH /api/orders/:id/status - Update fulfillment or payment status
router.route('/:id/status').patch(updateOrderStatus);

module.exports = router;
