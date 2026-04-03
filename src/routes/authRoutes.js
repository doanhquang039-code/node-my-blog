const express = require("express");
const router = express.Router();
const categoryService = require("../services/categoryService");
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const postService = require("../services/postService");

// --- VIEW ROUTES ---
router.get("/", (req, res) => res.render("index"));
router.get("/login", (req, res) => res.render("login"));
router.get("/register", (req, res) => res.render("register"));

router.get(
  "/admin",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const categories = await categoryService.getAll();
      res.render("dashboards/admin", { user: req.user, categories });
    } catch (error) {
      res.status(500).send("Lỗi tải dữ liệu Admin");
    }
  },
);

router.get(
  "/manager",
  authMiddleware,
  roleMiddleware(["manager"]), // ✅ Bỏ admin ra - admin không cần vào trang manager
  async (req, res) => {
    try {
      const [posts, categories] = await Promise.all([
        postService.getAll(),
        categoryService.getAll(),
      ]);
      res.render("dashboards_manager/manager", {
        user: req.user,
        posts,
        categories,
      });
    } catch (error) {
      res.status(500).send("Lỗi tải dữ liệu Manager");
    }
  },
);

router.get(
  "/editor",
  authMiddleware,
  roleMiddleware(["editor"]), // ✅ Bỏ admin ra
  async (req, res) => {
    try {
      const posts = await postService.getAll();
      res.render("dashboards_editor/editor", { user: req.user, posts });
    } catch (error) {
      res.status(500).send("Lỗi tải dữ liệu Editor");
    }
  },
);

router.get(
  "/user",
  authMiddleware,
  roleMiddleware(["user"]), // ✅ THÊM roleMiddleware - đây là lỗi chính!
  async (req, res) => {
    try {
      const posts = await postService.getAll();
      res.render("dashboards_user/user", { user: req.user, posts });
    } catch (error) {
      res.status(500).send("Lỗi tải dữ liệu User");
    }
  },
);

// ✅ Bỏ router.post("/register") trùng lặp
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/logout", authMiddleware, authController.logout);

module.exports = router;
