const { Comment, User } = require("../models");
class CommentService {
  async create(data) {
    return await Comment.create(data);
  }
  async getByPost(postId) {
    return await Comment.findAll({
      where: { postId: postId }, // Dùng postId cho khớp Model
      include: [{ model: User, as: "author", attributes: ["name"] }],
      order: [["id", "DESC"]], // Thêm dòng này nè sếp
    });
  }
  async delete(id) {
    return await Comment.destroy({
      where: { id: id },
    });
  }
  async update(id, data) {
    return await Comment.update(data, {
      where: { id: id },
    });
  }
}
module.exports = new CommentService();
