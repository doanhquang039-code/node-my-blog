const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// 1. TRANG DANH SÁCH BÀI VIẾT (Cho all vào xem)
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["admin", "manager", "editor", "user"]),
  postController.getAll,
);

// 2. TRANG TẠO BÀI VIẾT (Ai login rồi cũng được viết bài)
router.get("/create", authMiddleware, postController.getCreateForm);
router.post("/create", authMiddleware, postController.create);

// 4. DUYỆT BÀI VIẾT (Chỉ Admin và Manager mới có quyền này)
router.post(
  "/approve/:id",
  authMiddleware,
  roleMiddleware(["admin", "manager"]),
  postController.approvePost,
);

// 5. XÓA BÀI VIẾT (Riêng cái này sếp nên để mỗi Admin làm cho chắc)
router.post(
  "/delete/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  postController.delete,
);

module.exports = router;
