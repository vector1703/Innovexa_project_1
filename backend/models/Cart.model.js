const mongoose = require('mongoose');

/**
 * Item sub-schema within a User Cart.
 * Tailored for a women's fashion store with size and color variants.
 */
const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      default: 1
    },
    size: {
      type: String,
      trim: true,
      default: 'Free Size'
    },
    color: {
      type: String,
      trim: true,
      default: 'Default'
    },
    price: {
      type: Number,
      min: [0, 'Price cannot be negative']
    }
  },
  { _id: true }
);

/**
 * Cart Schema linking an authenticated User to an array of items.
 */
const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
      index: true
    },
    items: [cartItemSchema]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual calculation for total price of all items in cart
cartSchema.virtual('totalAmount').get(function () {
  if (!this.items || this.items.length === 0) return 0;
  return Number(
    this.items
      .reduce((sum, item) => {
        const itemPrice = item.price || (item.product && item.product.price) || 0;
        return sum + itemPrice * item.quantity;
      }, 0)
      .toFixed(2)
  );
});

// Virtual calculation for total quantity of items in cart
cartSchema.virtual('totalItems').get(function () {
  if (!this.items) return 0;
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

module.exports = mongoose.model('Cart', cartSchema);
