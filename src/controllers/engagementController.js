const socialService = require('../services/socialService');
const bookmarkService = require('../services/bookmarkService');
const reactionService = require('../services/reactionService');
const readingProgressService = require('../services/readingProgressService');

// ============ SOCIAL MEDIA ============

exports.sharePost = async (req, res) => {
    try {
        const { postId, platform } = req.body;
        const userId = req.user.id;

        await socialService.sharePost(postId, userId, platform);

        res.json({
            success: true,
            message: 'Post shared successfully'
        });
    } catch (error) {
        console.error('Error sharing post:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to share post',
            error: error.message
        });
    }
};

exports.getShareStats = async (req, res) => {
    try {
        const { postId } = req.params;
        const stats = await socialService.getShareStats(postId);

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error getting share stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get share stats',
            error: error.message
        });
    }
};

exports.getTrendingPosts = async (req, res) => {
    try {
        const { days = 7, limit = 10 } = req.query;
        const posts = await socialService.getTrendingPosts(days, limit);

        res.json({
            success: true,
            data: posts
        });
    } catch (error) {
        console.error('Error getting trending posts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get trending posts',
            error: error.message
        });
    }
};

// ============ BOOKMARKS ============

exports.addBookmark = async (req, res) => {
    try {
        const userId = req.user.id;
        const { postId, collectionId } = req.body;

        const result = await bookmarkService.addBookmark(userId, postId, collectionId);

        res.json(result);
    } catch (error) {
        console.error('Error adding bookmark:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add bookmark',
            error: error.message
        });
    }
};

exports.removeBookmark = async (req, res) => {
    try {
        const userId = req.user.id;
        const { postId } = req.params;

        await bookmarkService.removeBookmark(userId, postId);

        res.json({
            success: true,
            message: 'Bookmark removed'
        });
    } catch (error) {
        console.error('Error removing bookmark:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove bookmark',
            error: error.message
        });
    }
};

exports.getUserBookmarks = async (req, res) => {
    try {
        const userId = req.user.id;
        const { collectionId, page = 1, limit = 20 } = req.query;

        const result = await bookmarkService.getUserBookmarks(userId, collectionId, page, limit);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error getting bookmarks:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get bookmarks',
            error: error.message
        });
    }
};

exports.createCollection = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, description } = req.body;

        const result = await bookmarkService.createCollection(userId, name, description);

        res.json(result);
    } catch (error) {
        console.error('Error creating collection:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create collection',
            error: error.message
        });
    }
};

exports.getUserCollections = async (req, res) => {
    try {
        const userId = req.user.id;
        const collections = await bookmarkService.getUserCollections(userId);

        res.json({
            success: true,
            data: collections
        });
    } catch (error) {
        console.error('Error getting collections:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get collections',
            error: error.message
        });
    }
};

// ============ REACTIONS ============

exports.addReaction = async (req, res) => {
    try {
        const userId = req.user.id;
        const { postId, reactionType } = req.body;

        const result = await reactionService.addReaction(userId, postId, reactionType);

        res.json(result);
    } catch (error) {
        console.error('Error adding reaction:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add reaction',
            error: error.message
        });
    }
};

exports.getPostReactions = async (req, res) => {
    try {
        const { postId } = req.params;
        const reactions = await reactionService.getPostReactions(postId);

        res.json({
            success: true,
            data: reactions
        });
    } catch (error) {
        console.error('Error getting reactions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get reactions',
            error: error.message
        });
    }
};

exports.getUserReaction = async (req, res) => {
    try {
        const userId = req.user.id;
        const { postId } = req.params;

        const reaction = await reactionService.getUserReaction(userId, postId);

        res.json({
            success: true,
            data: { reaction }
        });
    } catch (error) {
        console.error('Error getting user reaction:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user reaction',
            error: error.message
        });
    }
};

// ============ READING PROGRESS ============

exports.updateProgress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { postId, progress, scrollPosition } = req.body;

        await readingProgressService.updateProgress(userId, postId, progress, scrollPosition);

        res.json({
            success: true,
            message: 'Progress updated'
        });
    } catch (error) {
        console.error('Error updating progress:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update progress',
            error: error.message
        });
    }
};

exports.getProgress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { postId } = req.params;

        const progress = await readingProgressService.getProgress(userId, postId);

        res.json({
            success: true,
            data: progress
        });
    } catch (error) {
        console.error('Error getting progress:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get progress',
            error: error.message
        });
    }
};

exports.getContinueReading = async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 10 } = req.query;

        const posts = await readingProgressService.getContinueReading(userId, limit);

        res.json({
            success: true,
            data: posts
        });
    } catch (error) {
        console.error('Error getting continue reading:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get continue reading',
            error: error.message
        });
    }
};

exports.getReadingStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const stats = await readingProgressService.getReadingStats(userId);
        const streak = await readingProgressService.getReadingStreak(userId);

        res.json({
            success: true,
            data: {
                ...stats,
                ...streak
            }
        });
    } catch (error) {
        console.error('Error getting reading stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get reading stats',
            error: error.message
        });
    }
};
