const mongoose = require('mongoose');
const Cart = require('../models/Cart.model');
const Product = require('../models/Product.model');

/**
 * @desc    View current authenticated user's cart
 * @route   GET /api/cart
 * @access  Private
 */
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name price category images stock isAvailable'
    });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: []
      });
    }

    // Calculate live subtotal and totals
    const subtotal = cart.items.reduce((acc, item) => {
      const price = (item.product && item.product.price) || item.price || 0;
      return acc + price * item.quantity;
    }, 0);

    const totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);

    return res.status(200).json({
      success: true,
      data: cart,
      meta: {
        totalItems,
        subtotal: Number(subtotal.toFixed(2))
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve shopping cart',
      error: error.message
    });
  }
};

/**
 * @desc    Add item to user's cart
 * @route   POST /api/cart (or POST /api/cart/items)
 * @access  Private
 */
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, size = 'Free Size', color = 'Default' } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Product ID format'
      });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive integer greater than or equal to 1'
      });
    }

    // Verify product exists and check stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!product.isAvailable || product.stock < qty) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${product.stock} items available.`
      });
    }

    // Find or initialize cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: []
      });
    }

    // Check if matching item (same product ID, size, and color) already exists in cart
    const existingIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.size.toLowerCase() === size.trim().toLowerCase() &&
        item.color.toLowerCase() === color.trim().toLowerCase()
    );

    if (existingIndex > -1) {
      const newTotalQuantity = cart.items[existingIndex].quantity + qty;
      if (newTotalQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add ${qty} more. You already have ${cart.items[existingIndex].quantity} in cart and available stock is ${product.stock}.`
        });
      }
      cart.items[existingIndex].quantity = newTotalQuantity;
      cart.items[existingIndex].price = product.price;
    } else {
      cart.items.push({
        product: product._id,
        quantity: qty,
        size: size.trim(),
        color: color.trim(),
        price: product.price
      });
    }

    await cart.save();

    // Populate product details for response
    await cart.populate({
      path: 'items.product',
      select: 'name price category images stock isAvailable'
    });

    return res.status(200).json({
      success: true,
      message: 'Item added to cart successfully',
      data: cart
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: error.message
    });
  }
};

/**
 * @desc    Update quantity of a specific cart item
 * @route   PUT /api/cart/items/:itemId
 * @access  Private
 */
const updateCartItemQuantity = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || quantity === null) {
      return res.status(400).json({
        success: false,
        message: 'Quantity is required'
      });
    }

    const newQty = parseInt(quantity, 10);
    if (isNaN(newQty) || newQty < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a non-negative integer'
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Locate item by item _id or product ID
    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId || item.product.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    // If new quantity is 0, remove item from cart
    if (newQty === 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      // Validate available stock against Product model
      const product = await Product.findById(cart.items[itemIndex].product);
      if (product && newQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot update quantity to ${newQty}. Available stock is only ${product.stock}.`
        });
      }

      cart.items[itemIndex].quantity = newQty;
      if (product) {
        cart.items[itemIndex].price = product.price;
      }
    }

    await cart.save();

    await cart.populate({
      path: 'items.product',
      select: 'name price category images stock isAvailable'
    });

    return res.status(200).json({
      success: true,
      message: newQty === 0 ? 'Item removed from cart' : 'Cart item quantity updated',
      data: cart
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update cart item',
      error: error.message
    });
  }
};

/**
 * @desc    Remove an item from user's cart
 * @route   DELETE /api/cart/items/:itemId
 * @access  Private
 */
const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      (item) => item._id.toString() !== itemId && item.product.toString() !== itemId
    );

    if (cart.items.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    await cart.save();

    await cart.populate({
      path: 'items.product',
      select: 'name price category images stock isAvailable'
    });

    return res.status(200).json({
      success: true,
      message: 'Item removed from cart successfully',
      data: cart
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart',
      error: error.message
    });
  }
};

/**
 * @desc    Clear entire cart
 * @route   DELETE /api/cart
 * @access  Private
 */
const clearCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    } else {
      cart.items = [];
    }

    await cart.save();

    return res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      data: cart
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error.message
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart
};
