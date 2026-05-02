const db = require('../config/db');

class ReactionService {
    /**
     * Available reaction types
     */
    static REACTIONS = {
        LIKE: 'like',           // 👍
        LOVE: 'love',           // ❤️
        HAHA: 'haha',           // 😂
        WOW: 'wow',             // 😮
        SAD: 'sad',             // 😢
        ANGRY: 'angry',         // 😠
        THINKING: 'thinking',   // 🤔
        FIRE: 'fire',           // 🔥
        CLAP: 'clap',           // 👏
        ROCKET: 'rocket'        // 🚀
    };

    /**
     * Add or update reaction
     */
    async addReaction(userId, postId, reactionType) {
        // Validate reaction type
        if (!Object.values(ReactionService.REACTIONS).includes(reactionType)) {
            throw new Error('Invalid reaction type');
        }

        // Check if user already reacted
        const [existing] = await db.execute(
            'SELECT id, reaction_type FROM post_reactions WHERE user_id = ? AND post_id = ?',
            [userId, postId]
        );

        if (existing.length > 0) {
            // Update existing reaction
            if (existing[0].reaction_type === reactionType) {
                // Same reaction - remove it
                await this.removeReaction(userId, postId);
                return { success: true, action: 'removed' };
            } else {
                // Different reaction - update it
                await db.execute(
                    'UPDATE post_reactions SET reaction_type = ?, created_at = NOW() WHERE id = ?',
                    [reactionType, existing[0].id]
                );
                return { success: true, action: 'updated', reactionType };
            }
        } else {
            // Add new reaction
            await db.execute(
                'INSERT INTO post_reactions (user_id, post_id, reaction_type, created_at) VALUES (?, ?, ?, NOW())',
                [userId, postId, reactionType]
            );
            return { success: true, action: 'added', reactionType };
        }
    }

    /**
     * Remove reaction
     */
    async removeReaction(userId, postId) {
        await db.execute(
            'DELETE FROM post_reactions WHERE user_id = ? AND post_id = ?',
            [userId, postId]
        );
        
        return { success: true };
    }

    /**
     * Get post reactions summary
     */
    async getPostReactions(postId) {
        const query = `
            SELECT 
                reaction_type,
                COUNT(*) as count
            FROM post_reactions
            WHERE post_id = ?
            GROUP BY reaction_type
            ORDER BY count DESC
        `;
        
        const [reactions] = await db.execute(query, [postId]);
        
        // Get total count
        const [totalResult] = await db.execute(
            'SELECT COUNT(*) as total FROM post_reactions WHERE post_id = ?',
            [postId]
        );
        
        return {
            reactions,
            total: totalResult[0].total
        };
    }

    /**
     * Get user's reaction to post
     */
    async getUserReaction(userId, postId) {
        const [result] = await db.execute(
            'SELECT reaction_type FROM post_reactions WHERE user_id = ? AND post_id = ?',
            [userId, postId]
        );
        
        return result.length > 0 ? result[0].reaction_type : null;
    }

    /**
     * Get users who reacted
     */
    async getReactionUsers(postId, reactionType = null, limit = 50) {
        let query = `
            SELECT 
                pr.reaction_type,
                u.id,
                u.name,
                u.email,
                pr.created_at
            FROM post_reactions pr
            JOIN users u ON pr.user_id = u.id
            WHERE pr.post_id = ?
        `;
        
        const params = [postId];
        
        if (reactionType) {
            query += ' AND pr.reaction_type = ?';
            params.push(reactionType);
        }
        
        query += ' ORDER BY pr.created_at DESC LIMIT ?';
        params.push(limit);
        
        const [users] = await db.execute(query, params);
        
        return users;
    }

    /**
     * Get trending reactions
     */
    async getTrendingReactions(days = 7, limit = 10) {
        const query = `
            SELECT 
                p.id,
                p.title,
                p.slug,
                COUNT(pr.id) as reaction_count,
                GROUP_CONCAT(DISTINCT pr.reaction_type) as reaction_types
            FROM posts p
            JOIN post_reactions pr ON p.id = pr.post_id
            WHERE pr.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY p.id
            ORDER BY reaction_count DESC
            LIMIT ?
        `;
        
        const [posts] = await db.execute(query, [days, limit]);
        
        return posts;
    }

    /**
     * Get reaction statistics
     */
    async getReactionStats(postId) {
        const query = `
            SELECT 
                reaction_type,
                COUNT(*) as count,
                COUNT(DISTINCT DATE(created_at)) as days_active
            FROM post_reactions
            WHERE post_id = ?
            GROUP BY reaction_type
        `;
        
        const [stats] = await db.execute(query, [postId]);
        
        return stats;
    }

    /**
     * Get user's reaction history
     */
    async getUserReactionHistory(userId, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        
        const query = `
            SELECT 
                pr.*,
                p.title,
                p.slug,
                p.featured_image
            FROM post_reactions pr
            JOIN posts p ON pr.post_id = p.id
            WHERE pr.user_id = ?
            ORDER BY pr.created_at DESC
            LIMIT ? OFFSET ?
        `;
        
        const [reactions] = await db.execute(query, [userId, limit, offset]);
        
        return reactions;
    }
}

module.exports = new ReactionService();
