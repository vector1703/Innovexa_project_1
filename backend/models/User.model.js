const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    password: {
      type: String,
      default: '',
      minlength: [6, 'Password must be at least 6 characters'],
      select: false // never returned by queries unless explicitly requested
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

// Hash the password before saving whenever it is new or modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare a plain-text password with the stored hash
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
