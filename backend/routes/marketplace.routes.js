const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { authorise } = require('../middleware/role.middleware');
const { createProfile, getTeachers, createMarketplaceSlot } = require('../controllers/marketplace.controller');
router.post('/profile', protect, authorise('teacher'), createProfile);
router.get('/teachers', protect, getTeachers);
router.post('/slots',   protect, authorise('teacher'), createMarketplaceSlot);
module.exports = router;
