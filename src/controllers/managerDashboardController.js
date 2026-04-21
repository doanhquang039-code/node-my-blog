// src/controllers/managerDashboardController.js
const postService = require("../services/postService");
const categoryService = require("../services/categoryService");

exports.index = async (req, res) => {
  try {
    const allPosts = await postService.getAll();
    const categories = await categoryService.getAll();

    res.render("dashboards_manager/index", {
      user: req.user,
      posts: allPosts,
      categories: categories,
      title: "Khu vực Quản lý Nội dung",
    });
  } catch (error) {
    res.status(500).send("Lỗi tải Dashboard Manager");
  }
};
