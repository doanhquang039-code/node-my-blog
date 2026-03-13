const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Post = sequelize.define(
  "Post",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, field: "user_id" },
    categoryId: { type: DataTypes.INTEGER, field: "category_id" },
    title: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    content: { type: DataTypes.TEXT, allowNull: false },
    image: { type: DataTypes.STRING },
    status: {
      type: DataTypes.ENUM("draft", "published", "archived", "pending"), // Thêm pending cho khớp controller
      defaultValue: "pending",
    },
  },
  {
    tableName: "posts",
    timestamps: true, // Sếp nên để true để biết bài nào mới đăng
    underscored: true,
  }
);

// HOOK TỰ ĐỘNG: Tạo thống kê ngay sau khi tạo bài viết
// Sau khi định nghĩa Post.define(...)
Post.afterCreate(async (post, options) => {
  try {
    // Tự động tạo bản ghi thống kê cho bài viết mới
    const { PostAnalytics } = sequelize.models; 
    await PostAnalytics.create({
      post_id: post.id,
      view_count: 0,
      like_count: 0
    });
    console.log(`✅ Đã tạo thống kê cho bài viết ID: ${post.id}`);
  } catch (error) {
    console.error("❌ Lỗi tự động tạo thống kê:", error.message);
  }
});

module.exports = Post;