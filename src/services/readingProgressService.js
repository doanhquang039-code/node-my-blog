const db = require('../config/db');

class ReadingProgressService {
    /**
     * Update reading progress
     */
    async updateProgress(userId, postId, progress, scrollPosition = 0) {
        // Check if progress exists
        const [existing] = await db.execute(
            'SELECT id FROM reading_progress WHERE user_id = ? AND post_id = ?',
            [userId, postId]
        );

        if (existing.length > 0) {
            // Update existing progress
            const query = `
                UPDATE reading_progress
                SET progress = ?,
                    scroll_position = ?,
                    last_read_at = NOW(),
                    is_completed = ?
                WHERE id = ?
            `;
            
            await db.execute(query, [
                progress,
                scrollPosition,
                progress >= 100 ? 1 : 0,
                existing[0].id
            ]);
        } else {
            // Insert new progress
            const query = `
                INSERT INTO reading_progress 
                (user_id, post_id, progress, scroll_position, is_completed, started_at, last_read_at)
                VALUES (?, ?, ?, ?, ?, NOW(), NOW())
            `;
            
            await db.execute(query, [
                userId,
                postId,
                progress,
                scrollPosition,
                progress >= 100 ? 1 : 0
            ]);
        }

        return { success: true };
    }

    /**
     * Get reading progress
     */
    async getProgress(userId, postId) {
        const query = `
            SELECT *
            FROM reading_progress
            WHERE user_id = ? AND post_id = ?
        `;
        
        const [result] = await db.execute(query, [userId, postId]);
        
        return result.length > 0 ? result[0] : null;
    }

    /**
     * Get user's reading history
     */
    async getReadingHistory(userId, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        
        const query = `
            SELECT 
                rp.*,
                p.title,
                p.slug,
                p.featured_image,
                p.reading_time,
                u.name as author_name
            FROM reading_progress rp
            JOIN posts p ON rp.post_id = p.id
            LEFT JOIN users u ON p.author_id = u.id
            WHERE rp.user_id = ?
            ORDER BY rp.last_read_at DESC
            LIMIT ? OFFSET ?
        `;
        
        const [history] = await db.execute(query, [userId, limit, offset]);
        
        // Get total count
        const [countResult] = await db.execute(
            'SELECT COUNT(*) as total FROM reading_progress WHERE user_id = ?',
            [userId]
        );
        
        return {
            history,
            pagination: {
                page,
                limit,
                total: countResult[0].total,
                totalPages: Math.ceil(countResult[0].total / limit)
            }
        };
    }

    /**
     * Get continue reading list
     */
    async getContinueReading(userId, limit = 10) {
        const query = `
            SELECT 
                rp.*,
                p.title,
                p.slug,
                p.featured_image,
                p.reading_time,
                u.name as author_name
            FROM reading_progress rp
            JOIN posts p ON rp.post_id = p.id
            LEFT JOIN users u ON p.author_id = u.id
            WHERE rp.user_id = ? 
              AND rp.is_completed = 0
              AND rp.progress > 0
            ORDER BY rp.last_read_at DESC
            LIMIT ?
        `;
        
        const [posts] = await db.execute(query, [userId, limit]);
        
        return posts;
    }

    /**
     * Get completed posts
     */
    async getCompletedPosts(userId, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        
        const query = `
            SELECT 
                rp.*,
                p.title,
                p.slug,
                p.featured_image,
                p.reading_time,
                u.name as author_name
            FROM reading_progress rp
            JOIN posts p ON rp.post_id = p.id
            LEFT JOIN users u ON p.author_id = u.id
            WHERE rp.user_id = ? AND rp.is_completed = 1
            ORDER BY rp.last_read_at DESC
            LIMIT ? OFFSET ?
        `;
        
        const [posts] = await db.execute(query, [userId, limit, offset]);
        
        return posts;
    }

    /**
     * Get reading statistics
     */
    async getReadingStats(userId) {
        const [stats] = await db.execute(`
            SELECT 
                COUNT(*) as total_posts_read,
                COUNT(CASE WHEN is_completed = 1 THEN 1 END) as completed_posts,
                COUNT(CASE WHEN is_completed = 0 AND progress > 0 THEN 1 END) as in_progress_posts,
                AVG(progress) as average_progress,
                SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as total_completed,
                COUNT(DISTINCT DATE(last_read_at)) as days_active
            FROM reading_progress
            WHERE user_id = ?
        `, [userId]);
        
        // Get total reading time (estimated)
        const [timeStats] = await db.execute(`
            SELECT 
                SUM(p.reading_time) as total_reading_time
            FROM reading_progress rp
            JOIN posts p ON rp.post_id = p.id
            WHERE rp.user_id = ? AND rp.is_completed = 1
        `, [userId]);
        
        return {
            ...stats[0],
            total_reading_time: timeStats[0].total_reading_time || 0
        };
    }

    /**
     * Mark post as completed
     */
    async markAsCompleted(userId, postId) {
        await this.updateProgress(userId, postId, 100, 0);
        
        return { success: true };
    }

    /**
     * Reset progress
     */
    async resetProgress(userId, postId) {
        await db.execute(
            'DELETE FROM reading_progress WHERE user_id = ? AND post_id = ?',
            [userId, postId]
        );
        
        return { success: true };
    }

    /**
     * Get reading streak
     */
    async getReadingStreak(userId) {
        const query = `
            SELECT DISTINCT DATE(last_read_at) as read_date
            FROM reading_progress
            WHERE user_id = ?
            ORDER BY read_date DESC
            LIMIT 365
        `;
        
        const [dates] = await db.execute(query, [userId]);
        
        if (dates.length === 0) {
            return { currentStreak: 0, longestStreak: 0 };
        }

        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 1;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Check if read today or yesterday
        const lastReadDate = new Date(dates[0].read_date);
        const daysDiff = Math.floor((today - lastReadDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff <= 1) {
            currentStreak = 1;
            
            // Calculate current streak
            for (let i = 1; i < dates.length; i++) {
                const prevDate = new Date(dates[i - 1].read_date);
                const currDate = new Date(dates[i].read_date);
                const diff = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));
                
                if (diff === 1) {
                    currentStreak++;
                } else {
                    break;
                }
            }
        }
        
        // Calculate longest streak
        for (let i = 1; i < dates.length; i++) {
            const prevDate = new Date(dates[i - 1].read_date);
            const currDate = new Date(dates[i].read_date);
            const diff = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));
            
            if (diff === 1) {
                tempStreak++;
                longestStreak = Math.max(longestStreak, tempStreak);
            } else {
                tempStreak = 1;
            }
        }
        
        longestStreak = Math.max(longestStreak, currentStreak);
        
        return { currentStreak, longestStreak };
    }
}

module.exports = new ReadingProgressService();
