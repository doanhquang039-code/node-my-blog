const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const CommentRating = sequelize.define(
  "CommentRating",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    comment_id: { type: DataTypes.INTEGER },
    user_id: { type: DataTypes.INTEGER },
    rating: { type: DataTypes.ENUM("helpful", "unhelpful"), allowNull: false },
  },
  {
    tableName: "comment_ratings",
    timestamps: true,
    underscored: true,
  }
);

module.exports = CommentRating;
