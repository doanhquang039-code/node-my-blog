const advancedFilterService = require('../services/advancedFilterService');

/**
 * Filter posts with advanced criteria
 */
exports.filterPosts = async (req, res) => {
    try {
        const filters = {
            search: req.query.search,
            categoryId: req.query.categoryId,
            tags: req.query.tags ? req.query.tags.split(',') : [],
            dateFrom: req.query.dateFrom,
            dateTo: req.query.dateTo,
            authorId: req.query.authorId,
            status: req.query.status || 'published',
            minViews: parseInt(req.query.minViews) || 0,
            minLikes: parseInt(req.query.minLikes) || 0,
            minComments: parseInt(req.query.minComments) || 0,
            minRating: parseFloat(req.query.minRating) || 0,
            minReadingTime: parseInt(req.query.minReadingTime) || 0,
            maxReadingTime: req.query.maxReadingTime ? parseInt(req.query.maxReadingTime) : null,
            isFeatured: req.query.isFeatured === 'true' ? true : (req.query.isFeatured === 'false' ? false : null),
            sortBy: req.query.sortBy || 'created_at',
            sortOrder: req.query.sortOrder || 'DESC',
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 20
        };

        const result = await advancedFilterService.filterPosts(filters);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error filtering posts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to filter posts',
            error: error.message
        });
    }
};

/**
 * Get filter options
 */
exports.getFilterOptions = async (req, res) => {
    try {
        const options = await advancedFilterService.getFilterOptions();

        res.json({
            success: true,
            data: options
        });
    } catch (error) {
        console.error('Error getting filter options:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get filter options',
            error: error.message
        });
    }
};

/**
 * Save filter preset
 */
exports.saveFilterPreset = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, filters } = req.body;

        const presetId = await advancedFilterService.saveFilterPreset(userId, name, filters);

        res.json({
            success: true,
            message: 'Filter preset saved successfully',
            data: { presetId }
        });
    } catch (error) {
        console.error('Error saving filter preset:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save filter preset',
            error: error.message
        });
    }
};

/**
 * Get user filter presets
 */
exports.getUserFilterPresets = async (req, res) => {
    try {
        const userId = req.user.id;
        const presets = await advancedFilterService.getUserFilterPresets(userId);

        res.json({
            success: true,
            data: presets
        });
    } catch (error) {
        console.error('Error getting filter presets:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get filter presets',
            error: error.message
        });
    }
};

/**
 * Delete filter preset
 */
exports.deleteFilterPreset = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        await advancedFilterService.deleteFilterPreset(id, userId);

        res.json({
            success: true,
            message: 'Filter preset deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting filter preset:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete filter preset',
            error: error.message
        });
    }
};
