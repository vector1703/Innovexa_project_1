const mongoose = require("mongoose");
const Product = require("../models/Product.model");

/**
 * @desc    Fetch all products with optional query filtering by category, search, and sorting
const Product = require('../models/Product.model');

/**
 * @desc    Get all active fashion products
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
    const { category, minPrice, maxPrice } = req.query;
    const filter = { isAvailable: true };

    if (category) {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve products',
      error: error.message
    });
  }
};

/**
 * @desc    Get product by ID
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
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    return res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve product',
      error: error.message
    });
  }
};

/**
 * @desc    Seed demo women's fashion items for quick testing
 * @route   POST /api/products/seed
 * @access  Public (Development)
 */
const seedProducts = async (req, res) => {
  try {
    const demoItems = [
      {
        name: 'Silk Wrap Midi Dress',
        description: 'Luxurious 100% mulberry silk wrap dress in emerald with flattering waist tie.',
        price: 189.99,
        category: 'Dresses',
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['Emerald', 'Midnight Black', 'Ruby Red'],
        images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800'],
        stock: 25
      },
      {
        name: 'Floral Chiffon Maxi Dress',
        description: 'Breezy romantic floral print dress featuring gentle pleats and tiered hem.',
        price: 139.5,
        category: 'Dresses',
        sizes: ['XS', 'S', 'M', 'L'],
        colors: ['Blush Pink', 'Ivory Floral'],
        images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800'],
        stock: 30
      },
      {
        name: 'Classic Linen Button-Down Blouse',
        description: 'Breathable organic linen blouse tailored for effortless elegance.',
        price: 89.0,
        category: 'Tops & Blouses',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Crisp White', 'Sky Blue', 'Sandstone'],
        images: ['https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=800'],
        stock: 45
      },
      {
        name: 'High-Rise Pleated Satin Skirt',
        description: 'A-line high-waisted satin skirt with fluid movement and concealed zipper.',
        price: 110.0,
        category: 'Skirts',
        sizes: ['XS', 'S', 'M', 'L'],
        colors: ['Champagne', 'Navy', 'Olive'],
        images: ['https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800'],
        stock: 18
      },
      {
        name: 'Cashmere Knit Cardigan',
        description: 'Ultra-soft pure cashmere button cardigan with ribbed cuffs and mother-of-pearl buttons.',
        price: 220.0,
        category: 'Outerwear',
        sizes: ['S', 'M', 'L'],
        colors: ['Oatmeal', 'Heather Grey', 'Dusty Rose'],
        images: ['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800'],
        stock: 12
      }
    ];

    await Product.deleteMany({});
    const createdProducts = await Product.insertMany(demoItems);

    return res.status(201).json({
      success: true,
      message: 'Demo women fashion items seeded successfully',
      count: createdProducts.length,
      data: createdProducts
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to seed products',
      error: error.message
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
  seedProducts
};
