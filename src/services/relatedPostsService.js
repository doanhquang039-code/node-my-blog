const { Post, sequelize } = require("../models");
const { Op } = require("sequelize");

class RelatedPostsService {
  // Get related posts by tags and category
  async getRelatedPosts(postId, limit = 5) {
    const post = await Post.findByPk(postId, {
      include: ["Category", "Tags"],
    });

    if (!post) return [];

    const tagIds = post.Tags?.map((t) => t.id) || [];

    // Find posts with same tags or category, excluding current post
    const relatedPosts = await Post.findAll({
      where: {
        [Op.and]: [
          { id: { [Op.ne]: postId } },
          { status: "approved" },
          {
            [Op.or]: [
              { category_id: post.category_id },
              sequelize.where(
                sequelize.fn(
                  "EXISTS",
                  sequelize.literal(
                    `(SELECT 1 FROM post_tags pt WHERE pt.post_id = Post.id AND pt.tag_id IN (${tagIds.length > 0 ? tagIds.join(",") : "NULL"}))`
                  )
                ),
                Op.eq,
                true
              ),
            ],
          },
        ],
      },
      include: ["Category", "Tags"],
      limit,
      order: [["createdAt", "DESC"]],
    });

    return relatedPosts;
  }

  // Get recommended posts for user based on activity
  async getRecommendedPosts(userId, limit = 6) {
    // Get user's liked/viewed post tags
    const userActivity = await Post.findAll({
      where: { user_id: userId, status: "approved" },
      include: ["Tags"],
      limit: 10,
    });

    const userTagIds = new Set();
    userActivity.forEach((post) => {
      post.Tags?.forEach((tag) => userTagIds.add(tag.id));
    });

    // Find similar posts
    if (userTagIds.size === 0) {
      // If no user history, return trending posts
      return await Post.findAll({
        where: { status: "approved" },
        include: [{ association: "stats" }],
        order: [[sequelize.col("stats.view_count"), "DESC"]],
        limit,
      });
    }

    const tagArray = Array.from(userTagIds);
    const recommendations = await Post.findAll({
      where: {
        status: "approved",
        user_id: { [Op.ne]: userId },
      },
      include: [
        "Tags",
        { association: "stats" },
      ],
      limit: Math.max(limit * 2, 20),
    });

    // Score by matching tags
    const scored = recommendations
      .map((post) => ({
        ...post.toJSON(),
        score: post.Tags.filter((t) => tagArray.includes(t.id)).length,
      }))
      .filter((p) => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scored;
  }

  // Trendy/Similar algorithm
  async getTrendingRelated(categoryId, limit = 5) {
    return await Post.findAll({
      where: {
        category_id: categoryId,
        status: "approved",
      },
      include: [{ association: "stats" }],
      order: [[sequelize.col("stats.view_count"), "DESC"]],
      limit,
    });
  }
}

module.exports = new RelatedPostsService();
