const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  generateDevToken
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/dev-token', generateDevToken);
router.get('/me', protect, getMe);

module.exports = router;
