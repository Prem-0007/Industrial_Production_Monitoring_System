const express = require('express');
const router = express.Router();
const { getOrders, getOrder, createOrder, updateOrderStatus, deleteOrder } = require('../controllers/orderController');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getOrders).post(requireRole('admin', 'supervisor'), createOrder);
router.route('/:id').get(getOrder).delete(requireRole('admin', 'supervisor'), deleteOrder);
router.put('/:id/status', requireRole('admin', 'supervisor'), updateOrderStatus);

module.exports = router;
