const express = require("express");
const router = express.Router();
const searchController = require("../controllers/searchController");

// Search routes
router.get("/", searchController.search);
router.get("/api", searchController.searchAPI);
router.get("/trending", searchController.trending);
router.get("/stats", searchController.searchStats);

module.exports = router;
