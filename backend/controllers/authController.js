const mongoose = require('mongoose');
const User = require('../models/User.model');
const generateToken = require('../utils/generateToken');

/**
 * @desc    Register a new customer
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: password || 'default_password_123',
      phone: phone || '',
      role: 'customer'
    });

    const token = generateToken(user._id, user.email, user.role);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: error.message
    });
  }
};

/**
 * @desc    Log in customer
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Auto-create test customer if logging in for demo simplicity
      user = await User.create({
        name: email.split('@')[0],
        email: email.toLowerCase(),
        role: 'customer'
      });
    }

    const token = generateToken(user._id, user.email, user.role);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to log in',
      error: error.message
    });
  }
};

/**
 * @desc    Get currently logged in profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: req.user
  });
};

/**
 * @desc    Quick helper to generate a JWT token for testing in Postman, curl, or dev
 * @route   GET /api/auth/dev-token
 * @access  Public (Dev)
 */
const generateDevToken = async (req, res) => {
  const dummyId = new mongoose.Types.ObjectId();
  const token = generateToken(dummyId, 'fashionista@innovexa.com', 'customer');
  return res.status(200).json({
    success: true,
    message: 'Development testing token generated',
    userId: dummyId,
    token,
    headerFormat: `Authorization: Bearer ${token}`
  });
};

module.exports = {
  register,
  login,
  getMe,
  generateDevToken
};
