const activityTrackingService = require("../services/activityTrackingService");

exports.logActivity = async (req, res) => {
  try {
    const { activityType, postId, details } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Cần đăng nhập" });
    }

    await activityTrackingService.logActivity(userId, activityType, postId, details);

    res.json({ message: "Đã ghi lại hoạt động" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserActivityHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20 } = req.query;

    const history = await activityTrackingService.getUserActivityHistory(
      userId,
      parseInt(limit)
    );

    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getActivityStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;

    const stats = await activityTrackingService.getActivityStats(
      userId,
      parseInt(days)
    );

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPlatformActivity = async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const activity = await activityTrackingService.getPlatformActivity(
      parseInt(hours)
    );

    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
