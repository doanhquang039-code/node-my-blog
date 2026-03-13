const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); // Đây phải là thực thể đã kết nối

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM("admin", "manager", "editor", "user"),
      defaultValue: "user",
    },
  },
  {
    tableName: "users",
    timestamps: false, // Khớp với file SQL của bạn (chỉ có create_at)
  },
);

module.exports = User;
