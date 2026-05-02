const db = require('../config/db');

class BookmarkService {
    /**
     * Add bookmark
     */
    async addBookmark(userId, postId, collectionId = null) {
        // Check if already bookmarked
        const [existing] = await db.execute(
            'SELECT id FROM bookmarks WHERE user_id = ? AND post_id = ?',
            [userId, postId]
        );

        if (existing.length > 0) {
            return { success: false, message: 'Already bookmarked' };
        }

        const query = `
            INSERT INTO bookmarks (user_id, post_id, collection_id, created_at)
            VALUES (?, ?, ?, NOW())
        `;
        
        const [result] = await db.execute(query, [userId, postId, collectionId]);
        
        return { success: true, bookmarkId: result.insertId };
    }

    /**
     * Remove bookmark
     */
    async removeBookmark(userId, postId) {
        const query = `
            DELETE FROM bookmarks
            WHERE user_id = ? AND post_id = ?
        `;
        
        await db.execute(query, [userId, postId]);
        
        return { success: true };
    }

    /**
     * Get user bookmarks
     */
    async getUserBookmarks(userId, collectionId = null, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        
        let query = `
            SELECT 
                b.*,
                p.title,
                p.excerpt,
                p.featured_image,
                p.slug,
                p.reading_time,
                u.name as author_name,
                c.name as category_name
            FROM bookmarks b
            JOIN posts p ON b.post_id = p.id
            LEFT JOIN users u ON p.author_id = u.id
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE b.user_id = ?
        `;
        
        const params = [userId];
        
        if (collectionId) {
            query += ' AND b.collection_id = ?';
            params.push(collectionId);
        }
        
        query += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);
        
        const [bookmarks] = await db.execute(query, params);
        
        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM bookmarks WHERE user_id = ?';
        const countParams = [userId];
        
        if (collectionId) {
            countQuery += ' AND collection_id = ?';
            countParams.push(collectionId);
        }
        
        const [countResult] = await db.execute(countQuery, countParams);
        const total = countResult[0].total;
        
        return {
            bookmarks,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Check if post is bookmarked
     */
    async isBookmarked(userId, postId) {
        const [result] = await db.execute(
            'SELECT id FROM bookmarks WHERE user_id = ? AND post_id = ?',
            [userId, postId]
        );
        
        return result.length > 0;
    }

    /**
     * Create bookmark collection
     */
    async createCollection(userId, name, description = '') {
        const query = `
            INSERT INTO bookmark_collections (user_id, name, description, created_at)
            VALUES (?, ?, ?, NOW())
        `;
        
        const [result] = await db.execute(query, [userId, name, description]);
        
        return { success: true, collectionId: result.insertId };
    }

    /**
     * Get user collections
     */
    async getUserCollections(userId) {
        const query = `
            SELECT 
                bc.*,
                COUNT(b.id) as bookmark_count
            FROM bookmark_collections bc
            LEFT JOIN bookmarks b ON bc.id = b.collection_id
            WHERE bc.user_id = ?
            GROUP BY bc.id
            ORDER BY bc.created_at DESC
        `;
        
        const [collections] = await db.execute(query, [userId]);
        
        return collections;
    }

    /**
     * Update collection
     */
    async updateCollection(collectionId, userId, name, description) {
        const query = `
            UPDATE bookmark_collections
            SET name = ?, description = ?, updated_at = NOW()
            WHERE id = ? AND user_id = ?
        `;
        
        await db.execute(query, [name, description, collectionId, userId]);
        
        return { success: true };
    }

    /**
     * Delete collection
     */
    async deleteCollection(collectionId, userId) {
        // Move bookmarks to default (null collection)
        await db.execute(
            'UPDATE bookmarks SET collection_id = NULL WHERE collection_id = ? AND user_id = ?',
            [collectionId, userId]
        );
        
        // Delete collection
        await db.execute(
            'DELETE FROM bookmark_collections WHERE id = ? AND user_id = ?',
            [collectionId, userId]
        );
        
        return { success: true };
    }

    /**
     * Move bookmark to collection
     */
    async moveToCollection(bookmarkId, userId, collectionId) {
        const query = `
            UPDATE bookmarks
            SET collection_id = ?
            WHERE id = ? AND user_id = ?
        `;
        
        await db.execute(query, [collectionId, bookmarkId, userId]);
        
        return { success: true };
    }

    /**
     * Get bookmark statistics
     */
    async getBookmarkStats(userId) {
        const [stats] = await db.execute(`
            SELECT 
                COUNT(*) as total_bookmarks,
                COUNT(DISTINCT collection_id) as total_collections,
                COUNT(DISTINCT DATE(created_at)) as days_active
            FROM bookmarks
            WHERE user_id = ?
        `, [userId]);
        
        return stats[0];
    }
}

module.exports = new BookmarkService();
