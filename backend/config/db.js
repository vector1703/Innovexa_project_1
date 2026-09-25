const mongoose = require('mongoose');

/**
 * Connect to MongoDB instance with resilient error handling.
 */
const connectDB = async () => {
  const mongoURI =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    'mongodb://127.0.0.1:27017/womens_fashion_store';

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    console.warn('[MongoDB] Server is running without active database connection. Start MongoDB to persist data.');
    return null;
  }
};

module.exports = connectDB;
