const express = require("express");
const router = express.Router();
const activityController = require("../controllers/activityController");
const authMiddleware = require("../middlewares/authMiddleware");

// Activity tracking routes
router.post("/log", authMiddleware, activityController.logActivity);
router.get("/user/:userId/history", activityController.getUserActivityHistory);
router.get("/user/:userId/stats", activityController.getActivityStats);
router.get("/platform", activityController.getPlatformActivity);

module.exports = router;
