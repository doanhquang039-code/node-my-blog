const express = require("express");
const router = express.Router();
const seoController = require("../controllers/seoController");

// SEO routes
router.get("/guide/:postId", seoController.getSEOGuide);
router.get("/check/:postId", seoController.checkSEO);
router.get("/reading-time/:postId", seoController.getReadingTime);
router.get("/sitemap.xml", seoController.generateSitemap);

module.exports = router;
