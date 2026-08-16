const express = require('express');
const router = express.Router();
const { getProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getProducts).post(requireRole('admin', 'supervisor'), createProduct);
router.route('/:id').put(requireRole('admin', 'supervisor'), updateProduct).delete(requireRole('admin', 'supervisor'), deleteProduct);

module.exports = router;
