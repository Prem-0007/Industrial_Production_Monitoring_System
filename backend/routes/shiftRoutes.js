const express = require('express');
const router = express.Router();
const { getShifts, createShift, updateShift, deleteShift } = require('../controllers/shiftController');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getShifts).post(requireRole('admin', 'supervisor'), createShift);
router.route('/:id').put(requireRole('admin', 'supervisor'), updateShift).delete(requireRole('admin', 'supervisor'), deleteShift);

module.exports = router;
