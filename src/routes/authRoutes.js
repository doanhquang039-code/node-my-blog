const express = require("express");
const router = express.Router();
const categoryService = require("../services/categoryService");
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// --- VIEW ROUTES ---
router.get("/", (req, res) => res.render("index"));
router.get("/login", (req, res) => res.render("login"));
router.get("/register", (req, res) => res.render("register"));
// src/routes/authRoutes.js
router.get(
  "/admin",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const categories = await categoryService.getAll(); // Phải lấy dữ liệu ở đây
      res.render("dashboards/admin", {
        user: req.user,
        categories: categories, // Phải truyền biến này vào view
      });
    } catch (error) {
      res.status(500).send("Lỗi tải dữ liệu");
    }
  },
);
router.get(
  "/manager",
  authMiddleware,
  roleMiddleware(["admin", "manager"]),
  (req, res) => {
    res.render("dashboards/manager", { user: req.user });
  },
);

router.get(
  "/editor",
  authMiddleware,
  roleMiddleware(["admin", "editor"]),
  (req, res) => {
    res.render("dashboards/editor", { user: req.user });
  },
);

router.get("/user", authMiddleware, (req, res) => {
  res.render("dashboards/user", { user: req.user });
});

// --- API ROUTES ---
router.post("/register", authController.register);
router.post("/login", authController.login);
// src/routes/authRoutes.js
router.get("/logout", authMiddleware, authController.logout); // Đổi post thành get
module.exports = router;
