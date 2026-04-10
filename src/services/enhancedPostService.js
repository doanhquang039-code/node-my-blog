// Enhanced postService with new features
const { Post, Comment, PostAnalytics, User, Category, Tag, sequelize } = require("../models");
const { Op } = require("sequelize");
const slugify = require("slugify");
const seoService = require("./seoService");

class EnhancedPostService {
  // Get all posts with enhanced data
  async getAll() {
    return await Post.findAll({
      include: [
        { model: User, attributes: ["id", "name", "email"], as: "author" },
        { model: Category, as: "category" },
        { association: "stats" },
        { model: Tag, attributes: ["id", "name"], through: { attributes: [] } },
      ],
      order: [["createdAt", "DESC"]],
    });
  }

  // Create post with SEO optimization
  async createPost(data) {
    try {
      // Generate slug
      if (!data.slug) {
        data.slug = slugify(data.title, { lower: true, strict: true });
      }

      // Check slug uniqueness
      const existingSlug = await Post.findOne({
        where: { slug: data.slug },
      });
      if (existingSlug) {
        data.slug = `${data.slug}-${Date.now()}`;
      }

      const post = await Post.create(data);

      // Attach tags if provided
      if (data.tags && data.tags.length > 0) {
        await post.setTags(data.tags);
      }

      return post;
    } catch (error) {
      throw new Error(`Create post error: ${error.message}`);
    }
  }

  // Get post with all relationships
  async getById(id) {
    return await Post.findByPk(id, {
      include: [
        { model: User, attributes: ["id", "name", "email"], as: "author" },
        { model: Category, as: "category" },
        { association: "stats", attributes: ["view_count", "like_count"] },
        { association: "comments", include: [{ model: User, as: "author" }] },
        { model: Tag, attributes: ["id", "name"], through: { attributes: [] } },
      ],
    });
  }

  // Increment view count
  async incrementView(postId) {
    const analytics = await PostAnalytics.findOne({
      where: { post_id: postId },
    });
    if (analytics) {
      analytics.view_count = (analytics.view_count || 0) + 1;
      await analytics.save();
    }
  }

  // Increment like count
  async incrementLike(postId) {
    const analytics = await PostAnalytics.findOne({
      where: { post_id: postId },
    });
    if (analytics) {
      analytics.like_count = (analytics.like_count || 0) + 1;
      await analytics.save();
    }
  }

  // Update post
  async updatePost(id, data) {
    const post = await Post.findByPk(id);
    if (!post) throw new Error("Post not found");

    // Update slug if title changed
    if (data.title && data.title !== post.title) {
      data.slug = slugify(data.title, { lower: true, strict: true });
    }

    await post.update(data);

    // Update tags if provided
    if (data.tags) {
      await post.setTags(data.tags);
    }

    return post;
  }

  // Delete post
  async deletePost(id) {
    const post = await Post.findByPk(id);
    if (!post) throw new Error("Post not found");

    // Clean up relationships
    await post.setTags([]);
    await PostAnalytics.destroy({ where: { post_id: id } });
    await Comment.destroy({ where: { post_id: id } });

    return await post.destroy();
  }

  // Search with full text
  async searchPosts(query, filters = {}) {
    const where = {
      [Op.or]: [
        sequelize.where(
          sequelize.fn("LOWER", sequelize.col("title")),
          Op.like,
          `%${query.toLowerCase()}%`
        ),
        sequelize.where(
          sequelize.fn("LOWER", sequelize.col("content")),
          Op.like,
          `%${query.toLowerCase()}%`
        ),
      ],
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.categoryId) {
      where.category_id = filters.categoryId;
    }

    return await Post.findAll({
      where,
      include: [
        { model: User, as: "author" },
        { model: Category, as: "category" },
      ],
      limit: filters.limit || 10,
    });
  }

  // Get trending posts
  async getTrendingPosts(days = 7) {
    const date = new Date();
    date.setDate(date.getDate() - days);

    return await Post.findAll({
      where: {
        status: "approved",
        createdAt: { [Op.gte]: date },
      },
      include: [
        { association: "stats" },
        { model: User, as: "author" },
      ],
      order: [[sequelize.col("stats.view_count"), "DESC"]],
      limit: 10,
    });
  }

  // Get posts with pagination
  async getPostsWithPagination(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    const where = { status: filters.status || "approved" };

    if (filters.categoryId) {
      where.category_id = filters.categoryId;
    }

    const { rows, count } = await Post.findAndCountAll({
      where,
      include: [
        { model: User, as: "author" },
        { model: Category, as: "category" },
        { association: "stats" },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      distinct: true,
    });

    return {
      posts: rows,
      pagination: {
        page,
        pages: Math.ceil(count / limit),
        total: count,
        limit,
      },
    };
  }
}

module.exports = new EnhancedPostService();
