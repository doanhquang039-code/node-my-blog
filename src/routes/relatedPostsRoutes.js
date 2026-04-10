const express = require("express");
const router = express.Router();
const relatedPostsController = require("../controllers/relatedPostsController");

// Related posts routes
router.get("/post/:postId", relatedPostsController.getRelatedPosts);
router.get("/recommended/:userId", relatedPostsController.getRecommendedPosts);
router.get("/trending/:categoryId", relatedPostsController.getTrendingRelated);

module.exports = router;
