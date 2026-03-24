const {
  Post,
  User,
  Category,
  PostAnalytics,
  Tag,
  Comment,
} = require("../models/index");
const { Op } = require("sequelize");
class PostService {
  async getAll() {
    return await Post.findAll({
      include: [
        { model: User, as: "author", attributes: ["name"] },
        { model: Category, as: "category", attributes: ["name"] },
        { model: Tag, as: "tags", attributes: ["name"] },
        { model: PostAnalytics, as: "stats" },
      ],
      order: [["createdAt", "DESC"]],
    });
  }
  async getPublishedPosts() {
    return await Post.findAll({
      where: { status: "approved" },
      include: [
        { model: User, as: "author", attributes: ["name"] },
        { model: Category, as: "category" },
        { model: Tag, as: "tags" },
      ],
      order: [["createdAt", "DESC"]],
    });
  }
  async create(data) {
    return await Post.create(data);
  }
  async delete(id) {
    return await Post.destroy({
      where: { id: id },
    });
  }
  async update(id, data) {
    try {
      const post = await Post.findByPk(id);
      if (!post) throw new Error("Không tìm thấy bài viết để cập nhật");
      return await post.update(data);
    } catch (error) {
      console.error("Lỗi update bài viết trong Service:", error.message);
      throw error;
    }
  }
  async updateStatus(id, status) {
    return await Post.update({ status }, { where: { id } });
  }
  async getDetail(slug) {
    return await Post.findOne({
      where: { slug: slug, status: "approved" },
      include: [
        { model: User, as: "author", attributes: ["name"] },
        { model: Tag, as: "tags" },
        {
          model: Comment,
          as: "comments",
          include: [{ model: User, as: "author", attributes: ["name"] }], // Lấy luôn tên người cmt
        },
      ],
    });
  }
  async getPendingPosts() {
    return await Post.findAll({
      where: { status: "pending" },
      include: [
        { model: User, as: "author", attributes: ["name"] },
        { model: Category, as: "category", attributes: ["name"] },
      ],
      order: [["createdAt", "DESC"]],
    });
  }

  // 1. Tăng lượt xem (Dùng findOrCreate để tránh lỗi nếu chưa có dòng data nào)
  async incrementView(postId) {
    // Chỉ tìm bài viết nếu nó đã được 'approved'
    const post = await Post.findOne({
      where: { id: postId, status: "approved" },
    });
    if (!post) return null; // Bài chưa duyệt thì nghỉ, không tăng view

    const [analytics, created] = await PostAnalytics.findOrCreate({
      where: { post_id: postId },
      defaults: { view_count: 1 },
    });
    if (!created) {
      await analytics.increment("view_count", { by: 1 });
    }
    return analytics;
  }

  async incrementLike(postId) {
    // Tương tự, chỉ cho like bài đã duyệt
    const post = await Post.findOne({
      where: { id: postId, status: "approved" },
    });
    if (!post)
      throw new Error("Bài viết chưa được công khai, không thể like sếp ơi!");

    const [analytics, created] = await PostAnalytics.findOrCreate({
      where: { post_id: postId },
      defaults: { like_count: 1 },
    });
    if (!created) {
      await analytics.increment("like_count", { by: 1 });
    }
    return analytics;
  }
  async getById(id) {
    try {
      const post = await Post.findByPk(id, {
        include: [
          { model: User, as: "author", attributes: ["id", "name", "role"] },
          { model: Category, as: "category", attributes: ["name"] },
          { model: Tag, as: "tags", through: { attributes: [] } },
          { model: PostAnalytics, as: "stats" },
          {
            model: Comment,
            as: "comments",
            include: [
              { model: User, as: "author", attributes: ["name"] }, // Lấy tên người cmt
            ],
          },
        ],
        order: [[{ model: Comment, as: "comments" }, "id", "DESC"]],
      });

      console.log(
        `==> Check bài ID ${id}: Tags(${post?.tags?.length || 0}), Comments(${post?.comments?.length || 0})`,
      );
      return post;
    } catch (error) {
      console.error("Lỗi getById chi tiết:", error.message);
      throw error;
    }
  }
  async searchByAuthorName(authorName) {
    return await Post.findAll({
      include: [
        {
          model: User,
          as: "author",
          where: {
            name: { [Op.like]: `%${authorName}%` },
          },
          attributes: ["id", "name", "role"],
        },
        { model: Category, as: "category", attributes: ["name"] },
        { model: PostAnalytics, as: "stats" },
      ],
      order: [["createdAt", "DESC"]],
    });
  }
  // 2. Sắp xếp bài viết ĐÃ DUYỆT theo View hoặc Like nhiều nhất
  async getTopApprovedPosts(type = "view_count", limit = 10) {
    return await Post.findAll({
      where: { status: "approved" },
      include: [
        { model: User, as: "author", attributes: ["name"] },
        { model: Category, as: "category", attributes: ["name"] },
        {
          model: PostAnalytics,
          as: "stats",
          required: true, // Chỉ lấy những bài đã có bản ghi stats
        },
      ],
      order: [[{ model: PostAnalytics, as: "stats" }, type, "DESC"]],
      limit: limit,
    });
  }
}
module.exports = new PostService();
