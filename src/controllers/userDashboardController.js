// src/controllers/userDashboardController.js
const postService = require("../services/postService");
const chatbotService = require("../services/chatbotService");

exports.index = async (req, res) => {
  try {
    // Lấy bài viết mới nhất cho User xem
    const latestPosts = await postService.getLatest(5);
    // Lấy lịch sử chat của chính User đó
    const chatHistory = await chatbotService.getChatHistory(req.user.id);

    res.render("dashboards_user/index", {
      user: req.user,
      posts: latestPosts,
      chats: chatHistory,
      title: "Bảng điều khiển Thành viên",
    });
  } catch (error) {
    res.status(500).send("Lỗi tải Dashboard User");
  }
};
