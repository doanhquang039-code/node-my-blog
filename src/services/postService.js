const {
  Post,
  User,
  Category,
  PostAnalytics,
  Tag,
  Comment,
} = require("../models/index");
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
      where: { status: "pending" }, // Chỉ lấy bài chờ duyệt
      include: [
        { model: User, as: "author", attributes: ["name"] },
        { model: Category, as: "category", attributes: ["name"] },
      ],
      order: [["createdAt", "DESC"]],
    });
  }
  async getById(id) {
    try {
      const post = await Post.findByPk(id, {
        include: [
          // 1. Lấy thông tin tác giả bài viết
          { model: User, as: "author", attributes: ["id", "name", "role"] },

          // 2. Lấy danh mục bài viết
          { model: Category, as: "category", attributes: ["name"] },

          // 3. Lấy danh sách Tags (data sạch không kèm bảng trung gian)
          { model: Tag, as: "tags", through: { attributes: [] } },

          // 4. Lấy thống kê lượt xem/thích
          { model: PostAnalytics, as: "stats" },

          // 5. QUAN TRỌNG: Lấy bình luận và người bình luận
          {
            model: Comment,
            as: "comments",
            include: [
              { model: User, as: "author", attributes: ["name"] }, // Lấy tên người cmt
            ],
          },
        ],
        // Sắp xếp bình luận mới nhất lên đầu cho sếp dễ đọc
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
}
module.exports = new PostService();
