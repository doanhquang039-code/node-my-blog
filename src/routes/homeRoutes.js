// src/routes/homeRoutes.js
router.get("/", homeController.index); // Trang chủ liệt kê bài viết
router.get("/post/:slug", homeController.detail); // Trang chi tiết bài viết
