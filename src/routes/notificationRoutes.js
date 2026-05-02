const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middlewares/auth');

// Get all notifications for current user
router.get('/', authenticateToken, notificationController.getUserNotifications);

// Get unread count
router.get('/unread/count', authenticateToken, notificationController.getUnreadCount);

// Mark notification as read
router.put('/:id/read', authenticateToken, notificationController.markAsRead);

// Mark all as read
router.put('/read-all', authenticateToken, notificationController.markAllAsRead);

// Delete notification
router.delete('/:id', authenticateToken, notificationController.deleteNotification);

// Get notification settings
router.get('/settings', authenticateToken, notificationController.getSettings);

// Update notification settings
router.put('/settings', authenticateToken, notificationController.updateSettings);

module.exports = router;
