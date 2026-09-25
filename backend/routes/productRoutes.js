const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  seedProducts
} = require('../controllers/productController');

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/seed', seedProducts);

module.exports = router;
