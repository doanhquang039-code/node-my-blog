// Middleware to integrate analytics tracking
const { UserActivity } = require("../models");

const trackActivity = async (req, res, next) => {
  try {
    // Override res.json to log activity after response
    const originalJson = res.json;
    res.json = function (data) {
      // Log activity asynchronously
      if (req.user) {
        UserActivity.create({
          user_id: req.user.id,
          activity_type: "view_post",
          post_id: req.params.id || null,
          details: {
            path: req.path,
            method: req.method,
          },
        }).catch((err) => console.error("Activity tracking error:", err));
      }
      return originalJson.call(this, data);
    };
    next();
  } catch (error) {
    console.error("Activity middleware error:", error);
    next();
  }
};

module.exports = trackActivity;
