const scheduleService = require("../services/scheduleService");

exports.schedulePost = async (req, res) => {
  try {
    const { postId, scheduledAt } = req.body;

    if (!postId || !scheduledAt) {
      return res
        .status(400)
        .json({ error: "postId và scheduledAt là bắt buộc" });
    }

    const scheduled = await scheduleService.schedulePost(
      postId,
      new Date(scheduledAt)
    );

    res.json({ message: "Đã lên lịch bài viết", scheduled });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getScheduledPosts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const scheduled = await scheduleService.getScheduledPosts(parseInt(limit));

    res.json(scheduled);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { scheduledAt } = req.body;

    if (!scheduledAt) {
      return res.status(400).json({ error: "scheduledAt là bắt buộc" });
    }

    const updated = await scheduleService.updateSchedule(
      scheduleId,
      new Date(scheduledAt)
    );

    res.json({ message: "Đã cập nhật lịch", updated });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.cancelSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    await scheduleService.cancelSchedule(scheduleId);

    res.json({ message: "Đã hủy lịch" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Cron job to publish scheduled posts
exports.publishScheduled = async (req, res) => {
  try {
    const published = await scheduleService.publishScheduledPosts();
    res.json({ message: "Xuất bản bài viết", published });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
