const User = require("./userModel");
const Post = require("./postModel");
const Category = require("./categoryModel");
const Tag = require("./tagModel");
const Comment = require("./commentModel");
const PostTag = require("./postTagModel");

// 1. QUAN HỆ USERS - POSTS (1-N)
// 1. QUAN HỆ USERS - POSTS (1-N)
User.hasMany(Post, { foreignKey: "user_id", as: "posts" });
Post.belongsTo(User, { foreignKey: "user_id", as: "author" }); // Thêm as: "author" ở đây

// 2. QUAN HỆ CATEGORIES - POSTS (1-N)
Category.hasMany(Post, { foreignKey: "category_id", as: "posts" });
Post.belongsTo(Category, { foreignKey: "category_id", as: "category" }); // Thêm as: "category"

// ... Các quan hệ khác giữ nguyên ...

// 3. QUAN HỆ POSTS - TAGS (N-N qua PostTag)
Post.belongsToMany(Tag, {
  through: PostTag,
  foreignKey: "post_id",
  otherKey: "tag_id",
});
Tag.belongsToMany(Post, {
  through: PostTag,
  foreignKey: "tag_id",
  otherKey: "post_id",
});

// 4. QUAN HỆ COMMENTS (1-N)
User.hasMany(Comment, { foreignKey: "user_id" });
Comment.belongsTo(User, { foreignKey: "user_id" });

Post.hasMany(Comment, { foreignKey: "post_id" });
Comment.belongsTo(Post, { foreignKey: "post_id" });

module.exports = { User, Post, Category, Tag, Comment, PostTag };
// Xuất tất cả các Model để Service sử dụng
module.exports = {
  User,
  Post,
  Category,
  Tag,
  Comment,
  PostTag,
};
