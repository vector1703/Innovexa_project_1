const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const cartRoutes = require('./cartRoutes');
const orderRoutes = require('./orderRoutes');
const paymentRoutes = require('./paymentRoutes');
const productRoutes = require('./productRoutes');

// Mount domain routes under unified API router
router.use('/auth', authRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/products', productRoutes);

module.exports = router;
