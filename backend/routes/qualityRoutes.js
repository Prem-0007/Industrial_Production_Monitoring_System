const express = require('express');
const router = express.Router();
const { getInspections, createInspection } = require('../controllers/qualityController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getInspections).post(createInspection);

module.exports = router;
