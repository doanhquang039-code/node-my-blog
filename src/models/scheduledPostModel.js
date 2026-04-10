const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ScheduledPost = sequelize.define(
  "ScheduledPost",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    post_id: { type: DataTypes.INTEGER, allowNull: false },
    scheduled_at: { type: DataTypes.DATE, allowNull: false },
    is_published: { type: DataTypes.BOOLEAN, defaultValue: false },
    published_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "scheduled_posts",
    timestamps: true,
    underscored: true,
  }
);

module.exports = ScheduledPost;
