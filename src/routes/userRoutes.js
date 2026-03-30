const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
router.get(
  "/export/pdf",
  authMiddleware,
  roleMiddleware(["admin"]),
  userController.exportUsersPDF,
);
router.post(
  "/delete/:id", // Thêm dấu / ở đây sếp nhé
  authMiddleware,
  roleMiddleware(["admin"]),
  userController.delete,
);
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["admin", "manager"]),
  userController.getAll,
);
router.post(
  "/update/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  userController.update,
);
router.get(
  "/edit/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  userController.getById,
);
router.get(
  "/create",
  authMiddleware,
  roleMiddleware(["admin"]),
  userController.getCreateForm,
);

// Xử lý lưu User mới vào Database
router.post(
  "/create",
  authMiddleware,
  roleMiddleware(["admin"]),
  userController.create,
);
// QUAN TRỌNG NHẤT: Phải có dòng này để app.js nhận được router
module.exports = router;
