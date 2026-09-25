const mongoose = require('mongoose');
const Order = require('../models/Order.model');
const Cart = require('../models/Cart.model');
const Product = require('../models/Product.model');

/**
 * @desc    Convert user's cart into an order (Checkout)
 * @route   POST /api/orders
 * @access  Private
 */
const createOrderFromCart = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod = 'stripe' } = req.body;

    // Validate shipping address presence
    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required to place an order'
      });
    }

    const { fullName, addressLine1, city, state, postalCode, country } = shippingAddress;
    if (!fullName || !addressLine1 || !city || !state || !postalCode || !country) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required shipping fields: fullName, addressLine1, city, state, postalCode, country'
      });
    }

    // Retrieve user's cart and populate current product data
    const cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name price stock isAvailable images'
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create order: Your cart is empty'
      });
    }

    // Validate product availability and snapshot line items
    const orderItems = [];
    let calculatedTotal = 0;

    for (const item of cart.items) {
      const product = item.product;

      if (!product) {
        return res.status(400).json({
          success: false,
          message: 'An item in your cart is no longer available. Please review your cart.'
        });
      }

      if (!product.isAvailable || product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product '${product.name}'. Available: ${product.stock}, in cart: ${item.quantity}.`
        });
      }

      const unitPrice = product.price;
      calculatedTotal += unitPrice * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: unitPrice,
        size: item.size || 'Free Size',
        color: item.color || 'Default',
        image: (product.images && product.images[0]) || ''
      });
    }

    // Create the order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount: Number(calculatedTotal.toFixed(2)),
      shippingAddress: {
        fullName: fullName.trim(),
        addressLine1: addressLine1.trim(),
        addressLine2: shippingAddress.addressLine2 ? shippingAddress.addressLine2.trim() : '',
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
        country: country.trim(),
        phone: shippingAddress.phone ? shippingAddress.phone.trim() : ''
      },
      paymentStatus: 'pending',
      fulfillmentStatus: 'processing',
      paymentDetails: {
        paymentMethod
      }
    });

    // Deduct purchased quantity from product stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear user's cart after successful checkout
    cart.items = [];
    await cart.save();

    return res.status(201).json({
      success: true,
      message: 'Order created successfully from cart',
      data: order
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

/**
 * @desc    Retrieve order history for the authenticated user
 * @route   GET /api/orders
 * @access  Private
 */
const getUserOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const query = { user: req.user._id };

    // Filter by paymentStatus or fulfillmentStatus if provided in query
    if (req.query.paymentStatus) {
      query.paymentStatus = req.query.paymentStatus;
    }
    if (req.query.fulfillmentStatus) {
      query.fulfillmentStatus = req.query.fulfillmentStatus;
    }

    const totalOrders = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('items.product', 'name images category');

    return res.status(200).json({
      success: true,
      count: orders.length,
      pagination: {
        totalOrders,
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit)
      },
      data: orders
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user order history',
      error: error.message
    });
  }
};

/**
 * @desc    Get single order details by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Order ID format'
      });
    }

    const order = await Order.findById(id).populate('items.product', 'name images category');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify ownership (unless admin)
    const isOwner = order.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    return res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve order',
      error: error.message
    });
  }
};

/**
 * @desc    Update order fulfillment and/or payment status (Admin or internal hook)
 * @route   PATCH /api/orders/:id/status
 * @access  Private
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { fulfillmentStatus, paymentStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Order ID format'
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (fulfillmentStatus) {
      const allowedFulfillment = ['processing', 'shipped', 'delivered'];
      if (!allowedFulfillment.includes(fulfillmentStatus)) {
        return res.status(400).json({
          success: false,
          message: `Invalid fulfillment status. Allowed: ${allowedFulfillment.join(', ')}`
        });
      }
      order.fulfillmentStatus = fulfillmentStatus;
    }

    if (paymentStatus) {
      const allowedPayment = ['pending', 'completed', 'failed'];
      if (!allowedPayment.includes(paymentStatus)) {
        return res.status(400).json({
          success: false,
          message: `Invalid payment status. Allowed: ${allowedPayment.join(', ')}`
        });
      }
      order.paymentStatus = paymentStatus;
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

module.exports = {
  createOrderFromCart,
  getUserOrders,
  getOrderById,
  updateOrderStatus
};
