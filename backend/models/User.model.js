const mongoose = require('mongoose');

/**
 * Address sub-schema for customer address book.
 */
const addressSchema = new mongoose.Schema(
  {
    fullName: { type: String, trim: true },
    addressLine1: { type: String, trim: true },
    addressLine2: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    country: { type: String, trim: true, default: 'USA' },
    phone: { type: String, trim: true },
    isDefault: { type: Boolean, default: false }
  },
  { _id: true }
);

/**
 * User Schema for customer accounts.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    addresses: [addressSchema],
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', userSchema);
