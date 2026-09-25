const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT token for authenticated users.
 *
 * @param {string|mongoose.Types.ObjectId} userId
 * @param {string} email
 * @param {string} [role='customer']
 * @returns {string} Signed JWT token
 */
const generateToken = (userId, email, role = 'customer') => {
  const secret = process.env.JWT_SECRET || 'innovexa_jwt_super_secret_key_2026';
  const expiresIn = process.env.JWT_EXPIRE || '30d';

  return jwt.sign(
    {
      id: userId.toString(),
      email,
      role
    },
    secret,
    {
      expiresIn
    }
  );
};

module.exports = generateToken;
