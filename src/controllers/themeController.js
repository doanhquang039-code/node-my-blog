const themeService = require('../services/themeService');

/**
 * Get all theme presets
 */
exports.getPresets = async (req, res) => {
    try {
        const presets = await themeService.getPresets();
        
        res.json({
            success: true,
            data: presets
        });
    } catch (error) {
        console.error('Error getting presets:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get theme presets',
            error: error.message
        });
    }
};

/**
 * Get user's current theme
 */
exports.getUserTheme = async (req, res) => {
    try {
        const userId = req.user.id;
        const theme = await themeService.getUserTheme(userId);
        
        res.json({
            success: true,
            data: theme
        });
    } catch (error) {
        console.error('Error getting user theme:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user theme',
            error: error.message
        });
    }
};

/**
 * Apply theme preset
 */
exports.applyPreset = async (req, res) => {
    try {
        const userId = req.user.id;
        const { presetId } = req.params;
        
        await themeService.applyPreset(userId, presetId);
        
        res.json({
            success: true,
            message: 'Theme preset applied successfully'
        });
    } catch (error) {
        console.error('Error applying preset:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to apply theme preset',
            error: error.message
        });
    }
};

/**
 * Create custom theme
 */
exports.createCustomTheme = async (req, res) => {
    try {
        const userId = req.user.id;
        const themeData = req.body;
        
        const themeId = await themeService.createCustomTheme(userId, themeData);
        
        res.json({
            success: true,
            message: 'Custom theme created successfully',
            data: { themeId }
        });
    } catch (error) {
        console.error('Error creating custom theme:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create custom theme',
            error: error.message
        });
    }
};

/**
 * Update custom theme
 */
exports.updateCustomTheme = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const themeData = req.body;
        
        await themeService.updateCustomTheme(id, userId, themeData);
        
        res.json({
            success: true,
            message: 'Custom theme updated successfully'
        });
    } catch (error) {
        console.error('Error updating custom theme:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update custom theme',
            error: error.message
        });
    }
};

/**
 * Delete custom theme
 */
exports.deleteCustomTheme = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        
        await themeService.deleteCustomTheme(id, userId);
        
        res.json({
            success: true,
            message: 'Custom theme deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting custom theme:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete custom theme',
            error: error.message
        });
    }
};

/**
 * Get user's custom themes
 */
exports.getUserCustomThemes = async (req, res) => {
    try {
        const userId = req.user.id;
        const themes = await themeService.getUserCustomThemes(userId);
        
        res.json({
            success: true,
            data: themes
        });
    } catch (error) {
        console.error('Error getting custom themes:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get custom themes',
            error: error.message
        });
    }
};
