const User = require("./userModel");
const Post = require("./postModel");
const Category = require("./categoryModel");
const Tag = require("./tagModel");
const Comment = require("./commentModel");
const PostTag = require("./postTagModel");
const PostAnalytics = require("./postAnalyticsModel");
const Newsletter = require("./newsletterModel");
const CommentRating = require("./commentRatingModel");
const UserActivity = require("./userActivityModel");
const ScheduledPost = require("./scheduledPostModel");

// 1. QUAN HỆ USERS - POSTS (1-N)
// Sếp dùng 'userId' vì trong Model Post mình đã map nó tới 'user_id'
// 1. QUAN HỆ USERS - POSTS (1-N)
User.hasMany(Post, { foreignKey: "user_id", as: "posts" });
Post.belongsTo(User, { foreignKey: "user_id", as: "author" });

// 2. QUAN HỆ CATEGORIES - POSTS (1-N)
Category.hasMany(Post, { foreignKey: "category_id", as: "posts" });
Post.belongsTo(Category, { foreignKey: "category_id", as: "category" });

// 3. QUAN HỆ POSTS - TAGS (N-N)
Post.belongsToMany(Tag, {
  through: PostTag,
  foreignKey: "post_id",
  otherKey: "tag_id",
  as: "tags",
});
Tag.belongsToMany(Post, {
  through: PostTag,
  foreignKey: "tag_id",
  otherKey: "post_id",
  as: "posts",
});
// src/models/index.js
User.hasMany(Comment, { foreignKey: "user_id", as: "userComments" });
Comment.belongsTo(User, { foreignKey: "user_id", as: "author" });

Post.hasMany(Comment, { foreignKey: "post_id", as: "comments" });
Comment.belongsTo(Post, { foreignKey: "post_id", as: "post" });
Post.hasOne(PostAnalytics, { foreignKey: "post_id", as: "stats" });
PostAnalytics.belongsTo(Post, { foreignKey: "post_id" });

// Comment ratings relationships
Comment.hasMany(CommentRating, { foreignKey: "comment_id", as: "ratings" });
CommentRating.belongsTo(Comment, { foreignKey: "comment_id" });
User.hasMany(CommentRating, { foreignKey: "user_id" });
CommentRating.belongsTo(User, { foreignKey: "user_id" });

// User activity relationships
User.hasMany(UserActivity, { foreignKey: "user_id", as: "activities" });
UserActivity.belongsTo(User, { foreignKey: "user_id" });
Post.hasMany(UserActivity, { foreignKey: "post_id" });
UserActivity.belongsTo(Post, { foreignKey: "post_id" });

// Scheduled posts relationships
Post.hasMany(ScheduledPost, { foreignKey: "post_id" });
ScheduledPost.belongsTo(Post, { foreignKey: "post_id" });

module.exports = {
  User,
  Post,
  Category,
  Tag,
  Comment,
  PostTag,
  PostAnalytics,
  Newsletter,
  CommentRating,
  UserActivity,
  ScheduledPost,
};
