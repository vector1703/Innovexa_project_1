const mongoose = require('mongoose');

/**
 * Product Schema tailored for Women's Fashion Store.
 * Supports apparel categories, size ranges (XS, S, M, L, XL), colors, and stock.
 */
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Dresses', 'Tops & Blouses', 'Skirts', 'Pants & Trousers', 'Ethnic Wear', 'Outerwear', 'Accessories'],
      default: 'Dresses'
    },
    sizes: {
      type: [String],
      default: ['XS', 'S', 'M', 'L', 'XL']
    },
    colors: {
      type: [String],
      default: ['Black', 'White', 'Blush Pink', 'Emerald']
    },
    images: {
      type: [String],
      default: []
    },
    stock: {
      type: Number,
      required: [true, 'Stock count is required'],
      min: [0, 'Stock cannot be negative'],
      default: 20
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Product', productSchema);
