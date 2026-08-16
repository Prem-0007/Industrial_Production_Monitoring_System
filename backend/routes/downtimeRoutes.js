const express = require('express');
const router = express.Router();
const { getDowntimes, createDowntime, resolveDowntime } = require('../controllers/downtimeController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getDowntimes).post(createDowntime);
router.put('/:id/resolve', resolveDowntime);

module.exports = router;
