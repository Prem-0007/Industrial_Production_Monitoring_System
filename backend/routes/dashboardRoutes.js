const express = require('express');
const router = express.Router();
const { getDashboard, getReports } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getDashboard);
router.get('/reports', protect, getReports);

module.exports = router;
