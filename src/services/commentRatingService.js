const { Comment, CommentRating } = require("../models");

class CommentRatingService {
  // Rate a comment
  async rateComment(commentId, userId, rating) {
    if (!["helpful", "unhelpful"].includes(rating)) {
      throw new Error("Loại đánh giá không hợp lệ");
    }

    const [commentRating, created] = await CommentRating.findOrCreate({
      where: {
        comment_id: commentId,
        user_id: userId,
      },
      defaults: {
        comment_id: commentId,
        user_id: userId,
        rating,
      },
    });

    if (!created) {
      // Update existing rating
      commentRating.rating = rating;
      await commentRating.save();
    }

    return commentRating;
  }

  // Get comment rating summary
  async getCommentRatings(commentId) {
    const ratings = await CommentRating.findAll({
      where: { comment_id: commentId },
      attributes: [
        "rating",
        [require("sequelize").fn("COUNT", "*"), "count"],
      ],
      group: ["rating"],
      raw: true,
    });

    const summary = {
      helpful: 0,
      unhelpful: 0,
    };

    ratings.forEach((r) => {
      summary[r.rating] = parseInt(r.count);
    });

    return {
      helpful: summary.helpful,
      unhelpful: summary.unhelpful,
      total: summary.helpful + summary.unhelpful,
      score:
        summary.helpful + summary.unhelpful > 0
          ? Math.round(
            (summary.helpful /
              (summary.helpful + summary.unhelpful)) *
            100
          )
          : 0,
    };
  }

  // Get top rated comments
  async getTopRatedComments(limit = 10) {
    const comments = await Comment.findAll({
      include: [
        {
          model: CommentRating,
          attributes: ["rating"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Calculate score
    const scored = comments
      .map((comment) => {
        const ratings = comment.get("CommentRatings") || [];
        const helpful = ratings.filter((r) => r.rating === "helpful").length;
        const unhelpful = ratings.filter(
          (r) => r.rating === "unhelpful"
        ).length;
        const total = helpful + unhelpful;
        const score = total > 0 ? Math.round((helpful / total) * 100) : 0;

        return {
          ...comment.toJSON(),
          helpfulCount: helpful,
          unhelpfulCount: unhelpful,
          score,
        };
      })
      .filter((c) => c.score > 70)
      .slice(0, limit);

    return scored;
  }

  // Remove rating
  async removeRating(commentId, userId) {
    const deleted = await CommentRating.destroy({
      where: {
        comment_id: commentId,
        user_id: userId,
      },
    });
    return deleted > 0;
  }
}

module.exports = new CommentRatingService();
