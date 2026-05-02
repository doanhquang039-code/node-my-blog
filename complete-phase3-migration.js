require('dotenv').config();
const mysql = require('mysql2/promise');

async function completeMigration() {
  let connection;
  
  try {
    console.log('🚀 Completing Phase 3 Migration...\n');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'node_blog_db',
      multipleStatements: true
    });
    
    console.log('✅ Connected to database\n');
    
    // Create Views
    console.log('📈 Creating views...');
    
    // Note: Using postanalytics (no underscore) as that's the actual table name
    // Columns: view_count, like_count (no shares column)
    await connection.query(`
      CREATE OR REPLACE VIEW post_engagement_summary AS
      SELECT 
          p.id,
          p.title,
          p.slug,
          COALESCE(pa.view_count, 0) as views,
          COALESCE(pa.like_count, 0) as likes,
          COUNT(DISTINCT ps.id) as shares,
          COUNT(DISTINCT pr.id) as reactions,
          COUNT(DISTINCT b.id) as bookmarks,
          COUNT(DISTINCT rp.id) as readers,
          COUNT(DISTINCT CASE WHEN rp.is_completed = 1 THEN rp.id END) as completed_reads
      FROM posts p
      LEFT JOIN postanalytics pa ON p.id = pa.post_id
      LEFT JOIN post_shares ps ON p.id = ps.post_id
      LEFT JOIN post_reactions pr ON p.id = pr.post_id
      LEFT JOIN bookmarks b ON p.id = b.post_id
      LEFT JOIN reading_progress rp ON p.id = rp.post_id
      GROUP BY p.id
    `);
    console.log('   ✅ post_engagement_summary');
    
    await connection.query(`
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
      GROUP BY u.id
    `);
    console.log('   ✅ user_engagement_summary');
    
    // Create Triggers
    console.log('\n⚡ Creating triggers...');
    
    // Drop triggers if they exist
    await connection.query('DROP TRIGGER IF EXISTS after_reaction_insert');
    await connection.query('DROP TRIGGER IF EXISTS after_reaction_delete');
    
    await connection.query(`
      CREATE TRIGGER after_reaction_insert
      AFTER INSERT ON post_reactions
      FOR EACH ROW
      BEGIN
          UPDATE postanalytics 
          SET like_count = like_count + 1 
          WHERE post_id = NEW.post_id;
      END
    `);
    console.log('   ✅ after_reaction_insert');
    
    await connection.query(`
      CREATE TRIGGER after_reaction_delete
      AFTER DELETE ON post_reactions
      FOR EACH ROW
      BEGIN
          UPDATE postanalytics 
          SET like_count = GREATEST(like_count - 1, 0)
          WHERE post_id = OLD.post_id;
      END
    `);
    console.log('   ✅ after_reaction_delete');
    
    // Create Stored Procedures
    console.log('\n🔧 Creating stored procedures...');
    
    // Drop procedures if they exist
    await connection.query('DROP PROCEDURE IF EXISTS GetUserReadingStats');
    await connection.query('DROP PROCEDURE IF EXISTS GetPostEngagementMetrics');
    
    await connection.query(`
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
      END
    `);
    console.log('   ✅ GetUserReadingStats');
    
    await connection.query(`
      CREATE PROCEDURE GetPostEngagementMetrics(IN p_post_id INT)
      BEGIN
          SELECT 
              p.id,
              p.title,
              COALESCE(pa.view_count, 0) as views,
              COALESCE(pa.like_count, 0) as likes,
              COUNT(DISTINCT ps.id) as shares,
              COUNT(DISTINCT pr.id) as reactions,
              COUNT(DISTINCT b.id) as bookmarks,
              COUNT(DISTINCT rp.id) as readers,
              COUNT(DISTINCT CASE WHEN rp.is_completed = 1 THEN rp.id END) as completed_reads,
              AVG(rp.progress) as average_progress
          FROM posts p
          LEFT JOIN postanalytics pa ON p.id = pa.post_id
          LEFT JOIN post_shares ps ON p.id = ps.post_id
          LEFT JOIN post_reactions pr ON p.id = pr.post_id
          LEFT JOIN bookmarks b ON p.id = b.post_id
          LEFT JOIN reading_progress rp ON p.id = rp.post_id
          WHERE p.id = p_post_id
          GROUP BY p.id;
      END
    `);
    console.log('   ✅ GetPostEngagementMetrics');
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Phase 3 Migration COMPLETE!');
    console.log('='.repeat(60));
    console.log('\n✅ Created:');
    console.log('   - 2 Views (post_engagement_summary, user_engagement_summary)');
    console.log('   - 2 Triggers (after_reaction_insert, after_reaction_delete)');
    console.log('   - 2 Stored Procedures (GetUserReadingStats, GetPostEngagementMetrics)');
    console.log('\n🚀 Ready to start server and test engagement features!');
    console.log('   Run: npm start\n');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nError details:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed\n');
    }
  }
}

completeMigration();
