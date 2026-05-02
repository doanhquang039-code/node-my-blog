require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function runMigration() {
  let connection;
  
  try {
    console.log('🚀 Starting Phase 3 Migration...\n');
    
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'node_blog_db',
      multipleStatements: true
    });
    
    console.log('✅ Connected to database\n');
    
    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations', 'phase3_engagement_features.sql');
    const sql = await fs.readFile(migrationPath, 'utf8');
    
    console.log('📄 Migration file loaded\n');
    console.log('⏳ Executing migration...\n');
    
    // Execute migration
    const [results] = await connection.query(sql);
    
    console.log('✅ Migration executed successfully!\n');
    
    // Show results
    if (Array.isArray(results)) {
      results.forEach((result, index) => {
        if (result && result.length > 0) {
          console.log(`Result ${index + 1}:`, result);
        }
      });
    }
    
    console.log('\n🎉 Phase 3 Migration Complete!\n');
    console.log('📊 New Tables Created:');
    console.log('   - post_shares');
    console.log('   - social_referrals');
    console.log('   - bookmark_collections');
    console.log('   - bookmarks');
    console.log('   - post_reactions');
    console.log('   - reading_progress');
    console.log('\n📈 New Views Created:');
    console.log('   - post_engagement_summary');
    console.log('   - user_engagement_summary');
    console.log('\n⚡ New Triggers Created:');
    console.log('   - after_reaction_insert');
    console.log('   - after_reaction_delete');
    console.log('\n🔧 New Stored Procedures Created:');
    console.log('   - GetUserReadingStats');
    console.log('   - GetPostEngagementMetrics');
    console.log('\n✨ Ready to use engagement features!\n');
    
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

runMigration();
