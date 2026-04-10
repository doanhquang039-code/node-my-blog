const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const UserActivity = sequelize.define(
  "UserActivity",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER },
    activity_type: {
      type: DataTypes.ENUM(
        "view_post",
        "like_post",
        "comment",
        "create_post",
        "login"
      ),
      allowNull: false,
    },
    post_id: { type: DataTypes.INTEGER, allowNull: true },
    details: { type: DataTypes.JSON, allowNull: true },
  },
  {
    tableName: "user_activities",
    timestamps: true,
    underscored: true,
  }
);

module.exports = UserActivity;
