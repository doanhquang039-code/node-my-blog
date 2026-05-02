-- ============================================
-- PHASE 3: ENGAGEMENT FEATURES MIGRATION
-- Date: May 2, 2026
-- Version: 2.3.0
-- ============================================

-- ============ SOCIAL MEDIA TABLES ============

-- Post shares tracking
CREATE TABLE IF NOT EXISTS post_shares (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    user_id INT,
    platform VARCHAR(50) NOT NULL COMMENT 'facebook, twitter, linkedin, whatsapp, email, etc.',
    shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_post_shares_post_id (post_id),
    INDEX idx_post_shares_platform (platform),
    INDEX idx_post_shares_shared_at (shared_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Social media referrals tracking
CREATE TABLE IF NOT EXISTS social_referrals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    source VARCHAR(100) NOT NULL COMMENT 'facebook, twitter, google, direct, etc.',
    user_id INT,
    visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_social_referrals_post_id (post_id),
    INDEX idx_social_referrals_source (source),
    INDEX idx_social_referrals_visited_at (visited_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============ BOOKMARK TABLES ============

-- Bookmark collections
CREATE TABLE IF NOT EXISTS bookmark_collections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_bookmark_collections_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bookmarks
CREATE TABLE IF NOT EXISTS bookmarks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    collection_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (collection_id) REFERENCES bookmark_collections(id) ON DELETE SET NULL,
    UNIQUE KEY unique_user_post (user_id, post_id),
    INDEX idx_bookmarks_user_id (user_id),
    INDEX idx_bookmarks_post_id (post_id),
    INDEX idx_bookmarks_collection_id (collection_id),
    INDEX idx_bookmarks_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============ REACTION TABLES ============

-- Post reactions (emoji reactions)
CREATE TABLE IF NOT EXISTS post_reactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    reaction_type VARCHAR(20) NOT NULL COMMENT 'like, love, haha, wow, sad, angry, thinking, fire, clap, rocket',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_post_reaction (user_id, post_id),
    INDEX idx_post_reactions_post_id (post_id),
    INDEX idx_post_reactions_reaction_type (reaction_type),
    INDEX idx_post_reactions_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============ READING PROGRESS TABLES ============

-- Reading progress tracking
CREATE TABLE IF NOT EXISTS reading_progress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    progress INT DEFAULT 0 COMMENT 'Progress percentage (0-100)',
    scroll_position INT DEFAULT 0 COMMENT 'Scroll position in pixels',
    is_completed BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_post_progress (user_id, post_id),
    INDEX idx_reading_progress_user_id (user_id),
    INDEX idx_reading_progress_post_id (post_id),
    INDEX idx_reading_progress_is_completed (is_completed),
    INDEX idx_reading_progress_last_read_at (last_read_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============ SAMPLE DATA ============

-- Insert sample bookmark collections
INSERT INTO bookmark_collections (user_id, name, description) VALUES
(1, 'Favorites', 'My favorite articles'),
(1, 'To Read Later', 'Articles I want to read later'),
(1, 'Tech Articles', 'Technology related articles');

-- ============ INDEXES FOR PERFORMANCE ============

-- Additional indexes for better query performance (skip if exists)
-- CREATE INDEX idx_posts_status_created_at ON posts(status, created_at);
-- CREATE INDEX idx_posts_user_status ON posts(user_id, status);
-- CREATE INDEX idx_post_analytics_post_views ON post_analytics(post_id, views);
-- CREATE INDEX idx_post_analytics_post_likes ON post_analytics(post_id, likes);

-- ============ VIEWS FOR ANALYTICS ============

-- View for post engagement summary
CREATE OR REPLACE VIEW post_engagement_summary AS
SELECT 
    p.id,
    p.title,
    p.slug,
    COALESCE(pa.views, 0) as views,
    COALESCE(pa.likes, 0) as likes,
    COALESCE(pa.shares, 0) as shares,
    COUNT(DISTINCT pr.id) as reactions,
    COUNT(DISTINCT b.id) as bookmarks,
    COUNT(DISTINCT rp.id) as readers,
    COUNT(DISTINCT CASE WHEN rp.is_completed = 1 THEN rp.id END) as completed_reads
FROM posts p
LEFT JOIN post_analytics pa ON p.id = pa.post_id
LEFT JOIN post_reactions pr ON p.id = pr.post_id
LEFT JOIN bookmarks b ON p.id = b.post_id
LEFT JOIN reading_progress rp ON p.id = rp.post_id
WHERE p.status = 'published'
GROUP BY p.id;

-- View for user engagement summary
CREATE OR REPLACE VIEW user_engagement_summary AS
SELECT 
    u.id,
    u.name,
    u.email,
    COUNT(DISTINCT b.id) as total_bookmarks,
    COUNT(DISTINCT pr.id) as total_reactions,
    COUNT(DISTINCT rp.id) as total_posts_read,
    COUNT(DISTINCT CASE WHEN rp.is_completed = 1 THEN rp.id END) as completed_posts,
    COUNT(DISTINCT ps.id) as total_shares
FROM users u
LEFT JOIN bookmarks b ON u.id = b.user_id
LEFT JOIN post_reactions pr ON u.id = pr.user_id
LEFT JOIN reading_progress rp ON u.id = rp.user_id
LEFT JOIN post_shares ps ON u.id = ps.user_id
GROUP BY u.id;

-- ============ TRIGGERS ============

-- Trigger to update post analytics when reaction is added
DELIMITER //
CREATE TRIGGER after_reaction_insert
AFTER INSERT ON post_reactions
FOR EACH ROW
BEGIN
    UPDATE post_analytics 
    SET likes = likes + 1 
    WHERE post_id = NEW.post_id;
END//
DELIMITER ;

-- Trigger to update post analytics when reaction is deleted
DELIMITER //
CREATE TRIGGER after_reaction_delete
AFTER DELETE ON post_reactions
FOR EACH ROW
BEGIN
    UPDATE post_analytics 
    SET likes = GREATEST(likes - 1, 0)
    WHERE post_id = OLD.post_id;
END//
DELIMITER ;

-- ============ STORED PROCEDURES ============

-- Procedure to get user reading statistics
DELIMITER //
CREATE PROCEDURE GetUserReadingStats(IN p_user_id INT)
BEGIN
    SELECT 
        COUNT(*) as total_posts_read,
        COUNT(CASE WHEN is_completed = 1 THEN 1 END) as completed_posts,
        COUNT(CASE WHEN is_completed = 0 AND progress > 0 THEN 1 END) as in_progress_posts,
        AVG(progress) as average_progress,
        COUNT(DISTINCT DATE(last_read_at)) as days_active,
        MAX(last_read_at) as last_read_date
    FROM reading_progress
    WHERE user_id = p_user_id;
END//
DELIMITER ;

-- Procedure to get post engagement metrics
DELIMITER //
CREATE PROCEDURE GetPostEngagementMetrics(IN p_post_id INT)
BEGIN
    SELECT 
        p.id,
        p.title,
        COALESCE(pa.views, 0) as views,
        COALESCE(pa.likes, 0) as likes,
        COALESCE(pa.shares, 0) as shares,
        COUNT(DISTINCT pr.id) as reactions,
        COUNT(DISTINCT b.id) as bookmarks,
        COUNT(DISTINCT rp.id) as readers,
        COUNT(DISTINCT CASE WHEN rp.is_completed = 1 THEN rp.id END) as completed_reads,
        AVG(rp.progress) as average_progress
    FROM posts p
    LEFT JOIN post_analytics pa ON p.id = pa.post_id
    LEFT JOIN post_reactions pr ON p.id = pr.post_id
    LEFT JOIN bookmarks b ON p.id = b.post_id
    LEFT JOIN reading_progress rp ON p.id = rp.post_id
    WHERE p.id = p_post_id
    GROUP BY p.id;
END//
DELIMITER ;

-- ============ COMPLETION MESSAGE ============

SELECT 'Phase 3 Migration Completed Successfully!' as Status;
SELECT 'New Tables Created: 7' as Info;
SELECT 'New Views Created: 2' as Info;
SELECT 'New Triggers Created: 2' as Info;
SELECT 'New Stored Procedures Created: 2' as Info;
