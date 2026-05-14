const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Chatbot = sequelize.define(
  "Chatbot",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    question: { type: DataTypes.TEXT, allowNull: false },
    answer: { type: DataTypes.TEXT, allowNull: false },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "user_id",
    },
  },
  {
    tableName: "Chatbots",
    timestamps: true,
  },
);

module.exports = Chatbot;
