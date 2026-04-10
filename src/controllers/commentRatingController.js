const commentRatingService = require("../services/commentRatingService");

exports.rateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { rating } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Cần đăng nhập" });
    }

    const result = await commentRatingService.rateComment(
      commentId,
      userId,
      rating
    );

    res.json({ message: "Đã đánh giá", result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getCommentRatings = async (req, res) => {
  try {
    const { commentId } = req.params;
    const ratings = await commentRatingService.getCommentRatings(commentId);

    res.json(ratings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTopRatedComments = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const comments = await commentRatingService.getTopRatedComments(
      parseInt(limit)
    );

    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.removeRating = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Cần đăng nhập" });
    }

    const deleted = await commentRatingService.removeRating(commentId, userId);

    if (deleted) {
      res.json({ message: "Đã xóa đánh giá" });
    } else {
      res.status(404).json({ error: "Không tìm thấy đánh giá" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
