const express = require('express');
const router = express.Router();
const { getRecords, createRecord } = require('../controllers/recordController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getRecords).post(createRecord);

module.exports = router;
