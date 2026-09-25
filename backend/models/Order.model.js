const mongoose = require('mongoose');

/**
 * Ordered item sub-schema capturing a snapshot of the purchased item.
 */
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required']
    },
    name: {
      type: String,
      required: [true, 'Product name snapshot is required'],
      trim: true
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    price: {
      type: Number,
      required: [true, 'Unit price snapshot is required'],
      min: [0, 'Price cannot be negative']
    },
    size: {
      type: String,
      trim: true
    },
    color: {
      type: String,
      trim: true
    },
    image: {
      type: String,
      trim: true
    }
  },
  { _id: true }
);

/**
 * Shipping Address sub-schema.
 */
const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    addressLine1: {
      type: String,
      required: [true, 'Address line 1 is required'],
      trim: true
    },
    addressLine2: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State / Province is required'],
      trim: true
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required'],
      trim: true
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      default: 'USA'
    },
    phone: {
      type: String,
      trim: true
    }
  },
  { _id: false }
);

/**
 * Order Schema recording checkouts.
 */
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true
    },
    items: {
      type: [orderItemSchema],
      required: [true, 'Ordered items are required'],
      validate: {
        validator: function (items) {
          return Array.isArray(items) && items.length > 0;
        },
        message: 'An order must contain at least one item'
      }
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative']
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: [true, 'Shipping address is required']
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ['pending', 'completed', 'failed'],
        message: '{VALUE} is not a valid payment status'
      },
      default: 'pending',
      index: true
    },
    fulfillmentStatus: {
      type: String,
      enum: {
        values: ['processing', 'shipped', 'delivered'],
        message: '{VALUE} is not a valid fulfillment status'
      },
      default: 'processing',
      index: true
    },
    paymentDetails: {
      paymentMethod: {
        type: String,
        default: 'stripe'
      },
      paymentIntentId: {
        type: String,
        trim: true
      },
      clientSecret: {
        type: String,
        trim: true
      },
      paidAt: {
        type: Date
      }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Order', orderSchema);
