const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// --- 1. CÁC ROUTE TĨNH (PHẢI ĐỂ LÊN ĐẦU) ---

router.get(
  "/export/excel",
  authMiddleware,
  roleMiddleware(["admin"]),
  categoryController.exportExcel,
);

router.get(
  "/export/pdf",
  authMiddleware,
  roleMiddleware(["admin"]),
  categoryController.exportPDF,
);

// --- 2. CÁC ROUTE KHÁC ---

router.post(
  "/",
  authMiddleware,
  roleMiddleware(["admin", "manager"]),
  categoryController.create,
);

// --- 3. CÁC ROUTE CÓ BIẾN :id (PHẢI ĐỂ DƯỚI CÙNG) ---

router.post(
  "/delete/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  categoryController.delete,
);

router.get(
  "/edit/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  categoryController.getById,
);

router.post(
  "/update/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  categoryController.update,
);

module.exports = router;
