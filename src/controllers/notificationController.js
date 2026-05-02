const notificationService = require('../services/notificationService');

/**
 * Get all notifications for current user
 */
exports.getUserNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20, unreadOnly = false } = req.query;

        const notifications = await notificationService.getUserNotifications(
            userId,
            parseInt(page),
            parseInt(limit),
            unreadOnly === 'true'
        );

        res.json({
            success: true,
            data: notifications
        });
    } catch (error) {
        console.error('Error getting notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get notifications',
            error: error.message
        });
    }
};

/**
 * Get unread notification count
 */
exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;
        const count = await notificationService.getUnreadCount(userId);

        res.json({
            success: true,
            data: { count }
        });
    } catch (error) {
        console.error('Error getting unread count:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get unread count',
            error: error.message
        });
    }
};

/**
 * Mark notification as read
 */
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        await notificationService.markAsRead(id, userId);

        res.json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read',
            error: error.message
        });
    }
};

/**
 * Mark all notifications as read
 */
exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await notificationService.markAllAsRead(userId);

        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('Error marking all as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark all as read',
            error: error.message
        });
    }
};

/**
 * Delete notification
 */
exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        await notificationService.deleteNotification(id, userId);

        res.json({
            success: true,
            message: 'Notification deleted'
        });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete notification',
            error: error.message
        });
    }
};

/**
 * Get notification settings
 */
exports.getSettings = async (req, res) => {
    try {
        const userId = req.user.id;
        const settings = await notificationService.getSettings(userId);

        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Error getting settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get settings',
            error: error.message
        });
    }
};

/**
 * Update notification settings
 */
exports.updateSettings = async (req, res) => {
    try {
        const userId = req.user.id;
        const settings = req.body;

        await notificationService.updateSettings(userId, settings);

        res.json({
            success: true,
            message: 'Settings updated successfully'
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update settings',
            error: error.message
        });
    }
};
