const db = require('../config/db');

class NotificationService {
    /**
     * Create a new notification
     */
    async createNotification(userId, type, title, message, data = {}) {
        const query = `
            INSERT INTO realtime_notifications 
            (user_id, type, title, message, data, is_read, created_at)
            VALUES (?, ?, ?, ?, ?, false, NOW())
        `;
        
        const [result] = await db.execute(query, [
            userId,
            type,
            title,
            message,
            JSON.stringify(data)
        ]);

        return result.insertId;
    }

    /**
     * Get user notifications with pagination
     */
    async getUserNotifications(userId, page = 1, limit = 20, unreadOnly = false) {
        const offset = (page - 1) * limit;
        
        let query = `
            SELECT id, type, title, message, data, is_read, created_at
            FROM realtime_notifications
            WHERE user_id = ?
        `;
        
        if (unreadOnly) {
            query += ' AND is_read = false';
        }
        
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        
        const [notifications] = await db.execute(query, [userId, limit, offset]);
        
        // Parse JSON data
        return notifications.map(notif => ({
            ...notif,
            data: typeof notif.data === 'string' ? JSON.parse(notif.data) : notif.data
        }));
    }

    /**
     * Get unread notification count
     */
    async getUnreadCount(userId) {
        const query = `
            SELECT COUNT(*) as count
            FROM realtime_notifications
            WHERE user_id = ? AND is_read = false
        `;
        
        const [result] = await db.execute(query, [userId]);
        return result[0].count;
    }

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId, userId) {
        const query = `
            UPDATE realtime_notifications
            SET is_read = true, read_at = NOW()
            WHERE id = ? AND user_id = ?
        `;
        
        await db.execute(query, [notificationId, userId]);
    }

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(userId) {
        const query = `
            UPDATE realtime_notifications
            SET is_read = true, read_at = NOW()
            WHERE user_id = ? AND is_read = false
        `;
        
        await db.execute(query, [userId]);
    }

    /**
     * Delete notification
     */
    async deleteNotification(notificationId, userId) {
        const query = `
            DELETE FROM realtime_notifications
            WHERE id = ? AND user_id = ?
        `;
        
        await db.execute(query, [notificationId, userId]);
    }

    /**
     * Get notification settings
     */
    async getSettings(userId) {
        const query = `
            SELECT * FROM notification_settings
            WHERE user_id = ?
        `;
        
        const [settings] = await db.execute(query, [userId]);
        
        if (settings.length === 0) {
            // Return default settings
            return {
                email_notifications: true,
                push_notifications: true,
                comment_notifications: true,
                like_notifications: true,
                follow_notifications: true,
                post_notifications: true
            };
        }
        
        return settings[0];
    }

    /**
     * Update notification settings
     */
    async updateSettings(userId, settings) {
        // Check if settings exist
        const [existing] = await db.execute(
            'SELECT id FROM notification_settings WHERE user_id = ?',
            [userId]
        );

        if (existing.length === 0) {
            // Insert new settings
            const query = `
                INSERT INTO notification_settings
                (user_id, email_notifications, push_notifications, 
                 comment_notifications, like_notifications, 
                 follow_notifications, post_notifications)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            
            await db.execute(query, [
                userId,
                settings.email_notifications ?? true,
                settings.push_notifications ?? true,
                settings.comment_notifications ?? true,
                settings.like_notifications ?? true,
                settings.follow_notifications ?? true,
                settings.post_notifications ?? true
            ]);
        } else {
            // Update existing settings
            const query = `
                UPDATE notification_settings
                SET email_notifications = ?,
                    push_notifications = ?,
                    comment_notifications = ?,
                    like_notifications = ?,
                    follow_notifications = ?,
                    post_notifications = ?,
                    updated_at = NOW()
                WHERE user_id = ?
            `;
            
            await db.execute(query, [
                settings.email_notifications ?? true,
                settings.push_notifications ?? true,
                settings.comment_notifications ?? true,
                settings.like_notifications ?? true,
                settings.follow_notifications ?? true,
                settings.post_notifications ?? true,
                userId
            ]);
        }
    }

    /**
     * Send notification (create + push via WebSocket)
     */
    async sendNotification(userId, type, title, message, data = {}, wss = null) {
        // Create notification in database
        const notificationId = await this.createNotification(userId, type, title, message, data);
        
        // Send via WebSocket if available
        if (wss && wss.sendNotification) {
            wss.sendNotification(userId, {
                id: notificationId,
                type,
                title,
                message,
                data,
                is_read: false,
                created_at: new Date().toISOString()
            });
        }
        
        return notificationId;
    }
}

module.exports = new NotificationService();
