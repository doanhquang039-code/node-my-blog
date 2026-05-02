const express = require('express');
const router = express.Router();
const advancedFilterController = require('../controllers/advancedFilterController');
const { authenticateToken } = require('../middlewares/auth');

// Filter posts (public)
router.get('/posts', advancedFilterController.filterPosts);

// Get filter options (public)
router.get('/options', advancedFilterController.getFilterOptions);

// Save filter preset (authenticated)
router.post('/presets', authenticateToken, advancedFilterController.saveFilterPreset);

// Get user filter presets (authenticated)
router.get('/presets', authenticateToken, advancedFilterController.getUserFilterPresets);

// Delete filter preset (authenticated)
router.delete('/presets/:id', authenticateToken, advancedFilterController.deleteFilterPreset);

module.exports = router;
