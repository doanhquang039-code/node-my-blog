const { Post, ScheduledPost } = require("../models");
const { Op } = require("sequelize");

class ScheduleService {
  // Schedule post for publication
  async schedulePost(postId, scheduledAt, status = "pending") {
    const post = await Post.findByPk(postId);
    if (!post) throw new Error("Bài viết không tồn tại");

    if (new Date(scheduledAt) <= new Date()) {
      throw new Error("Thời gian lên lịch phải trong tương lai");
    }

    const [scheduled] = await ScheduledPost.findOrCreate({
      where: { post_id: postId },
      defaults: {
        post_id: postId,
        scheduled_at: scheduledAt,
        is_published: false,
      },
    });

    return scheduled;
  }

  // Get scheduled posts
  async getScheduledPosts(limit = 10) {
    return await ScheduledPost.findAll({
      where: { is_published: false },
      include: [
        {
          model: Post,
          attributes: ["id", "title", "slug", "user_id"],
          include: ["author"],
        },
      ],
      order: [["scheduled_at", "ASC"]],
      limit,
    });
  }

  // Publish scheduled posts (run periodically)
  async publishScheduledPosts() {
    const now = new Date();
    const scheduled = await ScheduledPost.findAll({
      where: {
        is_published: false,
        scheduled_at: { [Op.lte]: now },
      },
      include: [Post],
    });

    const published = [];

    for (const schedule of scheduled) {
      try {
        schedule.Post.status = "approved";
        await schedule.Post.save();

        schedule.is_published = true;
        schedule.published_at = now;
        await schedule.save();

        published.push({
          id: schedule.post_id,
          title: schedule.Post.title,
        });
      } catch (error) {
        console.error(`Lỗi xuất bản bài ${schedule.post_id}:`, error);
      }
    }

    return published;
  }

  // Update schedule
  async updateSchedule(scheduleId, newScheduledAt) {
    const schedule = await ScheduledPost.findByPk(scheduleId);
    if (!schedule) throw new Error("Lịch không tồn tại");

    if (schedule.is_published) {
      throw new Error("Không thể thay đổi lịch của bài đã xuất bản");
    }

    schedule.scheduled_at = newScheduledAt;
    await schedule.save();
    return schedule;
  }

  // Cancel schedule
  async cancelSchedule(scheduleId) {
    const schedule = await ScheduledPost.findByPk(scheduleId);
    if (!schedule) throw new Error("Lịch không tồn tại");

    await schedule.destroy();
    return true;
  }
}

module.exports = new ScheduleService();
