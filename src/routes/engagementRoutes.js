const express = require('express');
const router = express.Router();
const engagementController = require('../controllers/engagementController');
const { authenticateToken } = require('../middlewares/auth');

// ============ SOCIAL MEDIA ============

// Share post
router.post('/share', authenticateToken, engagementController.sharePost);

// Get share statistics
router.get('/share/:postId/stats', engagementController.getShareStats);

// Get trending posts
router.get('/trending', engagementController.getTrendingPosts);

// ============ BOOKMARKS ============

// Add bookmark
router.post('/bookmarks', authenticateToken, engagementController.addBookmark);

// Remove bookmark
router.delete('/bookmarks/:postId', authenticateToken, engagementController.removeBookmark);

// Get user bookmarks
router.get('/bookmarks', authenticateToken, engagementController.getUserBookmarks);

// Create collection
router.post('/bookmarks/collections', authenticateToken, engagementController.createCollection);

// Get user collections
router.get('/bookmarks/collections', authenticateToken, engagementController.getUserCollections);

// ============ REACTIONS ============

// Add/update reaction
router.post('/reactions', authenticateToken, engagementController.addReaction);

// Get post reactions
router.get('/reactions/:postId', engagementController.getPostReactions);

// Get user's reaction to post
router.get('/reactions/:postId/user', authenticateToken, engagementController.getUserReaction);

// ============ READING PROGRESS ============

// Update reading progress
router.post('/progress', authenticateToken, engagementController.updateProgress);

// Get reading progress
router.get('/progress/:postId', authenticateToken, engagementController.getProgress);

// Get continue reading list
router.get('/continue-reading', authenticateToken, engagementController.getContinueReading);

// Get reading statistics
router.get('/reading-stats', authenticateToken, engagementController.getReadingStats);

module.exports = router;
