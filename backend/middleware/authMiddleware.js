const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User.model');

/**
 * Authentication Middleware:
 * Protects routes by validating JWT Bearer token or development test credentials.
 * Attaches authenticated user object to `req.user`.
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Check for Bearer token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2. Allow X-User-Id header as fallback in development/test environment if explicitly provided
  if (!token && process.env.NODE_ENV !== 'production' && req.headers['x-user-id']) {
    const devUserId = req.headers['x-user-id'];
    if (mongoose.Types.ObjectId.isValid(devUserId)) {
      req.user = {
        _id: new mongoose.Types.ObjectId(devUserId),
        name: req.headers['x-user-name'] || 'Test User',
        email: req.headers['x-user-email'] || 'test@innovexa.com',
        role: req.headers['x-user-role'] || 'customer'
      };
      return next();
    }
  }

  // If no token was found
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: Access token is missing or invalid'
    });
  }

  try {
    // Verify JWT token
    const secret = process.env.JWT_SECRET || 'innovexa_jwt_super_secret_key_2026';
    const decoded = jwt.verify(token, secret);

    // Extract user ID from token payload
    const userId = decoded.id || decoded._id || decoded.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized: Token payload missing user ID'
      });
    }

    // Attach user payload
    req.user = {
      _id: new mongoose.Types.ObjectId(userId),
      email: decoded.email || '',
      role: decoded.role || 'customer'
    };

    // If User collection exists and can be looked up, enrich req.user if present
    try {
      const userRecord = await User.findById(userId).select('-password');
      if (userRecord) {
        req.user = userRecord;
      }
    } catch {
      // Proceed with decoded JWT payload if DB lookup is unavailable
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: Invalid or expired token',
      error: error.message
    });
  }
};

/**
 * Optional Role-based Authorization Middleware.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user ? req.user.role : 'unauthenticated'}' cannot access this resource`
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize
};
