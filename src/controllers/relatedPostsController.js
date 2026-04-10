const relatedPostsService = require("../services/relatedPostsService");

exports.getRelatedPosts = async (req, res) => {
  try {
    const { postId } = req.params;
    const { limit = 5 } = req.query;

    const relatedPosts = await relatedPostsService.getRelatedPosts(
      postId,
      parseInt(limit)
    );

    res.json(relatedPosts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRecommendedPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 6 } = req.query;

    const recommended = await relatedPostsService.getRecommendedPosts(
      userId,
      parseInt(limit)
    );

    res.json(recommended);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTrendingRelated = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { limit = 5 } = req.query;

    const trending = await relatedPostsService.getTrendingRelated(
      categoryId,
      parseInt(limit)
    );

    res.json(trending);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
