const mongoose = require("mongoose");

/**
 * Mongoose Schema for Women's Fashion Products
 */
const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      maxlength: [150, "Product title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Product price cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
      trim: true,
      lowercase: true,
      enum: {
        values: [
          "dresses",
          "tops",
          "outerwear",
          "bottoms",
          "knitwear",
          "activewear",
          "accessories",
        ],
        message: "{VALUE} is not a supported fashion category",
      },
      index: true,
    },
    sizes: {
      type: [String],
      required: [true, "At least one size must be specified"],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "Sizes must be a non-empty array of strings (e.g., ['XS', 'S', 'M', 'L', 'XL'])",
      },
    },
    colors: {
      type: [String],
      required: [true, "At least one color must be specified"],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "Colors must be a non-empty array of strings",
      },
    },
    stockQuantity: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock quantity cannot be negative"],
      default: 0,
    },
    imageUrls: {
      type: [String],
      required: [true, "At least one product image URL is required"],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "imageUrls must contain at least one valid image URL",
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: inStock helper
productSchema.virtual("inStock").get(function () {
  return this.stockQuantity > 0;
});

// UI compatibility virtuals
productSchema
  .virtual("stock")
  .get(function () {
    return this.stockQuantity;
  })
  .set(function (value) {
    this.stockQuantity = value;
  });

productSchema.virtual("name").get(function () {
  return this.title;
});

productSchema.virtual("image").get(function () {
  return this.imageUrls && this.imageUrls.length > 0 ? this.imageUrls[0] : "";
});

// Compound index for category and price
productSchema.index({ category: 1, price: 1 });
// Full-text search index across title and description
productSchema.index({ title: "text", description: "text" });

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

module.exports = Product;
