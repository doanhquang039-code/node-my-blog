const { Post, User, Category, PostAnalytics, Tag } = require("../models/index");
class PostService {
  // src/services/postService.js
  async getAll() {
    return await Post.findAll({
      include: [
        { model: User, as: "author", attributes: ["name"] },
        { model: Category, as: "category", attributes: ["name"] },
        // Đảm bảo as: "tags" viết thường y hệt như này sếp nhé
        { model: Tag, as: "tags", attributes: ["name"] },
        { model: PostAnalytics, as: "stats" },
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
  // Thêm vào trong class PostService
  async updateStatus(id, status) {
    return await Post.update({ status }, { where: { id } });
  }
  // Thêm vào trong class PostService sếp nhé
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
