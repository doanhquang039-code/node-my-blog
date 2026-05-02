require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkStatus() {
  let connection;
  
  try {
    console.log('🔍 Checking Phase 3 Migration Status...\n');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'node_blog_db'
    });
    
    console.log('✅ Connected to database\n');
    
    // Check tables
    const requiredTables = [
      'post_shares',
      'social_referrals',
      'bookmark_collections',
      'bookmarks',
      'post_reactions',
      'reading_progress'
    ];
    
    const [tables] = await connection.query('SHOW TABLES');
    const existingTables = tables.map(t => Object.values(t)[0]);
    
    console.log('📊 Table Status:');
    requiredTables.forEach(table => {
      const exists = existingTables.includes(table);
      console.log(`   ${exists ? '✅' : '❌'} ${table}`);
    });
    
    // Check views
    console.log('\n📈 View Status:');
    const [views] = await connection.query("SHOW FULL TABLES WHERE Table_type = 'VIEW'");
    const existingViews = views.map(v => Object.values(v)[0]);
    
    const requiredViews = ['post_engagement_summary', 'user_engagement_summary'];
    requiredViews.forEach(view => {
      const exists = existingViews.includes(view);
      console.log(`   ${exists ? '✅' : '❌'} ${view}`);
    });
    
    // Check triggers
    console.log('\n⚡ Trigger Status:');
    const [triggers] = await connection.query('SHOW TRIGGERS');
    const existingTriggers = triggers.map(t => t.Trigger);
    
    const requiredTriggers = ['after_reaction_insert', 'after_reaction_delete'];
    requiredTriggers.forEach(trigger => {
      const exists = existingTriggers.includes(trigger);
      console.log(`   ${exists ? '✅' : '❌'} ${trigger}`);
    });
    
    // Check procedures
    console.log('\n🔧 Stored Procedure Status:');
    const [procedures] = await connection.query('SHOW PROCEDURE STATUS WHERE Db = ?', [process.env.DB_NAME]);
    const existingProcedures = procedures.map(p => p.Name);
    
    const requiredProcedures = ['GetUserReadingStats', 'GetPostEngagementMetrics'];
    requiredProcedures.forEach(proc => {
      const exists = existingProcedures.includes(proc);
      console.log(`   ${exists ? '✅' : '❌'} ${proc}`);
    });
    
    // Check sample data
    console.log('\n📝 Sample Data Status:');
    const [collections] = await connection.query('SELECT COUNT(*) as count FROM bookmark_collections');
    console.log(`   Bookmark collections: ${collections[0].count}`);
    
    console.log('\n' + '='.repeat(50));
    
    const allTablesExist = requiredTables.every(t => existingTables.includes(t));
    const allViewsExist = requiredViews.every(v => existingViews.includes(v));
    const allTriggersExist = requiredTriggers.every(t => existingTriggers.includes(t));
    const allProceduresExist = requiredProcedures.every(p => existingProcedures.includes(p));
    
    if (allTablesExist && allViewsExist && allTriggersExist && allProceduresExist) {
      console.log('\n🎉 Phase 3 Migration is COMPLETE!');
      console.log('✅ All tables, views, triggers, and procedures exist.');
      console.log('\n🚀 Ready to start server and test APIs!');
    } else {
      console.log('\n⚠️  Phase 3 Migration is INCOMPLETE!');
      console.log('Some components are missing. Need to complete migration.');
    }
    
    console.log('='.repeat(50) + '\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkStatus();
