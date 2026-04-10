const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");

// Analytics routes
router.get("/dashboard", analyticsController.getDashboard);
router.get("/post/:postId", analyticsController.getPostAnalytics);
router.get("/report", analyticsController.getReport);
router.get("/user/:userId", analyticsController.getUserAnalytics);

module.exports = router;
