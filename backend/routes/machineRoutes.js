const express = require('express');
const router = express.Router();
const { getMachines, createMachine, updateMachine, deleteMachine } = require('../controllers/machineController');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getMachines).post(requireRole('admin', 'supervisor'), createMachine);
router.route('/:id').put(requireRole('admin', 'supervisor'), updateMachine).delete(requireRole('admin', 'supervisor'), deleteMachine);

module.exports = router;
