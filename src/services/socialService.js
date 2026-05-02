const db = require('../config/db');

class SocialService {
    /**
     * Share post to social media
     */
    async sharePost(postId, userId, platform) {
        const query = `
            INSERT INTO post_shares (post_id, user_id, platform, shared_at)
            VALUES (?, ?, ?, NOW())
        `;
        
        await db.execute(query, [postId, userId, platform]);
        
        // Update share count in analytics
        await db.execute(`
            UPDATE post_analytics 
            SET shares = shares + 1 
            WHERE post_id = ?
        `, [postId]);
        
        return { success: true };
    }

    /**
     * Get share statistics
     */
    async getShareStats(postId) {
        const query = `
            SELECT 
                platform,
                COUNT(*) as count
            FROM post_shares
            WHERE post_id = ?
            GROUP BY platform
        `;
        
        const [stats] = await db.execute(query, [postId]);
        
        return stats;
    }

    /**
     * Get trending posts on social media
     */
    async getTrendingPosts(days = 7, limit = 10) {
        const query = `
            SELECT 
                p.*,
                COUNT(ps.id) as share_count,
                u.name as author_name
            FROM posts p
            LEFT JOIN post_shares ps ON p.id = ps.post_id 
                AND ps.shared_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            LEFT JOIN users u ON p.author_id = u.id
            WHERE p.status = 'published'
            GROUP BY p.id
            HAVING share_count > 0
            ORDER BY share_count DESC
            LIMIT ?
        `;
        
        const [posts] = await db.execute(query, [days, limit]);
        
        return posts;
    }

    /**
     * Get social media preview data (Open Graph)
     */
    async getSocialPreview(postId) {
        const query = `
            SELECT 
                p.title,
                p.excerpt,
                p.featured_image,
                p.slug,
                u.name as author_name,
                c.name as category_name
            FROM posts p
            LEFT JOIN users u ON p.author_id = u.id
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = ?
        `;
        
        const [posts] = await db.execute(query, [postId]);
        
        if (posts.length === 0) return null;
        
        const post = posts[0];
        
        return {
            title: post.title,
            description: post.excerpt || post.title,
            image: post.featured_image,
            url: `/posts/${post.slug}`,
            author: post.author_name,
            category: post.category_name,
            type: 'article'
        };
    }

    /**
     * Track social media referrals
     */
    async trackReferral(postId, source, userId = null) {
        const query = `
            INSERT INTO social_referrals (post_id, source, user_id, visited_at)
            VALUES (?, ?, ?, NOW())
        `;
        
        await db.execute(query, [postId, source, userId]);
    }

    /**
     * Get referral statistics
     */
    async getReferralStats(postId) {
        const query = `
            SELECT 
                source,
                COUNT(*) as visits,
                COUNT(DISTINCT user_id) as unique_visitors
            FROM social_referrals
            WHERE post_id = ?
            GROUP BY source
            ORDER BY visits DESC
        `;
        
        const [stats] = await db.execute(query, [postId]);
        
        return stats;
    }
}

module.exports = new SocialService();
