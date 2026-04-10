// Scheduler utility for publishing scheduled posts
// Add to app.js or create a separate service

const scheduleService = require("../services/scheduleService");

// Default: Check every minute (60000 ms)
let schedulerInterval = null;

const startScheduler = (intervalMs = 60000) => {
  if (schedulerInterval) {
    console.log("⚠️ Scheduler already running");
    return;
  }

  console.log(`🕐 Starting post scheduler (check every ${intervalMs}ms)`);

  schedulerInterval = setInterval(async () => {
    try {
      const published = await scheduleService.publishScheduledPosts();
      if (published.length > 0) {
        console.log(`✅ Published ${published.length} scheduled posts:`, published);
      }
    } catch (error) {
      console.error("❌ Scheduler error:", error.message);
    }
  }, intervalMs);

  // Clean exit
  process.on("SIGTERM", stopScheduler);
  process.on("SIGINT", stopScheduler);
};

const stopScheduler = () => {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log("🛑 Post scheduler stopped");
  }
};

module.exports = {
  startScheduler,
  stopScheduler,
};
