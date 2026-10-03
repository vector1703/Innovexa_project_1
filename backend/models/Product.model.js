const mongoose = require('mongoose');

/**
 * Product Schema tailored for Women's Fashion Store.
 * Supports apparel categories, size ranges (XS–XL), colors, stock tracking,
 * and availability flag.
 */
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [150, 'Product name cannot exceed 150 characters']
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
      trim: true,
      lowercase: true,
      enum: {
        values: [
          'dresses',
          'tops & blouses',
          'skirts',
          'pants & trousers',
          'ethnic wear',
          'outerwear',
          'knitwear',
          'activewear',
          'accessories'
        ],
        message: "'{VALUE}' is not a supported fashion category"
      },
      index: true
    },
    sizes: {
      type: [String],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: "Sizes must be a non-empty array (e.g., ['XS', 'S', 'M', 'L', 'XL'])"
      },
      default: ['XS', 'S', 'M', 'L', 'XL']
    },
    colors: {
      type: [String],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'Colors must be a non-empty array of strings'
      },
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
      default: 0
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual: convenience boolean for in-stock check
productSchema.virtual('inStock').get(function () {
  return this.stock > 0;
});

// Compound index for category + price queries
productSchema.index({ category: 1, price: 1 });

// Full-text search index across name and description
productSchema.index({ name: 'text', description: 'text' });

// Guard against model re-registration during hot-reload (nodemon)
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

module.exports = Product;
