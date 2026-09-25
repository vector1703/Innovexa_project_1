const mongoose = require("mongoose");
const Product = require("../models/Product.model");

/**
 * @desc    Fetch all products with optional query filtering by category, search, and sorting
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res) => {
  try {
    const { category, search, sort } = req.query;

    const filter = {};

    // Basic query filtering by category
    if (category && category.trim() !== "") {
      filter.category = category.trim().toLowerCase();
    }

    // Optional text search by title or description
    if (search && search.trim() !== "") {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [{ title: regex }, { description: regex }];
    }

    // Query builder
    let query = Product.find(filter);

    // Sorting support
    if (sort === "price_asc") {
      query = query.sort({ price: 1 });
    } else if (sort === "price_desc") {
      query = query.sort({ price: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const products = await query.exec();

    return res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({
      message: "Server error while fetching products",
      error: error.message,
    });
  }
};

/**
 * @desc    Fetch a single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    return res.status(500).json({
      message: "Server error while fetching product",
      error: error.message,
    });
  }
};

/**
 * @desc    Create a new product (admin functionality)
 * @route   POST /api/products
 * @access  Admin / Protected
 */
const createProduct = async (req, res) => {
  try {
    const {
      title,
      name,
      description,
      price,
      category,
      sizes,
      colors,
      stockQuantity,
      stock,
      imageUrls,
      image,
      images,
    } = req.body;

    // Normalize field names
    const productTitle = title || name;
    const productStock =
      stockQuantity !== undefined
        ? stockQuantity
        : stock !== undefined
        ? stock
        : 0;

    // Normalize imageUrls: accept array or single string
    let normalizedImages = [];
    if (Array.isArray(imageUrls) && imageUrls.length > 0) {
      normalizedImages = imageUrls;
    } else if (Array.isArray(images) && images.length > 0) {
      normalizedImages = images;
    } else if (typeof image === "string" && image.trim() !== "") {
      normalizedImages = [image.trim()];
    } else if (typeof imageUrls === "string" && imageUrls.trim() !== "") {
      normalizedImages = [imageUrls.trim()];
    }

    // Normalize sizes: accept array or comma-separated string
    let normalizedSizes = [];
    if (Array.isArray(sizes)) {
      normalizedSizes = sizes.map((s) => String(s).trim()).filter(Boolean);
    } else if (typeof sizes === "string") {
      normalizedSizes = sizes.split(",").map((s) => s.trim()).filter(Boolean);
    }

    // Normalize colors: accept array or comma-separated string
    let normalizedColors = [];
    if (Array.isArray(colors)) {
      normalizedColors = colors.map((c) => String(c).trim()).filter(Boolean);
    } else if (typeof colors === "string") {
      normalizedColors = colors.split(",").map((c) => c.trim()).filter(Boolean);
    }

    const newProduct = new Product({
      title: productTitle,
      description,
      price: Number(price),
      category: category ? String(category).trim().toLowerCase() : undefined,
      sizes: normalizedSizes,
      colors: normalizedColors,
      stockQuantity: Number(productStock),
      imageUrls: normalizedImages,
    });

    const savedProduct = await newProduct.save();

    return res.status(201).json({
      message: "Product created successfully",
      product: savedProduct,
      id: savedProduct._id,
    });
  } catch (error) {
    console.error("Error creating product:", error);

    // Mongoose validation error handling
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        message: "Validation Error",
        errors: messages,
      });
    }

    return res.status(500).json({
      message: "Server error while creating product",
      error: error.message,
    });
  }
};

/**
 * @desc    Update an existing product (admin functionality)
 * @route   PUT /api/products/:id
 * @access  Admin
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }

    const updates = { ...req.body };
    if (updates.name && !updates.title) updates.title = updates.name;
    if (updates.stock !== undefined && updates.stockQuantity === undefined) {
      updates.stockQuantity = updates.stock;
    }
    if (updates.image && (!updates.imageUrls || updates.imageUrls.length === 0)) {
      updates.imageUrls = [updates.image];
    }
    if (typeof updates.sizes === "string") {
      updates.sizes = updates.sizes.split(",").map((s) => s.trim()).filter(Boolean);
    }
    if (typeof updates.colors === "string") {
      updates.colors = updates.colors.split(",").map((c) => c.trim()).filter(Boolean);
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({
      message: "Server error while updating product",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a product (admin functionality)
 * @route   DELETE /api/products/:id
 * @access  Admin
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({
      message: "Server error while deleting product",
      error: error.message,
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  // Backward compatibility aliases
  list: getProducts,
  getOne: getProductById,
  create: createProduct,
  update: updateProduct,
  remove: deleteProduct,
};
