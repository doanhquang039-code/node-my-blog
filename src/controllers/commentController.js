const commentService = require("../services/commentService");
exports.create = async (req, res) => {
  try {
    const { content, post_id } = req.body;
    const commentData = {
      content,
      post_id,
      user_id: req.user.id,
    };
    res.redirect("back");
  } catch (error) {
    res.status(400).send("Lỗi: " + error.message);
  }
};
