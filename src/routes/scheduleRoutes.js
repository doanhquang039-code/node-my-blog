const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/scheduleController");

// Schedule routes
router.post("/", scheduleController.schedulePost);
router.get("/", scheduleController.getScheduledPosts);
router.put("/:scheduleId", scheduleController.updateSchedule);
router.delete("/:scheduleId", scheduleController.cancelSchedule);
router.post("/publish", scheduleController.publishScheduled);

module.exports = router;
