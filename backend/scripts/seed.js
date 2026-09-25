const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const mongoose = require("mongoose");
const Product = require("../models/Product.model");

// Realistic mock data for a women's fashion store
const mockProducts = [
  {
    title: "Silk Slip Midi Dress",
    description:
      "Luxurious bias-cut mulberry silk midi dress with delicate adjustable straps and a flattering draped cowl neckline. Transitions seamlessly from daytime elegance to evening glamour.",
    price: 139.99,
    category: "dresses",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Emerald Green", "Champagne", "Midnight Black"],
    stockQuantity: 45,
    imageUrls: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop",
    ],
  },
  {
    title: "Tailored Wool-Blend Double-Breasted Blazer",
    description:
      "Timeless structured blazer crafted from an Italian wool blend. Features sharp peak lapels, tortoise-shell buttons, and a tailored silhouette that adds instant polish to any ensemble.",
    price: 189.5,
    category: "outerwear",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Camel", "Charcoal Grey", "Pinstripe Navy"],
    stockQuantity: 30,
    imageUrls: [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop",
    ],
  },
  {
    title: "Relaxed French Linen Button-Down Shirt",
    description:
      "Breathable and breezy casual button-down tailored from 100% Normandy linen. Features a relaxed drop-shoulder cut, mother-of-pearl buttons, and a front patch pocket.",
    price: 72.0,
    category: "tops",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Crisp White", "Sky Blue", "Terracotta"],
    stockQuantity: 60,
    imageUrls: [
      "https://images.unsplash.com/photo-1608234808654-2a8875faa7fd?w=800&auto=format&fit=crop",
    ],
  },
  {
    title: "High-Rise Pleated Wide-Leg Trousers",
    description:
      "Sophisticated wide-leg trousers cut from fluid drape crepe fabric with a flattering high waist, deep front pleats, functional side pockets, and an elongating silhouette.",
    price: 95.0,
    category: "bottoms",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Oatmeal", "Espresso Brown", "Black"],
    stockQuantity: 50,
    imageUrls: [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop",
    ],
  },
  {
    title: "Chunky Ribbed Cashmere Turtleneck",
    description:
      "Ultra-cozy oversized knit sweater spun from pure Grade-A cashmere. Features tactile ribbed trims, dropped shoulders, and a generous folded turtleneck collar.",
    price: 215.0,
    category: "knitwear",
    sizes: ["S", "M", "L"],
    colors: ["Oat Cream", "Heather Grey", "Sage"],
    stockQuantity: 25,
    imageUrls: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop",
    ],
  },
  {
    title: "Floral Tiered Ruffle Maxi Sundress",
    description:
      "Romantic tiered maxi dress cut from lightweight organic cotton voile, accented with botanical garden prints, tie shoulder straps, and a gently smocked bodice.",
    price: 118.0,
    category: "dresses",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Floral Ivory", "Blush Bloom"],
    stockQuantity: 40,
    imageUrls: [
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop",
    ],
  },
];

/**
 * Seeder function to reset and populate products collection
 */
async function seedDatabase() {
  const mongoUri =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    "mongodb://127.0.0.1:27017/innovexa_project_1";

  console.log("=========================================");
  console.log("   Innovexa Project 1 - Database Seeder  ");
  console.log("=========================================");
  console.log(`Connecting to MongoDB at: ${mongoUri.replace(/:([^:@]{4})[^:@]*@/, ":****@")}`);

  try {
    await mongoose.connect(mongoUri);
    console.log("✓ MongoDB Connected successfully");

    // Clear existing products
    console.log("Clearing existing products...");
    const deleteResult = await Product.deleteMany({});
    console.log(`✓ Removed ${deleteResult.deletedCount} existing products.`);

    // Insert mock products
    console.log(`Inserting ${mockProducts.length} mock fashion products...`);
    const insertedProducts = await Product.insertMany(mockProducts);
    console.log(`✓ Successfully seeded ${insertedProducts.length} products:`);

    insertedProducts.forEach((item, index) => {
      console.log(
        `  [${index + 1}] ${item.title} | Category: ${item.category} | Price: ₹${item.price} | Stock: ${item.stockQuantity}`
      );
    });

    console.log("=========================================");
    console.log(" Database seeding completed successfully! ");
    console.log("=========================================");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("✗ Seeding failed with error:", error);
    try {
      await mongoose.connection.close();
    } catch (_) {}
    process.exit(1);
  }
}

// Execute seeder if run directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, mockProducts };
