const { Post, User, Category, PostAnalytics, Tag } = require("../models/index");
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
  // src/services/postService.js
  async getPublishedPosts() {
    return await Post.findAll({
      where: { status: "approved" }, // Chỉ lấy bài đã lên sóng
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
      where: { status: "pending" }, // Chỉ lấy bài chờ duyệt
      include: [
        { model: User, as: "author", attributes: ["name"] },
        { model: Category, as: "category", attributes: ["name"] },
      ],
      order: [["createdAt", "DESC"]],
    });
  }
  async getById(id) {
    return await Post.findByPk(id, {
      include: [
        { model: User, as: "author", attributes: ["name"] },
        { model: Category, as: "category", attributes: ["name"] },
      ],
    });
  }
}

module.exports = new PostService();
