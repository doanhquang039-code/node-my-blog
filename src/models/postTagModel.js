const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const PostTag = sequelize.define(
  "PostTag",
  {
    postId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      field: "post_id",
      references: { model: "posts", key: "id" },
    },
    tag_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      field: "tag_id",
      references: { model: "tags", key: "id" },
    },
  },
  {
    tableName: "post_tag",
    timestamps: false,
  },
);

module.exports = PostTag;
