const { UserActivity } = require("../models");

class ActivityTrackingService {
  // Log user activity
  async logActivity(userId, activityType, postId = null, details = null) {
    try {
      await UserActivity.create({
        user_id: userId,
        activity_type: activityType,
        post_id: postId,
        details,
      });
    } catch (error) {
      console.error("Lỗi ghi log hoạt động:", error);
    }
  }

  // Get user activity history
  async getUserActivityHistory(userId, limit = 20) {
    return await UserActivity.findAll({
      where: { user_id: userId },
      order: [["createdAt", "DESC"]],
      limit,
    });
  }

  // Get activity statistics
  async getActivityStats(userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activities = await UserActivity.findAll({
      where: {
        user_id: userId,
        createdAt: { [require("sequelize").Op.gte]: startDate },
      },
    });

    const stats = {
      total: activities.length,
      byType: {},
    };

    activities.forEach((activity) => {
      stats.byType[activity.activity_type] =
        (stats.byType[activity.activity_type] || 0) + 1;
    });

    return stats;
  }

  // Get platform-wide activity
  async getPlatformActivity(hours = 24) {
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - hours);

    return await UserActivity.findAll({
      where: {
        createdAt: { [require("sequelize").Op.gte]: startDate },
      },
      attributes: [
        [require("sequelize").fn("COUNT", "*"), "count"],
        "activity_type",
      ],
      group: ["activity_type"],
      raw: true,
    });
  }
}

module.exports = new ActivityTrackingService();
