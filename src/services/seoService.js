class SEOService {
  // Calculate reading time
  calculateReadingTime(content) {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return Math.max(1, readingTime); // Minimum 1 minute
  }

  // Generate SEO description
  generateSEODescription(content, maxLength = 160) {
    const stripped = content.replace(/<[^>]*>/g, "");
    const description = stripped.substring(0, maxLength);
    return description.endsWith(".")
      ? description
      : description.substring(0, description.lastIndexOf(" ")) + "...";
  }

  // Generate meta keywords from tags
  generateKeywords(tags) {
    if (!tags || tags.length === 0) return ["blog"];
    return tags.map((tag) => tag.name);
  }

  // Generate sitemap data
  formatSitemapPost(post) {
    return {
      url: `${process.env.APP_URL}/posts/${post.slug}`,
      lastmod: new Date(post.updatedAt).toISOString().split("T")[0],
      changefreq: "weekly",
      priority: post.stats?.view_count > 100 ? 0.8 : 0.6,
    };
  }

  // Generate Open Graph meta tags
  generateOGTags(post) {
    return {
      "og:title": post.title,
      "og:description":
        this.generateSEODescription(post.content) || post.title,
      "og:image": post.image || `${process.env.APP_URL}/default-og.jpg`,
      "og:url": `${process.env.APP_URL}/posts/${post.slug}`,
      "og:type": "article",
      "article:published_time": post.createdAt,
      "article:author": post.author?.name || "Author",
    };
  }

  // Check SEO score (basic)
  checkSEOScore(post) {
    let score = 0;
    const issues = [];

    // Title check
    if (post.title.length >= 30 && post.title.length <= 60) {
      score += 20;
    } else {
      issues.push(
        `Tiêu đề nên từ 30-60 ký tự (hiện tại: ${post.title.length})`
      );
    }

    // Description check
    const desc = this.generateSEODescription(post.content);
    if (desc.length >= 120 && desc.length <= 160) {
      score += 20;
    } else {
      issues.push(
        `Mô tả nên từ 120-160 ký tự (hiện tại: ${desc.length})`
      );
    }

    // Content length
    const wordCount = post.content.split(/\s+/).length;
    if (wordCount >= 300) {
      score += 20;
    } else {
      issues.push(`Nội dung tối thiểu 300 từ (hiện tại: ${wordCount})`);
    }

    // Image check
    if (post.image) {
      score += 20;
    } else {
      issues.push("Thêm hình ảnh đặc trưng");
    }

    // Tags check
    if (post.Tags && post.Tags.length >= 3) {
      score += 20;
    } else {
      issues.push("Thêm ít nhất 3 tag");
    }

    return {
      score: Math.min(100, score),
      issues,
    };
  }
}

module.exports = new SEOService();
