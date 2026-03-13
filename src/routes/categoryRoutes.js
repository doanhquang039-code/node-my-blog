const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Route API cho Category
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["admin", "manager"]),
  categoryController.create,
);
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
