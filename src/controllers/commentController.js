// src/controllers/commentController.js
const commentService = require("../services/commentService");

exports.addComment = async (req, res) => {
  try {
    const { postId, content } = req.body;

    await commentService.create({
      postId: postId,
      userId: req.user.id,
      content: content,
    });

    // Đừng dùng "back" nữa sếp ơi, điều hướng thẳng về trang detail luôn
    // Giả sử trang chi tiết của sếp là /admin/posts/view/:id
    res.redirect(`/admin/posts/view/${postId}`);
  } catch (error) {
    console.error("Lỗi cmt:", error.message);
    res.status(500).send("Lỗi: " + error.message);
  }
};
// src/controllers/commentController.js
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    await commentService.delete(id);

    // Lấy trang trước đó, nếu không thấy thì về trang danh sách post cho an toàn
    const backURL = req.get("Referer") || "/admin/posts";
    res.redirect(backURL);
  } catch (error) {
    console.error("Lỗi xóa cmt:", error.message);
    res.status(500).send("Lỗi: " + error.message);
  }
};
// src/controllers/commentController.js
// src/controllers/commentController.js

exports.updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    await commentService.update(id, content);

    // Dùng cái này cho chắc chắn, không lo lỗi /back nữa
    res.redirect(req.get("Referer") || "/admin/posts");
  } catch (error) {
    console.error("Lỗi update cmt:", error.message);
    res.status(500).send("Lỗi: " + error.message);
  }
};
