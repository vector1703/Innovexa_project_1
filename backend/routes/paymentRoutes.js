const router = require("express").Router();
const { auth } = require("../middleware/auth");
router.post("/process", auth, (req, res) => {
  const { paymentMethod = "MockCard" } = req.body;
  res.json({
    status: "success",
    transactionId: "TXN_" + Date.now(),
    paymentMethod,
    message: "Payment processed successfully (demo)",
  });
});
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
