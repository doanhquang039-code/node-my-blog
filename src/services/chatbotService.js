// src/services/chatbotService.js
const { Chatbot, User } = require('../models');

class ChatbotService {
  // Lưu tin nhắn vào DB
  async saveChat(userId, question, answer) {
    try {
      return await Chatbot.create({
        userId,
        question,
        answer
      });
    } catch (error) {
      console.error("Lỗi lưu lịch sử chat:", error.message);
      throw error;
    }
  }

  // Lấy lịch sử chat của một User (ví dụ lấy 20 câu gần nhất)
  async getChatHistory(userId) {
    try {
      return await Chatbot.findAll({
        where: { userId },
        include: [{ model: User, as: 'author', attributes: ['name'] }],
        order: [['createdAt', 'ASC']],
        limit: 20
      });
    } catch (error) {
      console.error("Lỗi lấy lịch sử chat:", error.message);
      throw error;
    }
  }
}

module.exports = new ChatbotService();