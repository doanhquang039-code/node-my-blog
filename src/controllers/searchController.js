const searchService = require("../services/searchService");

exports.search = async (req, res) => {
  try {
    const { q, category, tag, sort = "latest", page = 1, limit = 10 } =
      req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: "Vui lòng nhập từ khóa tìm kiếm" });
    }

    const results = await searchService.searchPosts(
      q,
      {
        categoryId: category,
        tagId: tag,
        sortBy: sort,
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
      }
    );

    res.render("search/results", { ...results, query: q });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.searchAPI = async (req, res) => {
  try {
    const { q, category, tag, sort = "latest", page = 1, limit = 10 } =
      req.query;

    const results = await searchService.searchPosts(q, {
      categoryId: category,
      tagId: tag,
      sortBy: sort,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.trending = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const posts = await searchService.getTrendingPosts(parseInt(days));
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.searchStats = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: "Query required" });

    const stats = await searchService.getSearchStats(q);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
