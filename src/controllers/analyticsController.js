const analyticsService = require("../services/analyticsService");

exports.getDashboard = async (req, res) => {
  try {
    const overview = await analyticsService.getDashboardOverview();
    const monthlyData = await analyticsService.getMonthlyActivity(6);
    const categoryStats = await analyticsService.getCategoryStats();

    res.render("analytics/dashboard", {
      overview,
      monthlyData: JSON.stringify(monthlyData),
      categoryStats,
      user: req.user,
    });
  } catch (error) {
    res.status(500).send("Lỗi analytics: " + error.message);
  }
};

exports.getPostAnalytics = async (req, res) => {
  try {
    const { postId } = req.params;
    const analytics = await analyticsService.getPostAnalytics(postId);

    if (!analytics) {
      return res.status(404).json({ error: "Không tìm thấy bài viết" });
    }

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Cần có ngày bắt đầu và kết thúc" });
    }

    const report = await analyticsService.getAnalyticsReport(
      new Date(startDate),
      new Date(endDate)
    );

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;
    const analytics = await analyticsService.getUserAnalytics(userId);

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
