const express = require('express');
const router = express.Router();
const { getLines, createLine, updateLine, deleteLine } = require('../controllers/lineController');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getLines).post(requireRole('admin', 'supervisor'), createLine);
router.route('/:id').put(requireRole('admin', 'supervisor'), updateLine).delete(requireRole('admin', 'supervisor'), deleteLine);

module.exports = router;
