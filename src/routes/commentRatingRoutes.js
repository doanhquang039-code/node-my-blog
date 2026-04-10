const express = require("express");
const router = express.Router();
const commentRatingController = require("../controllers/commentRatingController");
const authMiddleware = require("../middlewares/authMiddleware");

// Comment rating routes
router.post("/:commentId/rate", authMiddleware, commentRatingController.rateComment);
router.get("/:commentId/ratings", commentRatingController.getCommentRatings);
router.get("/top-rated", commentRatingController.getTopRatedComments);
router.delete("/:commentId/rating", authMiddleware, commentRatingController.removeRating);

module.exports = router;
