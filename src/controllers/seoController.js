const seoService = require("../services/seoService");
const { Post } = require("../models");

exports.getSEOGuide = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findByPk(postId, { include: ["Tags"] });

    if (!post) {
      return res.status(404).json({ error: "Bài viết không tồn tại" });
    }

    const readingTime = seoService.calculateReadingTime(post.content);
    const description = seoService.generateSEODescription(post.content);
    const keywords = seoService.generateKeywords(post.Tags);
    const seoScore = seoService.checkSEOScore(post);
    const ogTags = seoService.generateOGTags(post);

    res.json({
      readingTime,
      description,
      keywords,
      seoScore,
      ogTags,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.checkSEO = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findByPk(postId, { include: ["Tags"] });

    if (!post) {
      return res.status(404).json({ error: "Bài viết không tồn tại" });
    }

    const result = seoService.checkSEOScore(post);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.generateSitemap = async (req, res) => {
  try {
    const posts = await Post.findAll({
      where: { status: "approved" },
    });

    const sitemapData = posts.map((p) => seoService.formatSitemapPost(p));

    // Generate XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    sitemapData.forEach((item) => {
      xml += "  <url>\n";
      xml += `    <loc>${item.url}</loc>\n`;
      xml += `    <lastmod>${item.lastmod}</lastmod>\n`;
      xml += `    <changefreq>${item.changefreq}</changefreq>\n`;
      xml += `    <priority>${item.priority}</priority>\n`;
      xml += "  </url>\n";
    });

    xml += "</urlset>";

    res.type("application/xml");
    res.send(xml);
  } catch (error) {
    res.status(500).send("Lỗi: " + error.message);
  }
};

exports.getReadingTime = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findByPk(postId);

    if (!post) {
      return res.status(404).json({ error: "Bài viết không tồn tại" });
    }

    const readingTime = seoService.calculateReadingTime(post.content);
    res.json({ readingTime, postId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
