const mongoose = require("mongoose");

/**
 * MongoDB connection helper using Mongoose
 */
const connectMongoDB = async () => {
  try {
    const mongoUri =
      process.env.MONGO_URI ||
      process.env.MONGODB_URI ||
      "mongodb://127.0.0.1:27017/innovexa_project_1";

    const conn = await mongoose.connect(mongoUri);
    console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`✗ MongoDB Connection Error: ${error.message}`);
  }
};

module.exports = connectMongoDB;
