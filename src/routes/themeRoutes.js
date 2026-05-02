const express = require('express');
const router = express.Router();
const themeController = require('../controllers/themeController');
const { authenticateToken } = require('../middlewares/auth');

// Get all theme presets
router.get('/presets', themeController.getPresets);

// Get user's current theme
router.get('/user', authenticateToken, themeController.getUserTheme);

// Apply theme preset
router.post('/apply-preset/:presetId', authenticateToken, themeController.applyPreset);

// Create custom theme
router.post('/custom', authenticateToken, themeController.createCustomTheme);

// Update custom theme
router.put('/custom/:id', authenticateToken, themeController.updateCustomTheme);

// Delete custom theme
router.delete('/custom/:id', authenticateToken, themeController.deleteCustomTheme);

// Get user's custom themes
router.get('/custom', authenticateToken, themeController.getUserCustomThemes);

module.exports = router;
