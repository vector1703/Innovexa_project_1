const mongoose = require('mongoose');
const Order = require('../models/Order.model');

// Lazy-load Stripe if STRIPE_SECRET_KEY is provided
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  try {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  } catch {
    // Stripe library not installed, mock mode will handle requests
  }
}

/**
 * @desc    Initialize a Payment Intent (Stripe-ready with Mock fallback)
 * @route   POST /api/payments/create-intent
 * @access  Private
 */
const createPaymentIntent = async (req, res) => {
  try {
    const { orderId, amount, currency = 'usd' } = req.body;

    let targetAmount = 0;
    let order = null;

    if (orderId) {
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Order ID format'
        });
      }

      order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Check ownership
      if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to pay for this order'
        });
      }

      if (order.paymentStatus === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Order has already been paid for'
        });
      }

      targetAmount = order.totalAmount;
    } else if (amount) {
      targetAmount = parseFloat(amount);
      if (isNaN(targetAmount) || targetAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be a positive number'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either orderId or amount is required to create a payment intent'
      });
    }

    const amountInCents = Math.round(targetAmount * 100);

    // 1. Live Stripe Flow if Stripe SDK is available and configured
    if (stripe && process.env.STRIPE_SECRET_KEY) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: currency.toLowerCase(),
        metadata: {
          orderId: order ? order._id.toString() : 'standalone',
          userId: req.user._id.toString()
        }
      });

      if (order) {
        order.paymentDetails.paymentIntentId = paymentIntent.id;
        order.paymentDetails.clientSecret = paymentIntent.client_secret;
        await order.save();
      }

      return res.status(200).json({
        success: true,
        provider: 'stripe',
        data: {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          amount: targetAmount,
          currency: currency.toLowerCase(),
          orderId: order ? order._id : null
        }
      });
    }

    // 2. Stripe-compatible Mock Flow (Ideal for development and testing without real card credentials)
    const mockIntentId = `pi_mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const mockClientSecret = `${mockIntentId}_secret_${Math.random().toString(36).substring(2, 12)}`;

    if (order) {
      order.paymentDetails.paymentIntentId = mockIntentId;
      order.paymentDetails.clientSecret = mockClientSecret;
      await order.save();
    }

    return res.status(200).json({
      success: true,
      provider: 'mock-stripe',
      message: 'Mock payment intent created. Ready for confirmation.',
      data: {
        clientSecret: mockClientSecret,
        paymentIntentId: mockIntentId,
        amount: targetAmount,
        currency: currency.toLowerCase(),
        orderId: order ? order._id : null
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: error.message
    });
  }
};

/**
 * @desc    Confirm Payment Intent and update order payment status
 * @route   POST /api/payments/confirm
 * @access  Private
 */
const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, orderId, mockStatus = 'succeeded' } = req.body;

    if (!paymentIntentId && !orderId) {
      return res.status(400).json({
        success: false,
        message: 'paymentIntentId or orderId is required to confirm payment'
      });
    }

    let order = null;
    if (orderId) {
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Order ID format'
        });
      }
      order = await Order.findById(orderId);
    } else if (paymentIntentId) {
      order = await Order.findOne({ 'paymentDetails.paymentIntentId': paymentIntentId });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Associated order not found'
      });
    }

    // Check ownership
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to confirm payment for this order'
      });
    }

    // If order is already completed
    if (order.paymentStatus === 'completed') {
      return res.status(200).json({
        success: true,
        message: 'Order payment was already completed',
        data: order
      });
    }

    let paymentSuccessful = false;

    // Verify through Live Stripe if available
    if (stripe && paymentIntentId && !paymentIntentId.startsWith('pi_mock_')) {
      const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
      paymentSuccessful = intent.status === 'succeeded';
    } else {
      // Mock confirmation logic: simulates successful charge unless explicit mock failure passed
      paymentSuccessful = mockStatus !== 'failed';
    }

    if (paymentSuccessful) {
      order.paymentStatus = 'completed';
      order.paymentDetails.paidAt = new Date();
      if (paymentIntentId) {
        order.paymentDetails.paymentIntentId = paymentIntentId;
      }
      order.paymentDetails.paymentMethod = 'card';

      await order.save();

      return res.status(200).json({
        success: true,
        message: 'Payment verified and order marked as completed',
        data: order
      });
    } else {
      order.paymentStatus = 'failed';
      await order.save();

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        data: order
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to confirm payment',
      error: error.message
    });
  }
};

module.exports = {
  createPaymentIntent,
  confirmPayment
};
