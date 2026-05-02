const db = require('../config/db');

class AdvancedFilterService {
    /**
     * Advanced post filtering with multiple criteria
     */
    async filterPosts(filters = {}) {
        const {
            // Text search
            search = '',
            
            // Category & Tags
            categoryId = null,
            tags = [],
            
            // Date range
            dateFrom = null,
            dateTo = null,
            
            // Author
            authorId = null,
            
            // Status
            status = 'published', // published, draft, scheduled
            
            // Popularity
            minViews = 0,
            minLikes = 0,
            minComments = 0,
            
            // Rating
            minRating = 0,
            
            // Reading time
            minReadingTime = 0,
            maxReadingTime = null,
            
            // Featured
            isFeatured = null,
            
            // Sorting
            sortBy = 'created_at', // created_at, views, likes, comments, rating, title
            sortOrder = 'DESC', // ASC, DESC
            
            // Pagination
            page = 1,
            limit = 20
        } = filters;

        const offset = (page - 1) * limit;
        
        // Build WHERE clause
        let whereConditions = [];
        let params = [];
        
        // Status filter
        if (status) {
            whereConditions.push('p.status = ?');
            params.push(status);
        }
        
        // Text search (title, content, excerpt)
        if (search) {
            whereConditions.push('(p.title LIKE ? OR p.content LIKE ? OR p.excerpt LIKE ?)');
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }
        
        // Category filter
        if (categoryId) {
            whereConditions.push('p.category_id = ?');
            params.push(categoryId);
        }
        
        // Author filter
        if (authorId) {
            whereConditions.push('p.author_id = ?');
            params.push(authorId);
        }
        
        // Date range filter
        if (dateFrom) {
            whereConditions.push('p.created_at >= ?');
            params.push(dateFrom);
        }
        if (dateTo) {
            whereConditions.push('p.created_at <= ?');
            params.push(dateTo);
        }
        
        // Popularity filters
        if (minViews > 0) {
            whereConditions.push('COALESCE(pa.views, 0) >= ?');
            params.push(minViews);
        }
        if (minLikes > 0) {
            whereConditions.push('COALESCE(pa.likes, 0) >= ?');
            params.push(minLikes);
        }
        if (minComments > 0) {
            whereConditions.push('COALESCE(pa.comments_count, 0) >= ?');
            params.push(minComments);
        }
        
        // Rating filter
        if (minRating > 0) {
            whereConditions.push('COALESCE(pa.average_rating, 0) >= ?');
            params.push(minRating);
        }
        
        // Reading time filter
        if (minReadingTime > 0) {
            whereConditions.push('p.reading_time >= ?');
            params.push(minReadingTime);
        }
        if (maxReadingTime) {
            whereConditions.push('p.reading_time <= ?');
            params.push(maxReadingTime);
        }
        
        // Featured filter
        if (isFeatured !== null) {
            whereConditions.push('p.is_featured = ?');
            params.push(isFeatured ? 1 : 0);
        }
        
        const whereClause = whereConditions.length > 0 
            ? 'WHERE ' + whereConditions.join(' AND ')
            : '';
        
        // Build ORDER BY clause
        const validSortColumns = {
            'created_at': 'p.created_at',
            'updated_at': 'p.updated_at',
            'title': 'p.title',
            'views': 'COALESCE(pa.views, 0)',
            'likes': 'COALESCE(pa.likes, 0)',
            'comments': 'COALESCE(pa.comments_count, 0)',
            'rating': 'COALESCE(pa.average_rating, 0)',
            'reading_time': 'p.reading_time'
        };
        
        const orderColumn = validSortColumns[sortBy] || 'p.created_at';
        const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        
        // Main query
        const query = `
            SELECT 
                p.*,
                u.name as author_name,
                u.email as author_email,
                c.name as category_name,
                COALESCE(pa.views, 0) as views,
                COALESCE(pa.likes, 0) as likes,
                COALESCE(pa.shares, 0) as shares,
                COALESCE(pa.comments_count, 0) as comments_count,
                COALESCE(pa.average_rating, 0) as average_rating,
                GROUP_CONCAT(DISTINCT t.name) as tags
            FROM posts p
            LEFT JOIN users u ON p.author_id = u.id
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN post_analytics pa ON p.id = pa.post_id
            LEFT JOIN post_tag pt ON p.id = pt.post_id
            LEFT JOIN tags t ON pt.tag_id = t.id
            ${whereClause}
            GROUP BY p.id
            ORDER BY ${orderColumn} ${orderDirection}
            LIMIT ? OFFSET ?
        `;
        
        params.push(limit, offset);
        
        const [posts] = await db.execute(query, params);
        
        // Get total count
        const countQuery = `
            SELECT COUNT(DISTINCT p.id) as total
            FROM posts p
            LEFT JOIN post_analytics pa ON p.id = pa.post_id
            ${whereClause}
        `;
        
        const [countResult] = await db.execute(countQuery, params.slice(0, -2));
        const total = countResult[0].total;
        
        return {
            posts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1
            },
            filters: filters
        };
    }

    /**
     * Get filter options (for UI dropdowns)
     */
    async getFilterOptions() {
        // Get categories
        const [categories] = await db.execute(
            'SELECT id, name FROM categories WHERE is_active = true ORDER BY name'
        );
        
        // Get tags
        const [tags] = await db.execute(
            'SELECT id, name FROM tags ORDER BY name'
        );
        
        // Get authors
        const [authors] = await db.execute(
            'SELECT id, name FROM users WHERE role IN ("admin", "author") ORDER BY name'
        );
        
        // Get date range
        const [dateRange] = await db.execute(`
            SELECT 
                MIN(created_at) as min_date,
                MAX(created_at) as max_date
            FROM posts
        `);
        
        // Get statistics for ranges
        const [stats] = await db.execute(`
            SELECT 
                MAX(pa.views) as max_views,
                MAX(pa.likes) as max_likes,
                MAX(pa.comments_count) as max_comments,
                MAX(pa.average_rating) as max_rating,
                MAX(p.reading_time) as max_reading_time
            FROM posts p
            LEFT JOIN post_analytics pa ON p.id = pa.post_id
        `);
        
        return {
            categories,
            tags,
            authors,
            dateRange: dateRange[0],
            stats: stats[0],
            sortOptions: [
                { value: 'created_at', label: 'Ngày tạo' },
                { value: 'updated_at', label: 'Ngày cập nhật' },
                { value: 'title', label: 'Tiêu đề' },
                { value: 'views', label: 'Lượt xem' },
                { value: 'likes', label: 'Lượt thích' },
                { value: 'comments', label: 'Bình luận' },
                { value: 'rating', label: 'Đánh giá' },
                { value: 'reading_time', label: 'Thời gian đọc' }
            ],
            statusOptions: [
                { value: 'published', label: 'Đã xuất bản' },
                { value: 'draft', label: 'Bản nháp' },
                { value: 'scheduled', label: 'Đã lên lịch' }
            ]
        };
    }

    /**
     * Save user filter preset
     */
    async saveFilterPreset(userId, name, filters) {
        const query = `
            INSERT INTO filter_presets (user_id, name, filters, created_at)
            VALUES (?, ?, ?, NOW())
        `;
        
        const [result] = await db.execute(query, [
            userId,
            name,
            JSON.stringify(filters)
        ]);
        
        return result.insertId;
    }

    /**
     * Get user filter presets
     */
    async getUserFilterPresets(userId) {
        const query = `
            SELECT id, name, filters, created_at
            FROM filter_presets
            WHERE user_id = ?
            ORDER BY created_at DESC
        `;
        
        const [presets] = await db.execute(query, [userId]);
        
        return presets.map(preset => ({
            ...preset,
            filters: typeof preset.filters === 'string' 
                ? JSON.parse(preset.filters) 
                : preset.filters
        }));
    }

    /**
     * Delete filter preset
     */
    async deleteFilterPreset(presetId, userId) {
        const query = `
            DELETE FROM filter_presets
            WHERE id = ? AND user_id = ?
        `;
        
        await db.execute(query, [presetId, userId]);
    }
}

module.exports = new AdvancedFilterService();
