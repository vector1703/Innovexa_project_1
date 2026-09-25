const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  confirmPayment
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Ensure all payment operations require authentication
router.use(protect);

// POST /api/payments/create-intent - Initialize Stripe / Mock Payment Intent
router.post('/create-intent', createPaymentIntent);

// POST /api/payments/confirm - Confirm Payment and update order status
router.post('/confirm', confirmPayment);

module.exports = router;
