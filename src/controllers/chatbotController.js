// src/controllers/chatbotController.js
const chatbotService = require('../services/chatbotService');

exports.askAI = async (req, res) => {
  try {
    const { question } = req.body;
    const userId = req.user.id; // Lấy từ authMiddleware

    // 1. Giả lập câu trả lời của AI (Sếp có thể thay bằng gọi API Gemini/OpenAI tại đây)
    const aiResponse = `Chào sếp ${req.user.name}, em đã nhận được câu hỏi: "${question}". Hệ thống AI đang được tích hợp...`;

    // 2. Lưu vào Database
    const newChat = await chatbotService.saveChat(userId, question, aiResponse);

    // 3. Trả về cho giao diện (JSON để AJAX xử lý)
    res.json({
      success: true,
      question: newChat.question,
      answer: newChat.answer
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const history = await chatbotService.getChatHistory(req.user.id);
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};