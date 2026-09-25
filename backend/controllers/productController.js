const Product = require('../models/Product.model');

/**
 * @desc    Get all active fashion products
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res) => {
  try {
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
  seedProducts
};
