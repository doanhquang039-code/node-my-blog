const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware");
const postController = require("../controllers/postController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
router.post(
  "/approve/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  postController.approvePost,
);
router.get("/create", authMiddleware, postController.getCreateForm);
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["admin", "manager", "editor", "user"]),
  postController.getAll,
);
console.log(
  "Kiểm tra biến upload:",
  typeof upload.single === "function" ? "OK" : "LỖI",
);
router.post(
  "/create",
  authMiddleware,
  (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        console.error("❌ MULTER ERROR:", err.code, err.message);
        return res.status(400).send("Multer lỗi: " + err.code);
      } else if (err && err.message !== "Unexpected end of form") {
        console.error("❌ OTHER ERROR:", err.message);
        return res.status(400).send("Lỗi khác: " + err.message);
      }
      console.log("✅ MULTER OK - req.file:", req.file);
      next();
    });
  },
  postController.create,
);
router.post(
  "/delete/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  postController.delete,
);
router.get(
  "/export/excel",
  authMiddleware,
  roleMiddleware(["admin"]),
  postController.exportPostsExcel,
);
router.get(
  "/export/pdf",
  authMiddleware,
  roleMiddleware(["admin"]),
  postController.exportPostsPDF,
);
router.get("/view/:id", authMiddleware, postController.getPostDetail);
router.post("/like/:id", authMiddleware, postController.likePost);
router.get("/edit/:id", authMiddleware, postController.getEditForm);

router.post(
  "/edit/:id",
  authMiddleware,
  upload.single("image"),
  postController.updatePost,
);
router.post(
  "/edit/:id",
  authMiddleware,
  (req, res, next) => {
    console.log("✅ ROUTE POST /edit/:id được gọi, ID:", req.params.id);
    next();
  },
  upload.single("image"),
  (req, res, next) => {
    console.log(
      "✅ QUA UPLOAD MIDDLEWARE, file:",
      req.file ? "có file" : "không có file",
    );
    next();
  },
  postController.updatePost,
);
router.get("/search", authMiddleware, postController.searchPosts);
router.get("/hot", authMiddleware, postController.getHotPosts);
module.exports = router;
