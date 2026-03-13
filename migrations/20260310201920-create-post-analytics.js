'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PostAnalytics', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      post_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { 
          model: 'Posts', // Tên bảng phải khớp với database
          key: 'id' 
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // Xóa bài viết là xóa luôn thống kê cho sạch DB
      },
      view_count: { 
        type: Sequelize.INTEGER, 
        defaultValue: 0 // Mặc định mới tạo là 0 lượt xem
      },
      like_count: { 
        type: Sequelize.INTEGER, 
        defaultValue: 0 // Mặc định là 0 lượt thích
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('PostAnalytics');
  }
};